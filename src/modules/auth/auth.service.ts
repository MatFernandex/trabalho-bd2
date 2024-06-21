import { PrismaService } from '@/database/prisma.service'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { type JwtPayload } from './dtos/jwt-payload-dto'
import { type JwtResponse } from './dtos/jwt-response-dto'
import { type LoginPayload } from './dtos/login-payload-dto'
import { type PgUserFromCatalog } from './dtos/pg-user-from-catalog-dto'
import { type RegisterPayload } from './dtos/register-payload-dto'
import { DatabaseConnectionFailException } from './exceptions/database-connection-fail-exception'
import { InvalidUserOrPasswordException } from './exceptions/invalid-user-or-password-exception'
import { UserAlreadyExistsException } from './exceptions/user-already-exists-exception'

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
      throw new DatabaseConnectionFailException('Falha ao conectar ao banco de dados.')
    }
  }

  private async findPgUserByUsername({
    username,
  }: Pick<LoginPayload, 'username'>): Promise<PgUserFromCatalog | undefined> {
    const selectPgUserQuery = `SELECT * FROM pg_catalog.pg_user WHERE usename = '${username}';`
    const queryRows = await this.prisma.$queryRawUnsafe<PgUserFromCatalog[]>(selectPgUserQuery)
    return queryRows.length > 0 ? queryRows[0] : undefined
  }

  private async createPgUser({ username, password }: UserPayload): Promise<void> {
    const pgUser = await this.findPgUserByUsername({ username })

    if (pgUser) {
      throw new UserAlreadyExistsException(`Usuário "${username}" já existe.`)
    }

    // SQL command to create a new PostgreSQL user
    const createUserSql = `CREATE USER "${username}" WITH PASSWORD '${password}';`

    // Execute the SQL command to create the user
    await this.prisma.$executeRawUnsafe(createUserSql)

    // Grant CONNECT on the database
    const grantConnectSql = `GRANT CONNECT ON DATABASE postgres TO "${username}";`
    await this.prisma.$executeRawUnsafe(grantConnectSql)

    // Grant USAGE on the schema
    const grantUsageSql = `GRANT USAGE ON SCHEMA public TO "${username}";`
    await this.prisma.$executeRawUnsafe(grantUsageSql)

    // Grant SELECT on all tables in the schema
    const grantSelectSql = `GRANT SELECT ON ALL TABLES IN SCHEMA public TO "${username}";`
    await this.prisma.$executeRawUnsafe(grantSelectSql)

    // Set the default privileges for future tables created in the schema
    const setDefaultPrivilegesSql = `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO "${username}";`
    await this.prisma.$executeRawUnsafe(setDefaultPrivilegesSql)
  }

  async login({ username, password }: UserPayload): Promise<JwtResponse> {
    const user = await this.prisma.tb_usuarios.findFirst({ where: { usu_nome: username } })

    if (!user) {
      throw new InvalidUserOrPasswordException('Usuário ou senha inválidos.')
    }

    if (user.usu_senha !== password) {
      throw new InvalidUserOrPasswordException('Usuário ou senha inválidos.')
    }

    /** Updates the prismaService credentials */
    await this.loginPrismaService({ username, password })

    const jwtPayload: JwtPayload = { usu_codigo: Number(user.usu_codigo) }

    return { access_token: this.jwtService.sign(jwtPayload) }
  }

  async register({ username, password, role }: UserPayload & RegisterPayload): Promise<JwtResponse> {
    const existingUserRecord = await this.prisma.tb_usuarios.findFirst({ where: { usu_nome: username } })

    if (existingUserRecord) {
      throw new UserAlreadyExistsException(`Usuário "${username}" já existe.`)
    }

    const user = await this.prisma.tb_usuarios.create({
      data: {
        usu_nome: username,
        usu_senha: password,
        usu_role: role ?? 'USUARIO',
      },
    })

    /** Creates the PG user in catalog with the same credentials */
    await this.createPgUser({ username, password })

    const jwtPayload: JwtPayload = { usu_codigo: Number(user.usu_codigo) }

    return { access_token: this.jwtService.sign(jwtPayload) }
  }
}
