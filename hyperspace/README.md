# Getting Started With Hyperspace

Hyperspace is a server that bundles together many of our core modules, handling many low-level details for you. It's intended to be a configuration-less, opinionated take on the Hypercore Protocol stack, with a handful of extra features to make things easy to use.

Hyperspace handles P2P connectivity, Hypercore garbage collection, and storage management. It and exposes an [RPC interface](https://github.com/hypercore-protocol/hyperspace-rpc) that's used to power `RemoteHypercore` and `RemoteNetworker` APIs.  

A `RemoteHypercore` can generally be viewed as a drop-in replacement for a regular Hypercore, and a `RemoteNetworker` mirrors the [@corestore/networker](https://github.com/andrewosh/corestore-networker) API.

## Installation

There are three ways to get started with Hyperspace:
1. [Hyp CLI](https://hypercore-protocol.org/guides/hyp): The `hyp` CLI tool will internally spawn and communicate with a Hyperspace instance.
2. Standalone: `npm i hyperspace -g` gives you a `hyperspace` command that can be used to start a server.
2. Programmatically: The `hyperspace` module exports a `Server` class.

While we recommend using the Hyp CLI in most cases, this walkthrough will show you how to programmatically work with Hyperspace servers and clients.

This walkthrough has a single dependency, `hyperspace` (not including `chalk`, for making CLI output pretty), which exports both the client and the server. Before jumping into Step 1, make sure to install:
```
> npm i
```

## [Step 1](/1-start-servers.js): Starting Two Hyperspace Servers

Let's create two Hyperspace servers, one simulating our local instance, and one simulating a remote peer:
```js
// Create one server to simulate your local Hyperspace instance.
const localServer = new HyperspaceServer({
  storage: './storage/hyperspace-storage-1',
  host: 'hyperspace-demo-1'
})
// Create a second server to simulate a remote peer.
const remoteServer = new HyperspaceServer({
  storage: './storage/hyperspace-storage-2',
  host: 'hyperspace-demo-2'
})
await localServer.ready()
await remoteServer.ready()
```

The `storage` option defines where Hypercores will be stored on disk. By default, they will be saved to `~/.hyperspace/storage`. The `host` option is more nuanced, and is described below.

A Hyperspace server emits a handful of events, which are useful for debugging, so let log a few of these to see when clients connect and disconnect:
```js
localServer.on('client-open', () => {
  console.log(chalk.green('(local) A HyperspaceClient has connected'))
})
localServer.on('client-close', () => {
  console.log(chalk.green('(local) A HyperspaceClient has disconnected'))
})

remoteServer.on('client-open', () => {
  console.log(chalk.blue('(remote) A HyperspaceClient has connected'))
})
remoteServer.on('client-close', () => {
  console.log(chalk.blue('(remote) A HyperspaceClient has disconnected'))
})
```

Now that both peers are running, let's simulate a Hypercore replication in Step 2.

#### Hosts and Ports

By default, Hyperspace serves its RPC interface over a UNIX domain socket on Linux/OSX and a named pipe on Windows. You can configure the name of the domain socket with the `host` option, or with the `HYPERSPACE_SOCKET` environment variable.

If both `host` and `port` options are provided, it will instead bind to a TCP server. Importantly, Hyperspace does not provide any authentication or encryption over these connections, as they're expected to be local. If you want to accept remote connections, you'll need to add a separate auth layer, and nothing is provided out of the box.

#### Shutting Down Hyperspace

You can shut down a Hyperspace server with the `close` method. Internally, this will shut down a Hyperswarm instance, which might involve unannouncing many discovery keys (depending on how many Hypercores the server instance is managing).

This Hyperswarm shutdown can take a few seconds, sometimes up to 10.

## [Step 2](2-replicate-hypercores.js): Replicate RemoteHypercores

First, we'll create two Hyperspace clients, one for each server we started in Step 1:

```js
// Create a client that's connected to the "local" peer.
const localClient = new HyperspaceClient({
  host: 'hyperspace-demo-1'
})

// Create a client that's connected to the "remote" peer.
const remoteClient = new HyperspaceClient({
  host: 'hyperspace-demo-2'
})
```

Now on the "local" peer, let's create a new RemoteHypercore and append a few blocks. Since RemoteHypercore mirrors the Hypercore API, they can be used interchangably (in Hyperdrive and Hyperbee, for example).

```js
// Create a new RemoteCorestore.
const localStore = localClient.corestore()

// Create a fresh Remotehypercore.
const localCore = localStore.get({
  valueEncoding: 'utf-8'
})

// Append two blocks to the RemoteHypercore.
await localCore.append(['hello', 'world'])
```

To create a RemoteHypercore, we first need to create a RemoteCorestore instance. As with the other Remote* classes, RemoteCorestore mirrors the [Corestore API](https://github.com/hypercore-protocol/corestore). A Corestore can be viewed as a Hypercore factory -- it provides a `get` method for creating or cloning Hypercores.

Now we want to make this new Hypercore available to the Hyperswarm network. There are two ways to do this:
1. Through the RemoteNetworker API on `client.network`.
2. Through the `client.replicate` function.

For this walkthrough, we'll use the `replicate` function, and we'll also log whenever the Hypercore connects to new peers:
```js
// Log when the core has any new peers.
localCore.on('peer-add', () => {
  console.log(chalk.blue('(local) Replicating with a new peer.'))
})

// Start seeding the Hypercore on the Hyperswarm network.
localClient.replicate(localCore)
```

To understand why you might choose the `replicate` function over the RemoteNetworker API, here's a quick breakdown of Hyperspace's networking options.

#### Hyperspace Networking

Hyperswarm provides two configuration options for interacting with its DHT, __`announce`__ and __`lookup`__. When you announce a discovery key, you advertise to the DHT that you're in possession of the corresponding Hypercore. 

A lookup, on the other hand, will not insert new entries into the DHT, it will only query the DHT to discover other peers announcing that discovery key.

The [Hyperswarm Walkthrough](/guides/hyperswarm) covers this in more detail.

Hyperswarm's RemoteNetworker API provides a `configure` method with `announce` and `lookup` options, letting you configure swarm options more directly.

In many cases, you just want to make a RemoteHypercore available to the network, without worrying about the specifics. The Hyperspace client's `replicate` function takes a RemoteHypercore as its one argument: `client.replicate(core)` is effectively sugaring around `client.network.configure(core.discoveryKey, { announce: true, lookup: true })`.

### Replicate With a Second RemoteHypercore

The first RemoteHypercore contains two blocks, and is now being announced on the Hyperswarm DHT. It's time to create a RemoteHypercore on the second Hyperspace instance, which is simulating a remote peer.

To do this, we'll duplicate the exact same steps as above, with one difference: we'll instantiate the second RemoteHypercore with the first core's key:

```js
// Create a fresh Remotehypercore.
// Here we'll get a core using the shared key from above.
const clone = remoteStore.get({
  key: localCore.key,
  valueEncoding: 'utf-8'
})
```

After an identical `replicate` step on the `remoteClient`, the two Hypercores will be connected:
```js
// Start seeding the clone (this will connect to the first Hyperspace instance)
remoteClient.replicate(clone)
```

And finally the remote peer can read out the first two blocks:
```js
console.log(chalk.green('First two blocks of the clone:', [
  await clone.get(0),
  await clone.get(1)
]))
```
