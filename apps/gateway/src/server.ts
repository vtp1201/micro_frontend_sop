import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { FragmentGateway } from 'web-fragments/gateway'
import { getNodeMiddleware } from 'web-fragments/gateway/node'

const gw = new FragmentGateway()

gw.registerFragment({
  fragmentId: 'profile',
  routePatterns: [
    '/_fragment/profile/:_*', // assets/HMR của fragment
    '/_fragment/profile/', // mount path cố định (trả 200)
    '/', // cho phép mount ở root
  ],
  endpoint: 'http://localhost:5174',
})

const app = express()

/** 🔁 Rewrite "/" → "/_fragment/profile/" để tránh 302 của Vite khi base khác "/" */
app.use((req, _res, next) => {
  if (req.method === 'GET' && (req.url === '/' || req.url.startsWith('/?'))) {
    req.url = '/_fragment/profile/' // trỏ thẳng vào mount path hợp lệ
  }
  next()
})

/** ➊ Gateway middleware trước */
app.use(getNodeMiddleware(gw))

/** Proxy 2 shell dev server */
app.use(
  '/',
  createProxyMiddleware({ target: 'http://localhost:5173', changeOrigin: true, ws: true }),
)
app.use(
  '/admin',
  createProxyMiddleware({ target: 'http://localhost:5172', changeOrigin: true, ws: true }),
)

app.listen(3000, () => console.log('Gateway http://localhost:3000'))
