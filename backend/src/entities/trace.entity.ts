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
import { Product } from './product.entity';

export enum TraceStage {
  RAW_MATERIAL = 'raw_material',
  MANUFACTURING = 'manufacturing',
  QUALITY_CONTROL = 'quality_control',
  PACKAGING = 'packaging',
  DISTRIBUTION = 'distribution',
  RETAIL = 'retail',
  DELIVERY = 'delivery',
}

@Entity('traces')
export class Trace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  @Index()
  productId: string;

  @Column({
    type: 'enum',
    enum: TraceStage,
  })
  stage: TraceStage;

  @Column({ name: 'document_hash' })
  documentHash: string;

  @Column()
  issuer: string;

  @Column({ nullable: true, name: 'issuer_name' })
  issuerName: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  coordinates: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  temperature: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  humidity: number | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true, name: 'certificate_url' })
  certificateUrl: string;

  @Column({ nullable: true, name: 'certificate_hash' })
  certificateHash: string;

  @Column({ default: false, name: 'is_verified' })
  isVerified: boolean;

  @Column({ nullable: true, name: 'verification_method' })
  verificationMethod: string;

  @Column({ nullable: true, name: 'chain_hash' })
  chainHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系
  @ManyToOne(() => Product, (product) => product.traces)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
