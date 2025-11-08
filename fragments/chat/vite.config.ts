import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/_fragment/chat/',
  plugins: [
    react(),
    // DEV fallback: trả 200 cho mọi route shell để không bị 302
    {
      name: 'wf-dev-spa-fallback',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const wantsHtml = req.method === 'GET' && req.headers.accept?.includes('text/html')
          if (wantsHtml && !req.url?.startsWith('/_fragment/chat/')) {
            const html = fs.readFileSync(path.resolve('index.html'), 'utf-8')
            const transformed = await server.transformIndexHtml('/_fragment/chat/', html)
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
    port: 8050,
    strictPort: true,
    allowedHosts: ['worker.assets'],
    hmr: { clientPort: 3000 },
  },
})
