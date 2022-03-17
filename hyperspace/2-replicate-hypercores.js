const chalk = require('chalk')
const { Client: HyperspaceClient } = require('hyperspace')

start()

async function start () {
  // Create a client that's connected to the "local" peer.
  const localClient = new HyperspaceClient({
    host: 'hyperspace-demo-1'
  })

  // Create a client that's connected to the "remote" peer.
  const remoteClient = new HyperspaceClient({
    host: 'hyperspace-demo-2'
  })

  // Now let's replicate a Hypercore between both servers.
  
  // First, create the Hypercore on the local instance.
  var sharedKey = null
  {
    // Create a new RemoteCorestore.
    const store = localClient.corestore()

    // Create a fresh Remotehypercore.
    const core = store.get({
      valueEncoding: 'utf-8'
    })

    // Append two blocks to the RemoteHypercore.
    await core.append(['hello', 'world'])

    // Log when the core has any new peers.
    core.on('peer-add', () => {
      console.log(chalk.blue('(local) Replicating with a new peer.'))
    })

    // Start seeding the Hypercore on the Hyperswarm network.
    localClient.replicate(core)

    sharedKey = core.key
  }

  // Now, create a clone on the remote instance, and read the first two blocks.
  {
    // Create a new RemoteCorestore.
    const store = remoteClient.corestore()

    // Create a fresh Remotehypercore.
    // Here we'll get a core using the shared key from above.
    const core = store.get({
      key: sharedKey,
      valueEncoding: 'utf-8'
    })

    // Log when the core has any new peers.
    core.on('peer-add', () => {
      console.log(chalk.blue('(remote) Replicating with a new peer.'))
    })

    // Start seeding the Hypercore (this will connect to the first Hyperspace instance)
    remoteClient.replicate(core)

    // The core should now have one connected peer, so we can read the first two blocks.
    console.log(chalk.green('First two blocks:', [
      await core.get(0),
      await core.get(1)
    ]))
  }
}
