import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CRYPTO = 'crypto',
  WALLET = 'wallet',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ unique: true, name: 'order_number' })
  @Index()
  orderNumber: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
    name: 'payment_method',
  })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true, name: 'payment_id' })
  paymentId: string;

  @Column({ nullable: true, name: 'payment_status' })
  paymentStatus: string;

  @Column({ type: 'jsonb' })
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    sku: string;
  }>;

  @Column({ nullable: true, name: 'shipping_address' })
  shippingAddress: string;

  @Column({ nullable: true, name: 'billing_address' })
  billingAddress: string;

  @Column({ nullable: true, name: 'tracking_number' })
  trackingNumber: string;

  @Column({ nullable: true, name: 'shipping_method' })
  shippingMethod: string;

  @Column({ nullable: true, name: 'estimated_delivery' })
  estimatedDelivery: Date;

  @Column({ nullable: true, name: 'actual_delivery' })
  actualDelivery: Date;

  @Column({ nullable: true, name: 'chain_event_hash' })
  chainEventHash: string;

  @Column({ nullable: true, name: 'refund_hash' })
  refundHash: string;

  @Column({ nullable: true, name: 'refund_reason' })
  refundReason: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
