import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrderService, CreateOrderDto, PaymentResult, RefundResult } from './order.service';
import { Order, OrderStatus, PaymentMethod } from '../../entities/order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class CreateOrderRequestDto {
  @IsString()
  items: string; // JSON string of items array

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  shippingAddress: string;

  @IsOptional()
  @IsString()
  billingAddress?: string;
}

export class PaymentRequestDto {
  @IsString()
  paymentData: string; // JSON string of payment data
}

export class RefundRequestDto {
  @IsString()
  reason: string;
}

export class UpdateStatusRequestDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  metadata?: any;
}

@Controller('api/v1/orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderRequestDto): Promise<Order> {
    const userId = req.user.id;
    
    // Parse items from JSON string
    const items = JSON.parse(createOrderDto.items);
    
    const orderData: CreateOrderDto = {
      userId,
      items,
      paymentMethod: createOrderDto.paymentMethod,
      shippingAddress: createOrderDto.shippingAddress,
      billingAddress: createOrderDto.billingAddress,
    };

    return this.orderService.createOrder(orderData);
  }

  @Get()
  async getUserOrders(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ orders: Order[]; total: number }> {
    const userId = req.user.id;
    return this.orderService.findByUserId(userId, page, limit);
  }

  @Get('all')
  async getAllOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ orders: Order[]; total: number }> {
    return this.orderService.findAll(page, limit);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string): Promise<Order> {
    const order = await this.orderService.findById(id);
    if (!order) {
      throw new Error('订单不存在');
    }
    return order;
  }

  @Get(':id/tracking')
  async getOrderTracking(@Param('id') id: string): Promise<any> {
    return this.orderService.getOrderTracking(id);
  }

  @Post(':id/payment')
  @HttpCode(HttpStatus.OK)
  async processPayment(
    @Param('id') id: string,
    @Body() paymentRequest: PaymentRequestDto,
  ): Promise<PaymentResult> {
    const paymentData = JSON.parse(paymentRequest.paymentData);
    return this.orderService.processPayment(id, paymentData);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ): Promise<Order> {
    return this.orderService.cancelOrder(id, body.reason);
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  async processRefund(
    @Param('id') id: string,
    @Body() refundRequest: RefundRequestDto,
  ): Promise<RefundResult> {
    return this.orderService.processRefund(id, refundRequest.reason);
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateRequest: UpdateStatusRequestDto,
  ): Promise<Order> {
    return this.orderService.updateOrderStatus(id, updateRequest.status, updateRequest.metadata);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOrder(@Param('id') id: string): Promise<void> {
    // 软删除：只允许删除已取消或已退款的订单
    const order = await this.orderService.findById(id);
    if (!order) {
      throw new Error('订单不存在');
    }

    if (order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.REFUNDED) {
      throw new Error('只能删除已取消或已退款的订单');
    }

    // 实际删除逻辑
    // await this.orderService.deleteOrder(id);
  }
}

// 公开的订单状态查询接口（无需认证）
@Controller('api/v1/public/orders')
export class PublicOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get(':orderNumber/status')
  async getOrderStatusByNumber(@Param('orderNumber') orderNumber: string): Promise<any> {
    // 这里应该通过订单号查询订单状态
    // 为了演示，返回模拟数据
    return {
      orderNumber,
      status: 'shipped',
      trackingNumber: 'TRK123456789',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3天后
    };
  }
}