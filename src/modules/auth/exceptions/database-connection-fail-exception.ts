import { InternalServerErrorException } from '@nestjs/common'

export class DatabaseConnectionFailException extends InternalServerErrorException {
  constructor(error?: string) {
    super('error.databaseConnectionFail', error)
  }
}
