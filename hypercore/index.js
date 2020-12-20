const chalk = require('chalk')
const hypercore = require('hypercore')
const { toPromises } = require('hypercore-promisifier')

start()

async function start () {

  // Step 1: Create our initial Hypercore.
  console.log(chalk.green('Step 1: Create the initial Hypercore\n'))

  // Create our first Hypercore, saving blocks to the 'main' directory.
  // We'll wrap it in a Promises interface, to make the walkthrough more readable.
  const core = toPromises(hypercore('./main', {
    valueEncoding: 'utf-8' // The blocks will be UTF-8 strings.
  }))

  // Append two new blocks to the core.
  await core.append(['hello', 'world'])

  // After the append, we can see that the length has updated.
  console.log('Length of the first core:', core.length) // Will be 2.

  // And we can read out the blocks.
  console.log('First block:', await core.get(0)) // 'hello'
  console.log('Second block:', await core.get(1)) // 'world'

  // Step 2: Create a read-only clone (this would typically be done by another peer)
  console.log(chalk.green('\nStep 2: Create a read-only clone\n'))

  // Create a clone of the first Hypercore by creating a new core with the first's public key.
  // This would typically be done by a different peer.
  // This clone is not writable, since it doesn't have access to the first core's private key.
  const clone = toPromises(hypercore('./clone', core.key, {
    valueEncoding: 'utf-8',
    sparse: true, // When replicating, don't eagerly download all blocks.
    eagerUpdate: true // But eagerly fetch length updates from peers.
  }))

  // A Hypercore can be replicated over any Node.js stream.
  // The replication stream is E2E encrypted with the NOISE protocol.
  // We'll use live replication, meaning the streams will continue replicating indefinitely.
  const firstStream = core.replicate(true, { live: true })
  const cloneStream = clone.replicate(false, { live: true })

  // Pipe the stream together to begin replicating.
  firstStream.pipe(cloneStream).pipe(firstStream)

  // Now we can read blocks from the clone.
  // Note that these blocks will be downloaded lazily, when each one requested.
  console.log('First clone block:', await clone.get(0)) // 'hello'
  console.log('Second clone block:', await clone.get(1)) // 'world'

  // Step 3: Make the clone listen for updates and download new blocks.
  console.log(chalk.green('\nStep 3: Make the clone listen for updates and download new blocks.\n'))

  // Since the clone's eagerly updating, it will be notified whenever the original is appended to.
  // This notification is small -- blocks are still only downloaded when requested (sparse mode).
  // Let's set up an event listener that will download and print all odd blocks. The even blocks will not be downloaded.
  clone.on('append', async () => {
    if (clone.length % 2) console.log('New block is odd, skipping download...')
    else console.log(`Block: ${clone.length - 1}:`, await clone.get(clone.length - 1))
  })

  // Now let's append 50 new blocks to the original core at 100ms intervals.
  // The clone will be notified after each append, and will download/display odd blocks.
  for (let i = 0; i < 50; i++) {
    await core.append(`New Block ${i}`)
    await delay(100)
  }

  console.log(chalk.green('\nDone with the Hypercore walkthrough!\n'))
}

function delay (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
