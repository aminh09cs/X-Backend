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
