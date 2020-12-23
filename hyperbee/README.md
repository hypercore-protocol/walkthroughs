# Hyperbee Walkthrough

Hyperbee is an append-only B-Tree that can be used to build P2P databases. This walkthrough will dive into Hyperbee, showing you how to use it either as a standalone module or with Hyperspace.

If you aren't already familiar with the basics of Hypercore and Hyperspace, we recommend you first look at our Getting Started guides:
* [Getting Started with Hyperspace](/guides/walkthroughs/hyperspace)
* [Getting Started with Standalone Modules](/guides/walkthroughs/standalone-modules)

## Introduction

Hyperbee provides a key/value-store API, with methods for getting and inserting key/value pairs, atomically batching insertions, and creating sorted iterators. It uses a single Hypercore for storage, using a technique called embedded indexing.

If you're curious about the details of Hyperbee's design, our workshop called [P2P Indexing and Search](https://github.com/hypercore-protocol/p2p-indexing-and-search) covers all the guts.

Much of Hyperbee's API mirrors the [LevelUP](https://github.com/Level/levelup) interface, so if you're already comfortable with the Level ecosystem parts of this walkthrough will feel familiar.

Hyperbee inherits and takes advantage of many Hypercore features:
* __Sparse Downloading__: When a reader performs a query, only the Hypercore blocks containing the relevant parts of the index are downloaded.
* __Sorted Iteration__: Using the embedded index, Hyperbee can satisfy range queries without needing to do a full scan.
* __Version Controlled__: The complete database history is preserved, and you can "check out" snapshots of previous versions.
* __Efficient Diffing__: Given two database snapshots, Hyperbee can efficiently detect where they differ.
* __Cache-Warmup Extension__: Hyperbee lookups are `O(log(n))`, but using the built-in warmup extension, remote peers can "stream" query results to readers with no loss of trust, dramatically reducing read latency.

As with Hypercores, a Hyperbee can only have a __single writer on a single machine__; the creator of the Hyperdrive is the only person who can modify to it, because they're the only one with the private key. That said, the writer can replicate to __many readers__, in a manner similar to BitTorrent.

This walkthrough covers the following topics:
1. Basic Operations (`get`, `put`, and `batch`)
2. Iteration (`createReadStream`)
3. Diffing (`createDiffStream`)
4. Sub-Databases (`sub`)
5. Using Hyperbee with LevelDB 

## [Step-1](1a-basics.js): Basic Operations

### Constructing a Hyperbee

A Hyperbee is constructed with either a single Hypercore, or a single RemoteHypercore (if you're using Hyperspace).

To create a Hyperbee using a standalone Hypercore:
```js
// A Hyperbee is stored as an embedded index within a single Hypercore.
const core = hypercore(ram)
const Hyperbee = require('hyperbee')

// It accepts LevelDB-style key/value encoding options.
const db = new Hyperbee(core, {
  keyEncoding: 'utf-8',
  valueEncoding: 'utf-8'
})
await db.ready()
```

As with Level, Hyperbee accepts `keyEncoding` and `valueEncoding` in its constructors. Both default to `binary`.

Creating a Hyperbee with Hyperspace is pretty much the same. In this example, we'll use the Hyperspace "simulator" to avoid saving any state to your computer's disk:
```js
const Hyperbee = require('hyperbee')
const createHyperspaceSimulator = require('hyperspace/simulator')

// A Hyperbee can also be constructed with a RemoteHypercore instance.
const { client, cleanup } = await createHyperspaceSimulator()
const store = client.corestore('hyperbee-exercise')
const core = store.get({ name: 'hyperbee-1' })

const db = new Hyperbee(core, {
  keyEncoding: 'utf-8',
  valueEncoding: 'utf-8'
})
await db.ready()
```

### Getting, Inserting, and Deleting KV-Pairs

Keys and values can be inserted with the `put` method:
```js
await db.put('a', 'b')
await db.put('c', 'd')
```

If you're doing a bulk insertion of many KV-pairs, you can use the `batch` method to atomically commit many entries:
```js
const b = db.batch()

await b.put('e', 'f')
await b.put('g', 'h')

// When a batch is flushed, it's atomically committed to the Hyperbee.
await b.flush()
```

To read out a single kv-pair, you can use the `get` method:
```js
const node = await db.get('a')) // An object of the form { key, value }
```
`get` will either return an object of the form `{ key, value }`, or `null`.

To delete a kv-pair, use the `del` method:
```js
await db.del('c')
```

## [Step 2](2-iterators.js): Iterating Over Sorted Streams

## [Step 3](3-diffs.js): Diffing Between Database Versions

## [Step 4](4-sub.js): Sub-Databases

## [Step 5](5-leveldown.js): Hyperbee Implements LevelDOWN
