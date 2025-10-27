import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Trace } from './trace.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  sku: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'manufacturer_id' })
  manufacturerId: string;

  @Column({ name: 'manufacturer_name' })
  manufacturerName: string;

  @Column({ unique: true, name: 'qr_code' })
  @Index()
  qrCode: string;

  @Column({ nullable: true })
  barcode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column({ type: 'jsonb', nullable: true })
  specifications: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  ingredients: string[];

  @Column({ nullable: true, name: 'expiry_date' })
  expiryDate: Date;

  @Column({ nullable: true, name: 'batch_number' })
  batchNumber: string;

  @Column({ nullable: true, name: 'serial_number' })
  serialNumber: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: false, name: 'is_verified' })
  isVerified: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系
  @OneToMany(() => Trace, (trace) => trace.product)
  traces: Trace[];
}
