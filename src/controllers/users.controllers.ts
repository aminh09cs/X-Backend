import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { RegisterRequestBody } from '~/models/request/User.Request'
import usersService from '~/services/users.service'
export const loginController = async (req: Request, res: Response) => {
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
export const logoutController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req
  const token = refresh_token?.token as string
  const result = await usersService.logout(token)
  return res.json({
    message: 'Logout Successfully'
  })
}
