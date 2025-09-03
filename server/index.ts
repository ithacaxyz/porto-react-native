const server = Bun.serve({
  development: Bun.env.NODE_ENV !== 'production',
  port: 4404,
  routes: {
    '/': (_, __) => new Response('ok'),
    '/.well-known/apple-app-site-association': {
      GET: async (request, server) => {
        const ipAddress = server.requestIP(request)
        console.info(`Request from ${ipAddress?.address}`)

        return Response.json(
          await Bun.file('./apple-app-site-association').json(),
        )
      },
    },
    '/.well-known/assetlinks.json': {
      GET: async (request, server) => {
        const ipAddress = server.requestIP(request)
        console.info(`Request from ${ipAddress?.address}`)

        return Response.json(await Bun.file('./assetlinks.json').json())
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
