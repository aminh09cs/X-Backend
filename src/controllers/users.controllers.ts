import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterRequestBody } from '~/models/request/User.Request'
import usersService from '~/services/users.service'
export const loginController = (req: Request, res: Response) => {
  res.json({
    message: 'Login Successful'
  })
}
export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
  try {
    const result = await usersService.register(req.body)
    return res.json({
      message: 'Register Successfully',
      result
    })
  } catch (err: unknown) {
    return res.status(400).json({
      message: err
    })
  }
}
