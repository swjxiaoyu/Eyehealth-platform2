import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController, PublicOrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from '../../entities/order.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, User])],
  controllers: [OrderController, PublicOrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}