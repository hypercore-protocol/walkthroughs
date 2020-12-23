const chalk = require('chalk')
const createHyperspaceSimulator = require('hyperspace/simulator')
const hyperdrive = require('hyperdrive')

start()

async function start () {
  // A Hyperdrive can also be constructed with a RemoteHypercore instance.
  const { client, cleanup } = await createHyperspaceSimulator()

  // In this case, we'll pass the RemoteCorestore as the storage
  // and `null` as the key in order to create a new drive.
  const drive = hyperdrive(client.corestore(), null)

  // Wait for setup to finish.
  await drive.promises.ready()

  // Let's dump some info!
  console.log(chalk.green('✓ Drive created in-memory:'))
  console.log('    Key:', drive.key.toString('hex')) // the drive's public key, used to identify it
  console.log('    Discovery Key:', drive.discoveryKey.toString('hex')) // the drive's discovery key for the DHT
  console.log('    Writable:', drive.writable) // do we possess the private key of this drive?
  console.log('    Version:', drive.version) // what is the version-number of this drive?

  // Loading a drive by an existing key is similar, we just pass the key into the constructor.
  const drive2 = hyperdrive(client.corestore(), drive.key)
  await drive2.promises.ready()

  // Unlike step-1a, we're using the same storage between the drive copies (Hyperspace's corestore).
  // Therefore we will get writable=true.
  console.log(chalk.green('✓ Drive copy created in-memory:'))
  console.log('    Key:', drive2.key.toString('hex'))
  console.log('    Writable:', drive2.writable)

  // Don't forget to cleanup your simulator.
  await cleanup()
}
