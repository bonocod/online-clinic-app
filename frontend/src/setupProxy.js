const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  const target = 'http://localhost:8000'

  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  )

  app.use(
    '/socket.io',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
    })
  )
}
