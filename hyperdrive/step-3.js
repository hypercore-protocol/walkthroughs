const chalk = require('chalk')
const createHyperspaceSimulator = require('hyperspace/simulator')
const hyperdrive = require('hyperdrive')

start()

async function start () {
  // Let's start by creating a new hyperdrive.
  const { client, cleanup } = await createHyperspaceSimulator()
  const drive = hyperdrive(client.corestore(), null)
  await drive.promises.ready()

  console.log(chalk.green('✓ Drive created in-memory:'))
  console.log('    Key:', drive.key.toString('hex'))

  // Let's write a file and capture a checkout at this time.
  await drive.promises.writeFile('/hello.txt', 'world')
  const frozen = drive.checkout(drive.version)

  // Now let's delete the file...
  await drive.promises.unlink('/hello.txt')

  // ...and output the difference.
  console.log(chalk.green('✓ Diffing version', drive.version, 'with version', frozen.version))
  for await (let change of drive.createDiffStream(frozen)) {
    console.log('    Change:', change.type, change.name, change.previous)
  }

  // Tag the current version as "tag1".
  await drive.promises.createTag('tag1', drive.version)
  console.log(chalk.green('✓ Created a version tag: "tag1"'))

  // Write a new file.
  await drive.promises.writeFile('/new.txt', 'This is new')

  // Fetch the tagged version's seq number.
  const tag1Version = await drive.promises.getTaggedVersion('tag1')
  console.log(chalk.green('✓ Fetched a version tag: "tag1"'))
  console.log('    "tag1" ->', tag1Version)

  // Output the diff
  console.log(chalk.green('✓ Diffing version', drive.version, 'with version', tag1Version))
  for await (let change of drive.createDiffStream(tag1Version)) {
    console.log('    Change:', change.type, change.name, change.seq, {isFile: change.value.isFile(), size: change.value.size})
  }

  // Don't forget to cleanup your simulator.
  await cleanup()
}
