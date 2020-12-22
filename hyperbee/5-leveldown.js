const chalk = require('chalk')
const hypercore = require('hypercore')
const ram = require('random-access-memory')
const Hyperbee = require('hyperbee')
const HyperbeeDown = require('hyperbeedown')
const PouchDB = require('pouchdb')

start()

async function start () {
  const tree = new Hyperbee(hypercore(ram), {
    keyEncoding: 'utf-8'
  })

  // With the addition of a small wrapper (hyperbeedown), Hyperbee supports the LevelDOWN interface.
  // It can be used as the storage backend for many modules in the LevelDB ecosystem.
  // In this example, we'll use it as the backend for PouchDB.
  const db = new PouchDB('my-database', {
    db: () => new HyperbeeDown(tree)
  })

  // PouchDB is a document store, so we'll store and retrieve a simple record.
  await db.put({ _id: '1', hello: 'world' })

  console.log(chalk.green('\nPouchDB Document 1:\n'))
  const doc = await db.get('1')
  console.log(chalk.blue(JSON.stringify(doc, null, 2)))
}
