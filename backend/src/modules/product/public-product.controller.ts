import { Controller, Get, Query, Param } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('api/v1/public/products')
export class PublicProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getPublicProducts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.productService.findAll({ page, limit, category, search });
  }

  @Get(':id')
  async getPublicProduct(@Param('id') id: string) {
    return this.productService.findById(id);
  }
}
