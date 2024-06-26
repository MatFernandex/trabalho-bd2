import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Controller('user')
export class UserController {
  @UseGuards(AuthGuard('jwt'))
  @Get()
  GetUser(@Req() req) {
    return req.user
  }
}
