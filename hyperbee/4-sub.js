const ram = require('random-access-memory')
const hypercore = require('hypercore')
const Hyperbee = require('hyperbee')

start()

async function start () {
  const db = new Hyperbee(hypercore(ram), {
    keyEncoding: 'utf-8',
    valueEncoding: 'utf-8',
    sep: '!'
  })

  // A sub-database will append a prefix to every key it inserts.
  // This prefix ensure that the sub acts as a separate "namespace" inside the parent db.
  const sub1 = db.sub('sub1')
  const sub2 = db.sub('sub2')

  await sub1.put('a', 'b')
  await sub2.put('c', 'd')

  for await (const { key, value } of sub1.createReadStream()) {
    console.log(`(sub1) ${key} -> ${value}`)
  }

  for await (const { key, value } of sub2.createReadStream()) {
    console.log(`(sub2) ${key} -> ${value}`)
  }

  // You can see the sub prefixes by iterating over the parent database.
  for await (const { key, value } of db.createReadStream()) {
    console.log(`(parent) ${key} -> ${value}`)
  }
}
