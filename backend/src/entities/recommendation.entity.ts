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

@Entity('recommendations')
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'input_hash' })
  inputHash: string;

  @Column({ type: 'jsonb', name: 'input_data' })
  inputData: Record<string, any>;

  @Column({ type: 'jsonb', name: 'result_json' })
  resultJson: Array<{
    productId: string;
    productName: string;
    score: number;
    reason: string;
    category: string;
  }>;

  @Column({ name: 'model_version' })
  modelVersion: string;

  @Column({ nullable: true, name: 'model_name' })
  modelName: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence: number;

  @Column({ nullable: true, name: 'processing_time' })
  processingTime: number;

  @Column({ default: false, name: 'is_viewed' })
  isViewed: boolean;

  @Column({ nullable: true, name: 'viewed_at' })
  viewedAt: Date;

  @Column({ default: false, name: 'is_accepted' })
  isAccepted: boolean;

  @Column({ nullable: true, name: 'accepted_at' })
  acceptedAt: Date;

  @Column({ nullable: true })
  feedback: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系
  @ManyToOne(() => User, (user) => user.recommendations)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
