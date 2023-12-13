import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import usersService from '~/services/users.service'
import databaseService from '~/services/database.service'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { ErrorStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { JsonWebTokenError } from 'jsonwebtoken'

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: 'Email is required'
        },
        isEmail: {
          errorMessage: 'Email is invalid'
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (user === null) throw new Error('Email or password not exists')
            req.user = user
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: 'Password is required'
        },
        isString: true,
        isLength: {
          options: { min: 8, max: 99 },
          errorMessage: 'Password should be at least 8 chars'
        },
        trim: true
      }
    },
    ['body']
  )
)
export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: 'Name is required'
        },
        isLength: { options: { min: 1, max: 99 } },
        trim: true
      },
      email: {
        notEmpty: {
          errorMessage: 'Email is required'
        },
        isEmail: {
          errorMessage: 'Email is invalid'
        },
        trim: true,
        custom: {
          options: async (value) => {
            const isExistEmail = await usersService.checkEmailExist(value)
            if (isExistEmail) throw new Error('Email already exits')
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: 'Password is required'
        },
        isString: true,
        isLength: {
          options: { min: 8, max: 99 },
          errorMessage: 'Password should be at least 8 chars'
        },
        trim: true
      },
      confirm_password: {
        notEmpty: {
          errorMessage: 'Confirm password is required'
        },
        isString: true,
        isLength: {
          options: { min: 8, max: 99 },
          errorMessage: 'Confirm password should be at least 8 chars'
        },
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
        notEmpty: {
          errorMessage: 'Date of birth is required'
        },
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          }
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: { errorMessage: 'Access token is required' },
        custom: {
          options: async (value: string, { req }) => {
            const access_token = value.split(' ')[1] // replace('Bearer ),''
            if (!access_token) {
              throw new ErrorStatus({ message: 'Access token is required', status: HTTP_STATUS.UNAUTHORIZED })
            }
            const decoded_authorization = await verifyToken({ token: access_token })
            req.decoded_authorization = decoded_authorization

            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: { errorMessage: 'Refresh token is required' },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value }),
                databaseService.refreshTokens.findOne({ token: value })
              ])
              if (refresh_token === null) {
                throw new ErrorStatus({
                  message: 'Refresh token is used or not exist',
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              req.decoded_refresh_token = decoded_refresh_token
              req.refresh_token = refresh_token
            } catch (err) {
              if (err instanceof JsonWebTokenError) {
                throw new ErrorStatus({ message: 'Refresh token is invalid', status: HTTP_STATUS.UNAUTHORIZED })
              }

              throw err
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
