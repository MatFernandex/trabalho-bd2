import loadConfig from '@/config'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from './database/prisma.service'
import { AuthModule } from './modules/auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: loadConfig,
      envFilePath: ['.env'],
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
