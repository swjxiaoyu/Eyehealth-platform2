import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductTestController } from './product-test.controller';
import { PublicProductController } from './public-product.controller';
import { ProductService } from './product.service';
import { Product } from '../../entities/product.entity';
import { Trace } from '../../entities/trace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Trace])],
  controllers: [ProductController, ProductTestController, PublicProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}

