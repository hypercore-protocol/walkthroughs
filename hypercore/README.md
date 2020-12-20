# Creating and Replicating Hypercores

This walkthrough will go through the basics of using Hypercore as a standalone module. 

Hypercore gives you many knobs to tweak, so if you'd like something with more "batteries included", head on over to the [Hyperspace Walkthrough](/hyperspace).

### Introduction

Hypercore is the bread-and-butter of the Hypercore Protocol. It is a lightweight, secure append-only log with several powerful properties:
1. __Secure__: Hypercore builds a Merkle tree out of its blocks, so readers can always verify that the log hasn't been tampered with. 
2. __Easy Replication__: The `replicate` method returns a Duplex stream that can be piped over an arbitrary transport stream.
3. __On-Demand Downloading__: With "sparse mode", readers will download blocks from peers when they are first requested. 
4. __Caching__: Once peer has downloaded a block, it will be cached locally. The download will only happen once.
5. __Bandwidth Sharing__: As with BitTorrent, readers download blocks from many connected peers in parallel.
6. __Live Updating__: Peers can be notified whenever a Hypercore has grown.

A Hypercore can only have a __single writer, on a single machine__ -- the creator of the Hypercore is the only person who can modify to it, because they're the only one with the private key. That said, the writer can replicate to __many readers__, in a manner similar to BitTorrent.

Unlike with BitTorrent, a Hypercore can be modified after its initial creation, and peers can receive live notifications whenever a Hypercore has grown.

In this walkthrough, we'll create two Hypercores: one writable and one that's a read-only clone of the first, which will simulate a remote peer. We'll then show you how to initiate replication between the two cores, and have the reader download and display live updates.

### Trying it out

This example only has two dependencies: `hypercore` and `hypercore-promisifier`, which gives you a Promises interface for Hypercore.

You can run the complete example with the following command inside this module's directory:
```
> npm i && npm start
```

### Step 1: Create a Hypercore

### Step 2: Create a Read-Only Clone

### Step 3: See Live Updates

### Next Steps

In the [Hyperswarm Walkthrough](/hyperswarm), we'll see how to replicate Hypercores to remote peers over a P2P network.
