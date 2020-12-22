const chalk = require('chalk')
const hypercore = require('hypercore')
const ram = require('random-access-memory')
const Hyperbee = require('hyperbee')

start()

async function start () {
  // It accepts LevelDB-style key/value encoding options.
  const db = new Hyperbee(hypercore(ram), {
    keyEncoding: 'utf-8',
    valueEncoding: 'utf-8'
  })
  await db.ready()

  // Let's insert a bunch of KV-pairs of the form 'a' -> 'a' etc.
  const keys = 'abcdefghijklmnopqrstuvwxyz'
  const b = db.batch()
  for (const char of keys) {
    await b.put(char, char)
  }
  await b.flush()

  // The createReadStream method accepts LevelDB-style gt, lt, gte, lte, limit, and reverse options.
  const streams = [
    ['First 10', db.createReadStream({ limit: 10 })],
    ['Last 10, reversed', db.createReadStream({ limit: 10, reverse: true })],
    ['Between \'a\' and \'d\', non-inclusive', db.createReadStream({ gt: 'a', lt: 'd' })],
    ['Between \'a\' and \'d\', inclusive', db.createReadStream({ gte: 'a', lte: 'd' })],
    ['Between \'e\' and \'f\', inclusive, reversed', db.createReadStream({ gte: 'e', lte: 'f', reverse: true })]
  ]

  for (const [name, stream] of streams) {
    console.log(chalk.green('\n' + name + ':\n'))
    for await (const { key, value } of stream) {
      console.log(chalk.blue(`${key} -> ${value}`))
    }
  }
}
