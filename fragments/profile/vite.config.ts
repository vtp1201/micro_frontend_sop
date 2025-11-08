import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/_fragment/profile/',
  plugins: [
    react(),
    {
      name: 'serve-root-as-base',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/') {
            const html = fs.readFileSync(path.resolve('index.html'), 'utf-8')
            const transformed = await server.transformIndexHtml('/_fragment/profile/', html)
            res.setHeader('Content-Type', 'text/html')
            res.statusCode = 200
            res.end(transformed)
            return
          }
          next()
        })
      },
    },
  ],
  server: {
    host: true,
    port: 5174,
    strictPort: true,
  },
})
