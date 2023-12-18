import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UserVerifyStatusType } from '~/constants/enums'
import {
  EmailVerifyRequestBody,
  ForgotPasswordRequestBody,
  LoginRequestBody,
  RegisterRequestBody,
  ResetPasswordRequestBody,
  VerifyForgotPasswordRequestBody
} from '~/models/request/User.Request'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.service'
import usersService from '~/services/users.service'
export const loginController = async (req: Request<ParamsDictionary, any, LoginRequestBody>, res: Response) => {
  const { user } = req
  const _id = user?._id as ObjectId
  const verify = user?.verify as UserVerifyStatusType
  const result = await usersService.login({ user_id: _id.toString(), verify: verify })
  return res.json({
    message: 'Login Successfully',
    result
  })
}
export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await usersService.register(req.body)
  return res.json({
    message: 'Register Successfully',
    result
  })
}
export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  const { refresh_token } = req
  const token = refresh_token?.token as string
  await usersService.logout(token)
  return res.json({
    message: 'Logout Successfully'
  })
}
export const emailVerifyController = async (
  req: Request<ParamsDictionary, any, EmailVerifyRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_email_verify_token
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    return res.json({
      message: 'User not found',
      status: 404
    })
  }
  if (user.email_verify_token === '') {
    return res.json({
      message: 'Email already verified before',
      status: 404
    })
  }
  const result = await usersService.verifyEmail(user_id)
  return res.json({
    message: 'Email verify successfully',
    result
  })
}

export const resendEmailVerifyController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization

  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.json({
      message: 'User not found',
      status: 404
    })
  }
  if (user.verify === UserVerifyStatusType.Verified) {
    return res.json({
      message: 'User already verified before',
      status: 402
    })
  }
  const result = await usersService.resendEmailVerify(user_id)
  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { _id, verify } = req.user as User
  const result = await usersService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify: verify })
  return res.json(result)
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordRequestBody>,
  res: Response,
  next: NextFunction
) => {
  return res.json({
    message: 'Verify forgot password successfully'
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_forgot_password_token
  const { password } = req.body
  const result = await usersService.resetPassword(user_id, password)
  return res.json({
    result
  })
}
export const profileController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization
  const result = await usersService.getProfile(user_id)
  return res.json({
    result
  })
}

export const updateProfileController = async (req: Request, res: Response, next: NextFunction) => {
  // const { user_id } = req.decoded_authorization
  // const result = await usersService.getProfile(user_id)
  return res.json({
    message: 'done'
  })
}
