import { ParamsDictionary } from 'express-serve-static-core'

export interface LoginRequestBody {
  email: string
  password: string
}

export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}
export interface EmailVerifyRequestBody {
  email_verify_token: string
}

export interface ForgotPasswordRequestBody {
  email: string
}
export interface VerifyForgotPasswordRequestBody {
  forgot_password_token: string
}
export interface ResetPasswordRequestBody {
  forgot_password_token: string
  password: string
  confirm_password: string
}

export interface ChangePasswordRequestBody {
  old_password: string
  new_password: string
  confirm_password: string
}
export interface UpdateProfileRequestBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  username?: string
  avatar?: string
}

export interface FollowRequestBody {
  followed_user_id: string
}

export interface GetUserProfileParams {
  username: string
}

export interface UnfollowRequestParam extends ParamsDictionary {
  user_id: string
}
