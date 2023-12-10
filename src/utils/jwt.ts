import jwt from 'jsonwebtoken'

interface jwtTokenType {
  payload: string | Buffer | object
  privateKey?: string
  options?: jwt.SignOptions
}

export const signToken = ({
  payload,
  privateKey = process.env.JWT_KEY as string,
  options = { algorithm: 'HS256' }
}: jwtTokenType) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err: any, token: any) => {
      if (err) throw reject(err)

      resolve(token as string)
    })
  })
}
