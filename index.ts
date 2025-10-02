import express from 'express'
import 'dotenv/config'
import morgan from 'morgan'
import router from './routes/index'
// import session from 'express-session'
import { auth } from 'express-openid-connect';
import path from 'path'
import { getPool, sql } from './routes/middleware/sqlserver';
// import compression from 'compression'
// import helmet from 'helmet'
// import RateLimit from 'express-rate-limit'

const app = express()

const port: string = process.env.PORT || '8000'

app.set('trust proxy', 1); // For deployment behind a proxy, e.g., Heroku
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// TODO: Re-enable these security features later
// app.use(compression());
// // Add helmet to the middleware chain.
// // Set CSP headers to allow our Bootstrap and jQuery to be served
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       "script-src": ["'self'", "cdn.jsdelivr.net"],
//     },
//   }),
// );
// // Set up rate limiter: maximum of twenty requests per minute
// const limiter = RateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 20,
// });
// // Apply rate limiter to all requests
// app.use(limiter);

// Auth0 SSO middleware
app.use(auth({
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
}));
app.use(morgan('dev'));

// Protect API routes (require login)
app.use('/api', (req, res, next) => {
  if (!req.oidc || !req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}, router);

app.use(express.static(path.join(__dirname)));
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, (): void => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})
