import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from '~/services/database.service'
import { defaultErrorHandler } from './middlewares/errors.middlewares'

databaseService.connectDatabase().catch(console.dir)
const app = express()
const port = 3000

app.use(express.json())
app.use('/users', usersRouter)

app.use(defaultErrorHandler)
app.listen(port)
