import express, { Application } from 'express'
import 'dotenv/config'
import morgan from 'morgan'
import router from './routes/index'

const app: Application = express()

const port: string = process.env.PORT || '8000'

app.use(express.urlencoded({ extended: true }));

app.use('/api', router)
app.use(express.static('build'))

app.use(express.json())

app.use(morgan('dev'))

app.listen(port, (): void => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})
