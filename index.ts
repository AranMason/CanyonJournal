import express from 'express'
import 'dotenv/config'
import morgan from 'morgan'
import router from './routes/index'
import session from 'express-session'
import path from 'path'

const app = express()

const port: string = process.env.PORT || '8000'

app.set('trust proxy', 1); // For deployment behind a proxy, e.g., Heroku
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

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
