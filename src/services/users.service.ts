import User from '~/models/schemas/User.schema'
import databaseService from './database.service'
import { ChangePasswordRequestBody, RegisterRequestBody, UpdateProfileRequestBody } from '~/models/request/User.Request'
import { InsertOneResult, ObjectId } from 'mongodb'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatusType } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import '~/utils/dotenv'
import { ErrorStatus } from '~/models/Errors'
import Follower from '~/models/schemas/Follower.schema'

export class UsersService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatusType }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: process.env.JWT_ACCESS_TOKEN_KEY as string,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    })
  }
  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatusType }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: process.env.JWT_REFRESH_TOKEN_KEY as string,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    })
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatusType }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: process.env.JWT_EMAIL_VERIFY_TOKEN_KEY as string,
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN }
    })
  }

  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatusType }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: process.env.JWT_FORGOT_PASSWORD_TOKEN_KEY as string,
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN }
    })
  }

  private signAccessAndRefreshTolen({ user_id, verify }: { user_id: string; verify: UserVerifyStatusType }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatusType }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshTolen({ user_id, verify })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return {
      access_token,
      refresh_token
    }
  }
  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: 'Logout Successfully'
    }
  }

  async register(payload: RegisterRequestBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatusType.Unverified
    })
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        username: `user_${user_id.toString()}`,
        email_verify_token: email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshTolen({
      user_id: user_id.toString(),
      verify: UserVerifyStatusType.Unverified
    })

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )

    return {
      access_token,
      refresh_token
    }
  }
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }
  async verifyEmail(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshTolen({
      user_id,
      verify: UserVerifyStatusType.Verified
    })
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token: '',
          verify: UserVerifyStatusType.Verified
        },
        $currentDate: {
          update_at: true
        }
      }
    )

    return { access_token, refresh_token }
  }
  async resendEmailVerify(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatusType.Unverified
    })

    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          update_at: true
        }
      }
    )
    return {
      message: 'Resend email verify successfully'
    }
  }
  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatusType }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify })
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          update_at: true
        }
      }
    )

    //send email notification
    return { message: 'Check email to reset password' }
  }
  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: ''
        },
        $currentDate: {
          update_at: true
        }
      }
    )
    return { message: 'Reset password success' }
  }

  async changePassword(user_id: string, payload: ChangePasswordRequestBody) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(payload.new_password)
        },
        $currentDate: {
          update_at: true
        }
      }
    )
  }
  async getProfile(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    if (user) {
      return {
        message: 'Get profile successfully',
        user
      }
    }
  }
  async updateProfile(user_id: string, payload: UpdateProfileRequestBody) {
    const payloadClone = (
      payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    ) as UpdateProfileRequestBody & { date_of_birth?: Date }
    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...payloadClone
        },
        $currentDate: {
          update_at: true
        }
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        },
        returnDocument: 'after'
      }
    )
    return user
  }

  async getUserProfile(username: string) {
    const user = await databaseService.users.findOne(
      { username: username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          create_at: 0,
          update_at: 0
        }
      }
    )
    if (user === null) {
      throw new ErrorStatus({
        message: 'User not found',
        status: 404
      })
    }
    return user
  }
  async follow(user_id: string, followed_user_id: string) {
    const followers = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (followers === null) {
      await databaseService.followers.insertOne(
        new Follower({
          user_id: new ObjectId(user_id),
          followed_user_id: new ObjectId(followed_user_id)
        })
      )
      return {
        message: 'Followed Success'
      }
    }
    return {
      message: 'User Followed Before'
    }
  }
  async unfollow(user_id: string, followed_user_id: string) {
    const followers = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (followers === null) {
      return {
        message: 'Already Unfollowed'
      }
    }
    await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    return {
      message: 'Unfollowed Successfully'
    }
  }
}
const usersService = new UsersService()
export default usersService
