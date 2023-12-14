import jwt from 'jsonwebtoken'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorStatus } from '~/models/Errors'
import '~/utils/dotenv'

interface jwtTokenType {
  payload: string | Buffer | object
  privateKey: string
  options?: jwt.SignOptions
}

export const signToken = ({ payload, privateKey, options = { algorithm: 'HS256' } }: jwtTokenType) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err: any, token: any) => {
      if (err) throw reject(err)

      resolve(token as string)
    })
  })
}

export const verifyToken = ({ token, secretKey }: { token: string; secretKey: string }) => {
  return new Promise<jwt.JwtPayload>((resolve, reject) => {
    jwt.verify(token, secretKey, (err: any, decoded: any) => {
      // throw reject(err)
      if (err) throw new ErrorStatus({ message: err.message, status: HTTP_STATUS.UNAUTHORIZED })
      resolve(decoded as jwt.JwtPayload)
    })
  })
}
