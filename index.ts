import express from 'express';
import 'dotenv/config';
import morgan from 'morgan';
import router from './routes/index';
import session from 'express-session';
import passport from 'passport';
import Auth0Strategy from 'passport-auth0';
import path from 'path';
import compression from 'compression';
import helmet from 'helmet';
import RateLimit from 'express-rate-limit';

const app = express()

const port: string = process.env.PORT || '8000'

app.set('trust proxy', 1); // For deployment behind a proxy, e.g., Heroku
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());
// Add helmet to the middleware chain.
// Set CSP headers to allow our Bootstrap and jQuery to be served
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "cdn.jsdelivr.net"],
    },
  }),
);
// Set up rate limiter: maximum of twenty requests per minute
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000,
});
// Apply rate limiter to all requests
app.use(limiter);

// Session middleware
app.use(session({
  secret: process.env.AUTH0_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Passport.js setup
passport.use(new Auth0Strategy({
  domain: process.env.AUTH0_DOMAIN as string,
  clientID: process.env.AUTH0_CLIENT_ID as string,
  clientSecret: process.env.AUTH0_SECRET as string,
  callbackURL: process.env.AUTH0_CALLBACK_URL || `${process.env.BASE_URL}/api/callback`
},
  function(accessToken, refreshToken, extraParams, profile, done) {
    return done(null, profile);
  }
));
passport.serializeUser((user, done) => {
  done(null, user);
});
import { getPool, sql } from './routes/middleware/sqlserver';

passport.deserializeUser(async (user: any, done) => {
  try {
    // Use email from Auth0 profile
    const guid = user?.emails?.[0]?.value || user?.email || user?.user_id;
    if (!guid) return done(null, user);
    const pool = await getPool();
    let result = await pool.request()
      .input('guid', sql.NVarChar(255), guid)
      .query('SELECT Id, Guid, FirstName, ProfilePicture, IsAdmin FROM Users WHERE Guid = @guid');
    
    // If the user does not exist, create them
    if (result.recordset.length === 0) {
      result = await pool.request()
        .input('guid', sql.NVarChar(255), guid)
        .input('firstName', sql.NVarChar(100), user?.name?.givenName || 'User')
        .input('profilePicture', sql.NVarChar(255), user?.picture || '')
        .query('INSERT INTO Users (Guid, FirstName, ProfilePicture, IsAdmin) OUTPUT INSERTED.* VALUES (@guid, @firstName, @profilePicture, 0)');
    };
    // Attach DB user info to session user
    const dbUser = result.recordset[0];
    done(null, { ...user, dbUser });
  } catch (err) {
    done(err, user);
  }
});
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan('dev'));

// Auth0 login route
app.get('/api/login', passport.authenticate('auth0', {
  scope: 'openid email profile'
}), (req, res) => {
  res.redirect('/dashboard');
});

// Auth0 callback route
app.get('/api/callback', passport.authenticate('auth0', {
  failureRedirect: '/'
}), (req, res) => {
  res.redirect('/');
});

// Auth0 logout route
app.get('/api/logout', (req, res) => {
  req.logout(() => {
    res.redirect(`https://${process.env.AUTH0_DOMAIN}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${process.env.BASE_URL}`);
  });
});

// Protect API routes (require login)
app.use('/api', (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.redirect('/api/login');
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
