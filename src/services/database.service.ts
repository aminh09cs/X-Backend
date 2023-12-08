import { MongoClient, Db, Collection } from 'mongodb'
import User from '~/models/schemas/User.schema'
import '~/utils/dotenv'

const uri = `mongodb+srv://minhdev:${process.env.DB_PASSWORD}@xbackend.wrlhply.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME || 'XBackend')
  }
  async connectDatabase(): Promise<void> {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error: unknown) {
      throw new Error('Failed to connect to MongoDB: ' + error)
    }
  }
  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }
}

const databaseService: DatabaseService = new DatabaseService()
export default databaseService
