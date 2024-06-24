import { PrismaService } from '@/database/prisma.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { type tb_funcionarios, type tb_usuarios } from '@prisma/client'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { type JwtPayload } from '../dtos/jwt-payload-dto'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    })
  }

  private async validateUsuario(payload: JwtPayload): Promise<tb_usuarios> {
    const usuario = await this.prismaService.tb_usuarios.findUnique({
      where: { usu_codigo: payload.codigo },
    })

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado')
    }

    return usuario
  }

  private async validateFuncionario(payload: JwtPayload): Promise<tb_funcionarios> {
    const funcionario = await this.prismaService.tb_funcionarios.findUnique({
      where: { fun_codigo: payload.codigo },
    })

    if (!funcionario) {
      throw new NotFoundException('Funcionário não encontrado')
    }

    return funcionario
  }

  async validate(payload: JwtPayload): Promise<tb_usuarios | tb_funcionarios> {
    return payload.role === 'VENDEDOR' ? await this.validateFuncionario(payload) : await this.validateUsuario(payload)
  }
}
