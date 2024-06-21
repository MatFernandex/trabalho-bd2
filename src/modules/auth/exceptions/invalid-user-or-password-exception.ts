import { BadRequestException } from '@nestjs/common'

export class InvalidUserOrPasswordException extends BadRequestException {
  constructor(error?: string) {
    super('error.invalidUserOrPassword', error)
  }
}
