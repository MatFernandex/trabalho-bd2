import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginPayload } from './dtos/login-payload-dto'
import { RegisterPayload } from './dtos/register-payload-dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() { username, password }: LoginPayload): Promise<any> {
    const data = await this.authService.login({ username, password })
    return { data }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() { username, password }: RegisterPayload): Promise<any> {
    const data = await this.authService.register({ username, password })
    return { data }
  }
}
