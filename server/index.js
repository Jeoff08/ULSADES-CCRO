import { startServer } from './http-server.js'

const PORT = Number(process.env.PORT) || 3001

startServer(PORT).catch((err) => {
  console.error(err)
  process.exit(1)
})
