import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from '~/services/database.service'

const app = express()
const port = 3000

app.use(express.json())
app.use('/users', usersRouter)

databaseService.connectDatabase().catch(console.dir)
app.listen(port)
