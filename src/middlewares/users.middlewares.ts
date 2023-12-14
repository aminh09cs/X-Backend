import { check, checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import usersService from '~/services/users.service'
import databaseService from '~/services/database.service'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { ErrorStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

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
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorStatus({ message: 'Access token is required', status: HTTP_STATUS.UNAUTHORIZED })
            }
            const access_token = (value || '').split(' ')[1] // replace('Bearer ),''
            if (!access_token) {
              throw new ErrorStatus({ message: 'Access token is required', status: HTTP_STATUS.UNAUTHORIZED })
            }
            const decoded_authorization = await verifyToken({
              token: access_token,
              secretKey: process.env.JWT_ACCESS_TOKEN_KEY as string
            })
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
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorStatus({ message: 'Refresh token is required', status: HTTP_STATUS.UNAUTHORIZED })
            }
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretKey: process.env.JWT_EMAIL_VERIFY_TOKEN_KEY as string }),
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

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorStatus({ message: 'Email verify token is required', status: HTTP_STATUS.UNAUTHORIZED })
            }

            const decoded_email_verify_token = await verifyToken({
              token: value,
              secretKey: process.env.JWT_EMAIL_VERIFY_TOKEN_KEY as string
            })

            req.decoded_email_verify_token = decoded_email_verify_token
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        trim: true,
        notEmpty: {
          errorMessage: 'Email is required'
        },
        isEmail: {
          errorMessage: 'Email is invalid'
        },
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value
            })
            if (user === null) throw new Error('User not found')
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorStatus({ message: 'Forget password token is required', status: HTTP_STATUS.UNAUTHORIZED })
            }
            try {
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretKey: process.env.JWT_FORGOT_PASSWORD_TOKEN_KEY as string
              })
              const { user_id } = decoded_forgot_password_token

              const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

              if (user === null) {
                throw new ErrorStatus({
                  message: 'User not found',
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              if (user.forgot_password_token !== value) {
                throw new ErrorStatus({
                  message: 'Forgot password token is invalid',
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
            } catch (err) {
              if (err instanceof JsonWebTokenError) {
                throw new ErrorStatus({ message: err.message, status: HTTP_STATUS.UNAUTHORIZED })
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

export const resetPasswordValidator = validate(
  checkSchema(
    {
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
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorStatus({ message: 'Forget password token is required', status: HTTP_STATUS.UNAUTHORIZED })
            }
            try {
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretKey: process.env.JWT_FORGOT_PASSWORD_TOKEN_KEY as string
              })
              const { user_id } = decoded_forgot_password_token

              const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

              if (user === null) {
                throw new ErrorStatus({
                  message: 'User not found',
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              if (user.forgot_password_token !== value) {
                throw new ErrorStatus({
                  message: 'Forgot password token is invalid',
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              req.decoded_forgot_password_token = decoded_forgot_password_token
            } catch (err) {
              if (err instanceof JsonWebTokenError) {
                throw new ErrorStatus({ message: err.message, status: HTTP_STATUS.UNAUTHORIZED })
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
