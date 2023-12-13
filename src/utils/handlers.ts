import { NextFunction, Request, Response } from 'express'
type Func = (req: Request, res: Response, next: NextFunction) => Promise<any>
export const wrapRequestHandler = (func: Func) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Promise.resolve(func(req, res, next)).catch(next)
    try {
      await func(req, res, next)
    } catch (err) {
      next(err)
    }
  }
}
