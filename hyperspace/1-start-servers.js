const chalk = require('chalk')
const { Server: HyperspaceServer } = require('hyperspace')

start()

async function start () {
  // Create one server to simulate your local Hyperspace instance.
  const localServer = new HyperspaceServer({
    storage: './storage/hyperspace-storage-1',
    host: 'hyperspace-demo-1'
  })
  // Create a second server to simulate a remote peer.
  const remoteServer = new HyperspaceServer({
    storage: './storage/hyperspace-storage-2',
    host: 'hyperspace-demo-2'
  })
  await localServer.ready()
  await remoteServer.ready()
  console.log('Both Hyperspace server are listening...')

  // Print some client connection/disconnection events.
  localServer.on('client-open', () => {
    console.log(chalk.green('(local) A HyperspaceClient has connected'))
  })
  localServer.on('client-close', () => {
    console.log(chalk.green('(local) A HyperspaceClient has disconnected'))
  })

  remoteServer.on('client-open', () => {
    console.log(chalk.blue('(remote) A HyperspaceClient has connected'))
  })
  remoteServer.on('client-close', () => {
    console.log(chalk.blue('(remote) A HyperspaceClient has disconnected'))
  })

  process.on('SIGINT', cleanup)

  async function cleanup () {
    console.log('Hyperspace servers are shutting down...')
    await localServer.close()
    await remoteServer.close()
  }
}
