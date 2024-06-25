import loadConfig from '@/config'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from './database/prisma.service'
import { AuthModule } from './modules/auth/auth.module'
import { ProductModule } from './modules/products/product.module'
import { UserModule } from './modules/user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: loadConfig,
      envFilePath: ['.env'],
    }),
    AuthModule,
    ProductModule,
    UserModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
