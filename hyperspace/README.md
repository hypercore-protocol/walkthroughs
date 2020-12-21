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

### Hosts and Ports

By default, Hyperspace serves its RPC interface over a UNIX domain socket on Linux/OSX and a named pipe on Windows. You can configure the name of the domain socket with the `host` option, or with the `HYPERSPACE_SOCKET` environment variable.

If both `host` and `port` options are provided, it will instead bind to a TCP server. Importantly, Hyperspace does not provide any authentication or encryption over these connections, as they're expected to be local. If you want to accept remote connections, you'll need to add a separate auth layer, and nothing is provided out of the box.

### Shutting Down Hyperspace

You can shut down a Hyperspace server with the `close` method. Internally, this will shut down a Hyperswarm instance, which might involve unannouncing many discovery keys (depending on how many Hypercores the server instance is managing).

This Hyperswarm shutdown can take a few seconds, sometimes up to 10.

## [Step 2](2-replicate-hypercores.js): Replicate a RemoteHypercore



