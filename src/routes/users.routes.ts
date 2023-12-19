import { Router } from 'express'
import {
  loginController,
  registerController,
  logoutController,
  emailVerifyController,
  resendEmailVerifyController,
  forgotPasswordController,
  verifyForgotPasswordController,
  resetPasswordController,
  profileController,
  updateProfileController,
  getUserProfileController,
  followController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/filters.middlewares'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  forgotPasswordValidator,
  verifyForgotPasswordValidator,
  resetPasswordValidator,
  verifiedUserValidator,
  updateProfileValidator,
  followValidator
} from '~/middlewares/users.middlewares'
import { UpdateProfileRequestBody } from '~/models/request/User.Request'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

//Routes for authenticating user
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

usersRouter.post('/email-verify', emailVerifyTokenValidator, wrapRequestHandler(emailVerifyController))
usersRouter.post('/resend-email-verify', accessTokenValidator, wrapRequestHandler(resendEmailVerifyController))
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

//Router for user(profile, information)

usersRouter.get('/profile', accessTokenValidator, wrapRequestHandler(profileController))
usersRouter.patch(
  '/profile',
  accessTokenValidator,
  verifiedUserValidator,
  updateProfileValidator,
  filterMiddleware<UpdateProfileRequestBody>(['name', 'date_of_birth', 'bio', 'location', 'username', 'avatar']),
  wrapRequestHandler(updateProfileController)
)

usersRouter.get('/:username', wrapRequestHandler(getUserProfileController))

//Router user follow somebody
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)

export default usersRouter
