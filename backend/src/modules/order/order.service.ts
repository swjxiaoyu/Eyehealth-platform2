import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentMethod } from '../../entities/order.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export interface CreateOrderDto {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  billingAddress?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  transactionHash?: string;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  transactionHash?: string;
  error?: string;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { userId, items, paymentMethod, shippingAddress, billingAddress } = createOrderDto;

    // 验证用户存在
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证产品并计算总价
    let totalAmount = 0;
    const orderItems: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      sku: string;
    }> = [];

    for (const item of items) {
      const product = await this.productRepository.findOne({ where: { id: item.productId } });
      if (!product) {
        throw new NotFoundException(`产品 ${item.productId} 不存在`);
      }

      if (!product.isActive) {
        throw new BadRequestException(`产品 ${product.name} 已下架`);
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        sku: product.sku || `SKU-${product.id}`,
      });
    }

    // 生成订单号
    const orderNumber = this.generateOrderNumber();

    // 创建订单
    const order = this.orderRepository.create({
      userId,
      orderNumber,
      status: OrderStatus.PENDING,
      amount: totalAmount,
      currency: 'CNY',
      paymentMethod,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      metadata: {
        createdAt: new Date().toISOString(),
        source: 'web',
      },
    });

    return this.orderRepository.save(order);
  }

  async processPayment(orderId: string, paymentData: any): Promise<PaymentResult> {
    const order = await this.findById(orderId);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('订单状态不允许支付');
    }

    try {
      // 模拟支付处理
      const paymentResult = await this.simulatePayment(order, paymentData);
      
      if (paymentResult.success) {
        // 更新订单状态
        order.status = OrderStatus.PAID;
        order.paymentId = paymentResult.paymentId;
        order.paymentStatus = 'completed';
        if (paymentResult.transactionHash) {
          order.chainEventHash = paymentResult.transactionHash;
        }
        
        await this.orderRepository.save(order);

        // 记录到区块链（模拟）
        await this.recordOrderToBlockchain(order);
      }

      return paymentResult;
    } catch (error) {
      return {
        success: false,
        paymentId: '',
        error: error.message,
      };
    }
  }

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const order = await this.findById(orderId);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('已完成的订单无法取消');
    }

    order.status = OrderStatus.CANCELLED;
    order.metadata = {
      ...order.metadata,
      cancellationReason: reason,
      cancelledAt: new Date().toISOString(),
    };

    return this.orderRepository.save(order);
  }

  async processRefund(orderId: string, reason: string): Promise<RefundResult> {
    const order = await this.findById(orderId);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.SHIPPED) {
      throw new BadRequestException('订单状态不允许退款');
    }

    try {
      // 模拟退款处理
      const refundResult = await this.simulateRefund(order, reason);
      
      if (refundResult.success) {
        // 更新订单状态
        order.status = OrderStatus.REFUNDED;
        if (refundResult.transactionHash) {
          order.refundHash = refundResult.transactionHash;
        }
        order.refundReason = reason;
        
        await this.orderRepository.save(order);

        // 记录退款到区块链（模拟）
        await this.recordRefundToBlockchain(order, refundResult);
      }

      return refundResult;
    } catch (error) {
      return {
        success: false,
        refundId: '',
        error: error.message,
      };
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, metadata?: any): Promise<Order> {
    const order = await this.findById(orderId);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    order.status = status;
    if (metadata) {
      order.metadata = { ...order.metadata, ...metadata };
    }

    return this.orderRepository.save(order);
  }

  async getOrderTracking(orderId: string): Promise<any> {
    const order = await this.findById(orderId);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      actualDelivery: order.actualDelivery,
      shippingMethod: order.shippingMethod,
      timeline: this.generateOrderTimeline(order),
    };
  }

  async findById(id: string): Promise<Order | null> {
    return this.orderRepository.findOne({ 
      where: { id },
      relations: ['user']
    });
  }

  async findByUserId(userId: string, page: number = 1, limit: number = 10): Promise<{ orders: Order[]; total: number }> {
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { orders, total };
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ orders: Order[]; total: number }> {
    const [orders, total] = await this.orderRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { orders, total };
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  private async simulatePayment(order: Order, paymentData: any): Promise<PaymentResult> {
    // 模拟支付处理延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟支付成功/失败
    const success = Math.random() > 0.1; // 90% 成功率

    if (success) {
      const paymentId = `PAY-${uuidv4()}`;
      const transactionHash = crypto.randomBytes(32).toString('hex');

      return {
        success: true,
        paymentId,
        transactionHash,
      };
    } else {
      return {
        success: false,
        paymentId: '',
        error: '支付处理失败，请重试',
      };
    }
  }

  private async simulateRefund(order: Order, reason: string): Promise<RefundResult> {
    // 模拟退款处理延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 模拟退款成功/失败
    const success = Math.random() > 0.05; // 95% 成功率

    if (success) {
      const refundId = `REF-${uuidv4()}`;
      const transactionHash = crypto.randomBytes(32).toString('hex');

      return {
        success: true,
        refundId,
        transactionHash,
      };
    } else {
      return {
        success: false,
        refundId: '',
        error: '退款处理失败，请联系客服',
      };
    }
  }

  private async recordOrderToBlockchain(order: Order): Promise<void> {
    // 模拟区块链记录
    console.log(`记录订单到区块链: ${order.orderNumber}`);
    console.log(`交易哈希: ${order.chainEventHash}`);
    
    // 实际实现中，这里会调用区块链服务
    // await this.blockchainService.recordOrder(order);
  }

  private async recordRefundToBlockchain(order: Order, refundResult: RefundResult): Promise<void> {
    // 模拟区块链记录
    console.log(`记录退款到区块链: ${order.orderNumber}`);
    console.log(`退款哈希: ${refundResult.transactionHash}`);
    
    // 实际实现中，这里会调用区块链服务
    // await this.blockchainService.recordRefund(order, refundResult);
  }

  private generateOrderTimeline(order: Order): Array<{ status: string; timestamp: Date; description: string }> {
    const timeline = [
      {
        status: 'created',
        timestamp: order.createdAt,
        description: '订单已创建',
      },
    ];

    if (order.status === OrderStatus.PAID || order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      timeline.push({
        status: 'paid',
        timestamp: order.updatedAt,
        description: '订单已支付',
      });
    }

    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      timeline.push({
        status: 'shipped',
        timestamp: order.updatedAt,
        description: '订单已发货',
      });
    }

    if (order.status === OrderStatus.DELIVERED) {
      timeline.push({
        status: 'delivered',
        timestamp: order.actualDelivery || order.updatedAt,
        description: '订单已送达',
      });
    }

    if (order.status === OrderStatus.CANCELLED) {
      timeline.push({
        status: 'cancelled',
        timestamp: order.updatedAt,
        description: '订单已取消',
      });
    }

    if (order.status === OrderStatus.REFUNDED) {
      timeline.push({
        status: 'refunded',
        timestamp: order.updatedAt,
        description: '订单已退款',
      });
    }

    return timeline;
  }
}