const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
    })
  );

  app.use(
    '/login',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: false,
    })
  );

  app.use(
    '/callback',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: false,
    })
  );

  app.use(
    '/logout',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: false,
    })
  );
};
