import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import usersService from '~/services/users.service'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({
      message: 'Email or password must be provided'
    })
  }
  next()
}
export const registerValidator = checkSchema({
  name: {
    notEmpty: true,
    isLength: { options: { min: 1, max: 99 } },
    trim: true,
    errorMessage: 'Invalid name'
  },
  email: {
    notEmpty: true,
    isEmail: true,
    trim: true,
    errorMessage: 'Invalid email',
    custom: {
      options: async (value) => {
        const isExistEmail = await usersService.checkEmailExist(value)
        if (isExistEmail) throw new Error('Email already exits')
        return true
      }
    }
  },
  password: {
    notEmpty: true,
    isString: true,
    isLength: { options: { min: 8, max: 99 } },
    trim: true,
    errorMessage: 'Password should be at least 8 chars'
  },
  confirm_password: {
    notEmpty: true,
    isString: true,
    isLength: { options: { min: 8, max: 99 } },
    trim: true,
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Confirm password must be same with password')
        }
        return true
      }
    }
  },
  date_of_birth: {
    isISO8601: {
      options: {
        strict: true,
        strictSeparator: true
      }
    }
  }
})
