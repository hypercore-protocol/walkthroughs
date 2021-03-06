const chalk = require('chalk')
const hypercore = require('hypercore')
const ram = require('random-access-memory')
const Hyperbee = require('hyperbee')

start()

async function start () {
  // A Hyperbee is stored as an embedded index within a single Hypercore.
  const core = hypercore(ram)

  // It accepts LevelDB-style key/value encoding options.
  const db = new Hyperbee(core, {
    keyEncoding: 'utf-8',
    valueEncoding: 'utf-8'
  })
  await db.ready()

  // Key/value pairs can be inserted with the `put` method.
  await db.put('a', 'b')
  await db.put('c', 'd')

  // You can do large, bulk insertions with the `batch` method.
  // A Batch object mirrors the Hyperbee API.
  const b = db.batch()
  await b.put('e', 'f')
  await b.put('g', 'h')

  // When a batch is flushed, it's atomically committed to the Hyperbee.
  await b.flush()

  // KV-pairs can be deleted with the `del` method.
  await db.del('c')

  console.log(chalk.green('Reading KV-pairs with the \'get\' method:\n'))

  // KV-pairs can be read with the `get` method.
  console.log('Value for \'a\':', (await db.get('a')).value)
  console.log('Value for \'e\':', (await db.get('e')).value)
  console.log('Value for \'c\' (deleted):', await db.get('c'))

  console.log(chalk.green('\nReading KV-pairs with \'createReadStream\':\n'))

  // createReadStream can be used to yield KV-pairs in sorted order.
  // createReadStream returns a ReadableStream that supports async iteration.
  for await (const { key, value } of db.createReadStream()) {
    console.log(`${key} -> ${value}`)
  }
}
