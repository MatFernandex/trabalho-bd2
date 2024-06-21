import { registerAs } from '@nestjs/config'
import * as dotenv from 'dotenv'

dotenv.config()

export const AppConfig = registerAs(
  'app',
  (): Record<string, any> => ({
    API_PORT: Number(process.env.API_PORT ?? 4000),
    API_GLOBAL_PREFIX: process.env.API_GLOBAL_PREFIX ?? 'api',
    JWT_SECRET_KEY: String(process.env.JWT_SECRET_KEY),
    JWT_EXPIRATION_TIME: String(process.env.JWT_EXPIRATION_TIME),
    DATABASE_URL: String(process.env.DATABASE_URL),
  }),
)
