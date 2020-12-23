const chalk = require('chalk')
const pump = require('pump')
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

  // Many of the functions on Hyperdrive mirror the NodeJS "fs" module.

  await drive.promises.writeFile('/hello.txt', 'World')
  console.log(chalk.green('✓ writeFile(/hello.txt)'))

  const st = await drive.promises.stat('/hello.txt')
  console.log(chalk.green('✓ stat(/hello.txt)'))
  console.log('    Is Directory:', st.isDirectory())
  console.log('    Is File:', st.isFile())
  console.log('    Size (in bytes):', st.size)
  console.log('    Size (in blocks):', st.blocks)

  const content = await drive.promises.readFile('/hello.txt', 'utf8')
  console.log(chalk.green('✓ readFile(/hello.txt)'))
  console.log('    Content:', content)
  const list1 = await drive.promises.readdir('/')
  console.log(chalk.green('✓ readdir(/)'))
  console.log('    Listing:', list1)
  const list2 = await drive.promises.readdir('/', {recursive: true, includeStats: true})
  console.log(chalk.green('✓ readdir(/, {recursive: true, includeStats: true})'))
  console.log('    Listing:', list2.map(item => ({name: item.name, path: item.path, stat: {isFile: item.stat.isFile()}})))

  await drive.promises.mkdir('/dir')
  console.log(chalk.green('✓ mkdir(/dir)'))
  await drive.promises.rmdir('/dir')
  console.log(chalk.green('✓ rmdir(/dir)'))  

  // You can also read and write using streams.
  // Let's use streams to copy a file.

  await new Promise((resolve, reject) => {
    pump(
      drive.createReadStream('/hello.txt'),
      drive.createWriteStream('/copy.txt'),
      err => {
        if (err) reject(err)
        else resolve(err)
      }
    )
  })
  const st2 = await drive.promises.stat('/copy.txt')
  console.log(chalk.green('✓ Copy via streams'))
  console.log('   Copied file size is equal:', st.size === st2.size)

  await drive.promises.unlink('/copy.txt') // delete the copy
  console.log(chalk.green('✓ unlink(/copy.txt)'))

  // Don't forget to cleanup your simulator.
  await cleanup()
}
