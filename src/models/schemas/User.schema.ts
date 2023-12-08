import { ObjectId } from 'mongodb'

enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

interface UserType {
  _id?: ObjectId
  name?: string
  email: string
  password: string
  data_of_birth?: Date
  create_at?: Date
  update_at?: Date
  email_verify_token?: string
  forgot_password_token?: string
  verify?: UserVerifyStatus

  bio?: string
  location?: string
  username?: string
  avatar?: string
}

export default class User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  data_of_birth: Date
  create_at: Date
  update_at: Date
  email_verify_token: string
  forgot_password_token: string
  verify: UserVerifyStatus

  bio: string
  location: string
  username: string
  avatar: string

  constructor(user: UserType) {
    const dateInit = new Date()
    this._id = user._id
    this.name = user.name || ''
    this.email = user.email
    this.password = user.password
    this.data_of_birth = user.data_of_birth || new Date()
    this.create_at = user.create_at || dateInit
    this.update_at = user.update_at || dateInit
    this.email_verify_token = user.email_verify_token || ''
    this.forgot_password_token = user.forgot_password_token || ''
    this.verify = user.verify || UserVerifyStatus.Unverified
    this.bio = user.bio || ''
    this.location = user.location || ''
    this.username = user.username || ''
    this.avatar = user.avatar || ''
  }
}
