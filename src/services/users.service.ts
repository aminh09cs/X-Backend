import User from '~/models/schemas/User.schema'
import databaseService from './database.service'
import { InsertOneResult } from 'mongodb'

export class UsersService {
  async register(payload: { email: string; password: string }) {
    const { email, password } = payload

    const result: InsertOneResult<User> = await databaseService.users.insertOne(
      new User({
        email,
        password
      })
    )
    return result
  }
}
const usersService = new UsersService()
export default usersService
