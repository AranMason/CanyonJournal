// Auth0 configuration template for express-openid-connect
module.exports = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET || 'replace-with-strong-secret',
  baseURL: process.env.BASE_URL || 'http://localhost:8000',
  clientID: process.env.AUTH0_CLIENT_ID || 'replace-with-client-id',
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || 'https://YOUR_DOMAIN.auth0.com',
};
