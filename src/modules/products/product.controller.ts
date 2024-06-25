import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { tb_produto } from '@prisma/client'
import { ProductService } from './product.service'

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllProducts(): Promise<tb_produto[]> {
    return await this.productService.getAllProducts()
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createProduct(@Body() product: tb_produto): Promise<tb_produto> {
    return await this.productService.createProduct(product)
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async updateProduct(@Param('id') id: number, @Body() product: tb_produto): Promise<tb_produto> {
    return await this.productService.updateProduct(id, product)
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteProduct(@Param('id') id: number): Promise<tb_produto> {
    return await this.productService.deleteProduct(id)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('buy')
  async buyProduct(
    @Body() buyProductDto: { employeeId: number; productIds: number[]; quantities: number[] },
  ): Promise<number> {
    const { employeeId, productIds, quantities } = buyProductDto
    return await this.productService.buyProduct(employeeId, productIds, quantities)
  }
}
