import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { useContainer } from 'class-validator'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get<ConfigService>(ConfigService)

  const logger = new Logger()

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const PORT: number = config.get<number>('app.API_PORT')!
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const GLOBAL_PREFIX: string = config.get<string>('app.API_GLOBAL_PREFIX')!

  app.setGlobalPrefix(GLOBAL_PREFIX)
  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  await app.listen(PORT, () => {
    /** Callback */
    logger.log(`Server is running on PORT ${PORT} 🚀`)
  })
}

void bootstrap()
