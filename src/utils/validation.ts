import { Request, Response, NextFunction } from 'express'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import { validationResult, ValidationChain } from 'express-validator'
import { EntityError, ErrorStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'

export const validate = (schema: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await schema.run(req)
    const errors = validationResult(req)
    const errorsObject = errors.mapped()
    if (errors.isEmpty()) {
      return next()
    }

    const entityError = new EntityError({ errors: {} })

    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      if (
        //Errors of authorization
        msg instanceof ErrorStatus &&
        msg.status === HTTP_STATUS.UNAUTHORIZED &&
        msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY
      ) {
        return next(msg)
      }

      //Errors of validations
      entityError.errors[key] = errorsObject[key]
    }
    next(entityError)
  }
}
