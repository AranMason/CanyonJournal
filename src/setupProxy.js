const { createProxyMiddleware } = require('http-proxy-middleware');

const target = 'http://127.0.0.1:8000';
const proxyOptions = { target, changeOrigin: true };

module.exports = function(app) {
  // Proxy API calls and auth routes to Express so OIDC handling works in dev mode
  ['/api', '/login', '/logout'].forEach(path => {
    app.use(path, createProxyMiddleware(proxyOptions));
  });
};
