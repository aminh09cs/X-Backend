import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGE } from '~/constants/message'

type ErrorsEntityType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

export class ErrorStatus {
  message: string
  status: number

  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

export class EntityError extends ErrorStatus {
  errors: ErrorsEntityType
  constructor({ errors }: { message?: string; status?: number; errors: ErrorsEntityType }) {
    super({ message: USERS_MESSAGE.VALIDATION_ERROR, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}
