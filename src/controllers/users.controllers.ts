import { Request, Response } from 'express'
import usersService from '~/services/users.service'
export const loginController = (req: Request, res: Response) => {
  res.json({
    message: 'Login Successful'
  })
}
export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const result = await usersService.register({ email, password })
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
