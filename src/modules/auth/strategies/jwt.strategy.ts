import { PrismaService } from '@/database/prisma.service'
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { type JwtPayload } from '../dtos/jwt-payload-dto'
import { UserNotFoundException } from '../exceptions/user-not-found-exception'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    })
  }

  async validate(payload: JwtPayload): Promise<any> {
    const user = await this.prismaService.tb_usuarios.findUnique({ where: { usu_codigo: Number(payload.usu_codigo) } })

    if (!user) {
      throw new UserNotFoundException('Usuário não encontrado.')
    }

    return user
  }
}
