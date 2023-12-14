import { Request } from 'express'
import User from './models/schemas/User.schema'
import RefreshToken from './models/schemas/RefreshToken.schema'

declare module 'express' {
  interface Request {
    user?: User
    refresh_token?: RefreshToken
    decoded_email_verify_token?: typeof Record<string, string | number>
    decoded_authorization?: typeof Record<string, string | number>
  }
}
