import { PrismaService } from '@/database/prisma.service'
import { Injectable } from '@nestjs/common'
import { type tb_produto } from '@prisma/client'

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllProducts(): Promise<tb_produto[]> {
    return await this.prisma.tb_produto.findMany()
  }

  async createProduct(product: tb_produto): Promise<tb_produto> {
    return await this.prisma.tb_produto.create({ data: product })
  }

  async updateProduct(id: number, product: tb_produto): Promise<tb_produto> {
    return await this.prisma.tb_produto.update({ where: { pro_codigo: id }, data: product })
  }

  async deleteProduct(id: number): Promise<tb_produto> {
    return await this.prisma.tb_produto.delete({ where: { pro_codigo: id } })
  }

  async buyProduct(employeeId: number, productIds: number[], quantities: number[]): Promise<number> {
    // Convert arrays to PostgreSQL array literals
    const productIdsArrayLiteral = `{${productIds.join(',')}}`
    const quantitiesArrayLiteral = `{${quantities.join(',')}}`

    // Execute the PostgreSQL function to buy the products
    return await this.prisma.$queryRaw`
      SELECT realizar_venda_com_verificacao(
        ${employeeId},
        ${productIdsArrayLiteral}::int[],
        ${quantitiesArrayLiteral}::int[]
      ) AS venda_id;
    `
  }
}
