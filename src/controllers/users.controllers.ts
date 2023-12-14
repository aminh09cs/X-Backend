import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UserVerifyStatusType } from '~/constants/enums'
import {
  EmailVerifyRequestBody,
  ForgotPasswordRequestBody,
  LoginRequestBody,
  RegisterRequestBody,
  VerifyForgotPasswordRequestBody
} from '~/models/request/User.Request'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.service'
import usersService from '~/services/users.service'
export const loginController = async (req: Request<ParamsDictionary, any, LoginRequestBody>, res: Response) => {
  const { user } = req
  const _id = user?._id as ObjectId
  const result = await usersService.login(_id.toString())
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
  const result = await usersService.logout(token)
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
  const { _id } = req.user as User
  const result = await usersService.forgotPassword((_id as ObjectId).toString())
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
