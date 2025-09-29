import express from 'express'
import 'dotenv/config'
import morgan from 'morgan'
import router from './routes/index'
import session from 'express-session'
import path from 'path'
import compression from 'compression'
import helmet from 'helmet'
import RateLimit from 'express-rate-limit'

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
  max: 20,
});
// Apply rate limiter to all requests
app.use(limiter);

app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' } 
  })
)
app.use(morgan('dev'));

app.use('/api', router);

app.use(express.static(path.join(__dirname)));
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, (): void => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})
