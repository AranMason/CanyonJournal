import express from 'express';
import 'dotenv/config';
import morgan from 'morgan';
import router from './routes/index';
import path from 'path';
import fs from 'fs';
import compression from 'compression';
import helmet from 'helmet';
import RateLimit from 'express-rate-limit';
import { auth } from 'express-openid-connect';
import { getPool, sql } from './routes/middleware/sqlserver';

if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET environment variable is required');
if (!process.env.AUTH0_CLIENT_SECRET) throw new Error('AUTH0_CLIENT_SECRET environment variable is required');
if (!process.env.AUTH0_DOMAIN) throw new Error('AUTH0_DOMAIN environment variable is required');
if (!process.env.AUTH0_CLIENT_ID) throw new Error('AUTH0_CLIENT_ID environment variable is required');
if (!process.env.BASE_URL) throw new Error('BASE_URL environment variable is required');

const app = express();

const port: string = process.env.PORT || '8000';

app.set('trust proxy', 1);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "cdn.jsdelivr.net"],
    },
  }),
);

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
});
app.use(limiter);

// OIDC auth via express-openid-connect
app.use(auth({
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SESSION_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  routes: {
    callback: '/api/callback', // Matches existing Auth0 dashboard callback URL
  },
}));

app.use(morgan('dev'));

// Resolve DB user from OIDC claims on every authenticated request
app.use(async (req, res, next) => {
  if (!req.oidc.isAuthenticated()) return next();
  try {
    const oidcUser = req.oidc.user;
    const guid = oidcUser?.email || oidcUser?.sub;
    if (!guid) return next();

    const pool = await getPool();
    let result = await pool.request()
      .input('guid', sql.NVarChar(255), guid)
      .query('SELECT Id, Guid, FirstName, ProfilePicture, IsAdmin FROM Users WHERE Guid = @guid');

    if (result.recordset.length === 0) {
      result = await pool.request()
        .input('guid', sql.NVarChar(255), guid)
        .input('firstName', sql.NVarChar(100), oidcUser?.given_name || oidcUser?.name || 'User')
        .input('profilePicture', sql.NVarChar(255), oidcUser?.picture || '')
        .query('INSERT INTO Users (Guid, FirstName, ProfilePicture, IsAdmin) OUTPUT INSERTED.* VALUES (@guid, @firstName, @profilePicture, 0)');
    }

    req.user = { dbUser: result.recordset[0] };
    next();
  } catch (err) {
    next(err);
  }
});

// Protect API routes (require login)
app.use('/api', (req, res, next) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  next();
}, router);

// In production (node build/index.js) __dirname === build/.
// In dev (ts-node index.ts) __dirname === project root; React assets are in build/.
const clientBuildPath = fs.existsSync(path.join(__dirname, 'index.html'))
  ? __dirname
  : path.join(__dirname, 'build');

app.use(express.static(clientBuildPath));
app.get('*', function (req, res) {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(port, (): void => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})
