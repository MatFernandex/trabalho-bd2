import { type Role } from '@prisma/client'

export class JwtPayload {
  codigo: number
  role: Role
}
