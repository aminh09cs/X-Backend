import { Request, Response, NextFunction } from 'express'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import { validationResult, ValidationChain } from 'express-validator'

export const validate = (schema: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await schema.run(req)
    const errors = validationResult(req)

    if (errors.isEmpty()) {
      return next()
    }
    res.status(400).json({ errors: errors.mapped() })
  }
}
