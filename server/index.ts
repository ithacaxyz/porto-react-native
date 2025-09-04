const server = Bun.serve({
  development: Bun.env.NODE_ENV !== 'production',
  port: 4404,
  routes: {
    '/': (_, __) => new Response('ok'),
    '/.well-known/apple-app-site-association': {
      GET: async (request, server) => {
        const ipAddress = server.requestIP(request)
        console.info(`Request from ${ipAddress?.address}`)
        const fileContent = await Bun.file(
          './apple-app-site-association',
        ).text()
        console.info(`File content: ${fileContent}`)
        return new Response(fileContent, {
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
    '/.well-known/assetlinks.json': {
      GET: async (request, server) => {
        const ipAddress = server.requestIP(request)
        console.info(`Request from ${ipAddress?.address}`)

        const fileContent = await Bun.file('./assetlinks.json').text()
        console.info(`File content: ${fileContent}`)
        return new Response(fileContent, {
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
  error: (error) => {
    console.error(`Error in bun server:`, error)
  },
})

console.info(`Server is running on http://localhost:${server.port}`)

const stopAndExit = () => [server.stop(), process.exit(0)]

process.on('SIGINT', () => stopAndExit())
process.on('SIGTERM', () => stopAndExit())
process.on('SIGQUIT', () => stopAndExit())
