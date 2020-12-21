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

This walkthrough has a single dependency, `hyperspace`, which exports both the client and the server. Before jumping into Step 1, make sure to install:
```
> npm i
```

## Step 1: Starting Two Hyperspace Servers


## Step 2: Replicate a RemoteHypercore



