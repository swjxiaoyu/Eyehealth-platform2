import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { Report } from './report.entity';
import { Order } from './order.entity';
import { Recommendation } from './recommendation.entity';
import { EncryptionKey } from './encryption-key.entity';
import { EyeHealthProfile } from './eye-health-profile.entity';
import { EyeHealthRecord } from './eye-health-record.entity';
import { Achievement, UserPoints, PointTransaction, DailyChallenge } from './gamification.entity';
import { Notification } from './notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  @Index()
  did: string;

  @Column({ unique: true, nullable: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  dob: Date;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: false, name: 'is_verified' })
  isVerified: boolean;

  @Column({ nullable: true, name: 'wallet_address' })
  walletAddress: string;

  @Column({ nullable: true, name: 'public_key' })
  publicKey: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系
  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Recommendation, (recommendation) => recommendation.user)
  recommendations: Recommendation[];

  @OneToMany(() => EncryptionKey, (encryptionKey) => encryptionKey.user)
  encryptionKeys: EncryptionKey[];

  @OneToOne(() => EyeHealthProfile, (profile) => profile.user)
  eyeHealthProfile: EyeHealthProfile;

  @OneToMany(() => EyeHealthRecord, (record) => record.user)
  eyeHealthRecords: EyeHealthRecord[];

  @OneToMany(() => Achievement, (achievement) => achievement.user)
  achievements: Achievement[];

  @OneToOne(() => UserPoints, (points) => points.user)
  userPoints: UserPoints;

  @OneToMany(() => PointTransaction, (transaction) => transaction.user)
  pointTransactions: PointTransaction[];

  @OneToMany(() => DailyChallenge, (challenge) => challenge.user)
  dailyChallenges: DailyChallenge[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
