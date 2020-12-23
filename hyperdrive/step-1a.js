const chalk = require('chalk')
const ram = require('random-access-memory')
const hyperdrive = require('hyperdrive')

start()

async function start () {
  // A Hyperdrive uses two Hypercores internally: one for metadata and one for content.
  // - param 1: The storage (we'll use random-access-memory to avoid writing to disk).
  // - param 2: The key of the drive to load; `null` means "create a new drive."
  const drive = hyperdrive(ram, null)

  // Wait for setup to finish.
  await drive.promises.ready()

  // Let's dump some info!
  console.log(chalk.green('✓ Drive created in-memory:'))
  console.log('    Key:', drive.key.toString('hex')) // the drive's public key, used to identify it
  console.log('    Discovery Key:', drive.discoveryKey.toString('hex')) // the drive's discovery key for the DHT
  console.log('    Writable:', drive.writable) // do we possess the private key of this drive?
  console.log('    Version:', drive.version) // what is the version-number of this drive?

  // Loading a drive by an existing key is similar, we just pass the key into the constructor.
  const drive2 = hyperdrive(ram, drive.key)
  await drive2.promises.ready()

  // Because we loaded the second drive in a separate RAM, it will show as writable=false.
  console.log(chalk.green('✓ Drive copy created in-memory:'))
  console.log('    Key:', drive2.key.toString('hex'))
  console.log('    Writable:', drive2.writable)
}
