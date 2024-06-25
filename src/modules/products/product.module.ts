import { PrismaService } from '@/database/prisma.service'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from '../auth/strategies/jwt.strategy'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME },
    }),
  ],
  controllers: [ProductController],
  providers: [JwtStrategy, PrismaService, ProductService],
})
export class ProductModule {}
