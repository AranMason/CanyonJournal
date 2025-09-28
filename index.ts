import express, { Application } from 'express'
import 'dotenv/config'
import morgan from 'morgan'
import router from './routes/index'
import session from 'express-session'

const app: Application = express()

const port: string = process.env.PORT || '8000'

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
app.use(morgan('dev'))
app.use(express.static('build'))

app.use('/api', router)

app.listen(port, (): void => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})
