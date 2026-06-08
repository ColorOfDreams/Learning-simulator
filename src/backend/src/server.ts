import { buildApp } from './app.js'

const app = await buildApp()

await app.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' })
console.log(`Server running on port ${process.env.PORT ?? 3000}`)
