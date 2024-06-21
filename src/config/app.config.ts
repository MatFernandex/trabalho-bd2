import { registerAs } from '@nestjs/config'
import * as dotenv from 'dotenv'

dotenv.config()

export const AppConfig = registerAs(
  'app',
  (): Record<string, any> => ({
    API_PORT: Number(process.env.API_PORT ?? 3000),
    API_GLOBAL_PREFIX: process.env.API_GLOBAL_PREFIX ?? 'api',
    DATABASE_URL: String(process.env.DATABASE_URL),
  }),
)
