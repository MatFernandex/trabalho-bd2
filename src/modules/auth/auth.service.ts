import { PrismaService } from '@/database/prisma.service'
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { type JwtPayload } from './dtos/jwt-payload-dto'
import { type JwtResponse } from './dtos/jwt-response-dto'
import { type LoginPayload } from './dtos/login-payload-dto'
import { type PgUserFromCatalog } from './dtos/pg-user-from-catalog-dto'
import { type RegisterPayload } from './dtos/register-payload-dto'

type UserPayload = Pick<LoginPayload & RegisterPayload, 'username' | 'password'>

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private createDatabaseUrlFromPayload({ username, password }: UserPayload): string {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let DATABASE_URL: string = this.config.get<string>('app.DATABASE_URL')!

    const urlParts = DATABASE_URL.split('//')
    if (urlParts.length > 1) {
      const [protocol, rest] = urlParts
      const restParts = rest.split('@')
      if (restParts.length > 1) {
        const [credentials, hostAndDatabase] = restParts
        const credentialsParts = credentials.split(':')

        if (credentialsParts.length > 1) {
          const originalUsername = credentialsParts[0]
          const suffix = originalUsername.split('.').slice(1).join('.')
          const newUsernameWithSuffix = `${username}.${suffix}`
          DATABASE_URL = `${protocol}//${newUsernameWithSuffix}:${password}@${hostAndDatabase}`
        }
      }
    }

    return DATABASE_URL
  }

  async loginPrismaService({ username, password }: UserPayload): Promise<PrismaService> {
    try {
      this.prisma = new PrismaService({
        datasources: {
          db: {
            url: this.createDatabaseUrlFromPayload({ username, password }),
          },
        },
      })

      await this.prisma.$connect()

      return this.prisma
    } catch (error) {
      throw new InternalServerErrorException('Falha ao conectar ao banco de dados.')
    }
  }

  private async findPgUserByUsername({
    username,
  }: Pick<LoginPayload, 'username'>): Promise<PgUserFromCatalog | undefined> {
    const selectPgUserQuery = `SELECT * FROM pg_catalog.pg_user WHERE usename = '${username}';`
    const queryRows = await this.prisma.$queryRawUnsafe<PgUserFromCatalog[]>(selectPgUserQuery)
    return queryRows.length > 0 ? queryRows[0] : undefined
  }

  private async createPgUser({ username, password, role }: UserPayload & Pick<RegisterPayload, 'role'>): Promise<void> {
    const pgUser = await this.findPgUserByUsername({ username })

    if (pgUser) {
      throw new BadRequestException(`Usuário "${username}" já existe.`)
    }

    // HACK: This is a workaround to create a user with CREATEROLE permission
    // Adjusted SQL command to include CREATEROLE permission
    const createUserSql = `CREATE USER "${username}" WITH PASSWORD '${password}' CREATEROLE;`

    // Execute the adjusted SQL command to create the user with CREATEROLE permission
    await this.prisma.$executeRawUnsafe(createUserSql)

    // Determine the group role based on the user's role
    const groupRole = role === 'VENDEDOR' ? 'vendedor' : 'cliente'

    // Grant the group role to the user
    const grantGroupRoleSql = `GRANT "${groupRole}" TO "${username}";`
    await this.prisma.$executeRawUnsafe(grantGroupRoleSql)
  }

  async login({ username, password, role }: UserPayload & LoginPayload): Promise<JwtResponse> {
    let user
    let jwtPayload: JwtPayload

    if (role === 'VENDEDOR') {
      user = await this.prisma.tb_funcionarios.findFirst({ where: { fun_nome: username } })

      if (!user) {
        throw new BadRequestException('Funcionário ou senha inválidos.')
      }

      if (user.fun_senha !== password) {
        throw new BadRequestException('Funcionário ou senha inválidos.')
      }

      jwtPayload = { codigo: Number(user.fun_codigo), role: 'VENDEDOR' }
    } else {
      user = await this.prisma.tb_usuarios.findFirst({ where: { usu_nome: username } })

      if (!user) {
        throw new BadRequestException('Usuário ou senha inválidos.')
      }

      if (user.usu_senha !== password) {
        throw new BadRequestException('Usuário ou senha inválidos.')
      }

      jwtPayload = { codigo: Number(user.usu_codigo), role: user.usu_role }
    }

    /** Updates the prismaService credentials */
    await this.loginPrismaService({ username, password })

    return { access_token: this.jwtService.sign(jwtPayload) }
  }

  async register({ username, password, cpf, funcao, role }: UserPayload & RegisterPayload): Promise<JwtResponse> {
    // Validate required fields for VENDEDOR role
    if (role === 'VENDEDOR' && (!cpf || !funcao)) {
      throw new BadRequestException('O CPF e a função são obrigatórios para o role VENDEDOR.')
    }

    // Check if username already exists in the respective table based on role
    const existingRecord = await (role === 'VENDEDOR'
      ? this.prisma.tb_funcionarios.findFirst({ where: { fun_nome: username } })
      : this.prisma.tb_usuarios.findFirst({ where: { usu_nome: username } }))

    if (existingRecord) {
      throw new BadRequestException(`${role === 'VENDEDOR' ? 'Funcionario' : 'Usuário'} "${username}" já existe.`)
    }

    // Create new record in the respective table based on role
    const newRecord =
      role === 'VENDEDOR'
        ? await this.prisma.tb_funcionarios.create({
            data: {
              fun_nome: username,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              fun_cpf: cpf!,
              fun_senha: password,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              fun_funcao: funcao!,
            },
          })
        : await this.prisma.tb_usuarios.create({
            data: {
              usu_nome: username,
              usu_senha: password,
              usu_role: 'USUARIO',
            },
          })

    // Create the PG user in catalog with the same credentials and assigns group role based on user role
    await this.createPgUser({ username, password, role })

    // Prepare JWT payload and return JWT response
    const jwtPayload: JwtPayload = {
      // @ts-expect-error - The role is always 'VENDEDOR' when creating a new VENDEDOR record
      codigo: Number(role === 'VENDEDOR' ? newRecord.fun_codigo : newRecord.usu_codigo),
      role: role === 'VENDEDOR' ? 'VENDEDOR' : 'USUARIO',
    }

    return { access_token: this.jwtService.sign(jwtPayload) }
  }
}
