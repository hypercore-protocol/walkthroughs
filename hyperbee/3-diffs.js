const chalk = require('chalk')
const hypercore = require('hypercore')
const ram = require('random-access-memory')
const Hyperbee = require('hyperbee')

start()

async function start () {
  const db = new Hyperbee(hypercore(ram), {
    keyEncoding: 'utf-8',
    valueEncoding: 'utf-8'
  })
  await db.ready()

  // Let's insert a bunch of KV-pairs of the form 'a' -> 'a' etc.
  const keys = 'abcdefghijkl'
  for (const char of keys) {
    await db.put(char, char)
    console.log(chalk.blue(`Version after inserting ${char}: ${db.version}`))
  }

  // The createDiffStream method allows us to observe differences between versions of the Hyperbee.
  // Let's see what's changed between the latest version, and version 9.
  console.log(chalk.green('\nDiff between the latest version, and version 9:\n'))
  for await (const { left, right } of db.createDiffStream(9)) {
    // Since we've only inserted values, `right` will always be null.
    console.log(chalk.blue(`left -> ${left.key}, right -> ${right}`))
  }

  // Before modifying the database, let's record the current database version.
  const oldVersion = db.version

  // Now let's delete keys 'k' and 'l', insert key 'm', and modify 'a':
  await db.del('k')
  await db.del('l')
  await db.put('m', 'm')
  await db.put('a', 'new a')

  console.log(chalk.green('\nDiff after modifications:\n'))
  for await (const { left, right } of db.createDiffStream(oldVersion)) {
    // For keys 'k' and 'l', `right` is set because it's a deletion.
    // For 'm', `left` is set because it's a new insertion.
    // For 'a', both `left` and `right` are set because it's a modification
    console.log(chalk.blue(`left -> ${left && left.key}, right -> ${right && right.key}`))
  }

  // We can also check out a database snapshot for an old version
  // With the snapshot, we can re-create the original diff output.
  const snapshot = db.checkout(oldVersion)
  console.log(chalk.green('\nSnapshot diff to version 9:\n'))
  for await (const { left, right } of snapshot.createDiffStream(9)) {
    // Since we've only inserted values, `right` will always be null.
    console.log(chalk.blue(`left -> ${left.key}, right -> ${right}`))
  }
}
