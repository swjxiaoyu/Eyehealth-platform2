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

export enum AchievementType {
  DAILY_LOGIN = 'daily_login',
  HEALTH_RECORD = 'health_record',
  EXERCISE_COMPLETE = 'exercise_complete',
  SCREEN_TIME_LIMIT = 'screen_time_limit',
  BREAK_REMINDER = 'break_reminder',
  WEEKLY_GOAL = 'weekly_goal',
  MONTHLY_GOAL = 'monthly_goal',
  STREAK_DAYS = 'streak_days',
  HEALTH_SCORE = 'health_score',
  PRODUCT_SCAN = 'product_scan',
}

export enum RewardType {
  POINTS = 'points',
  BADGE = 'badge',
  COUPON = 'coupon',
  TOKEN = 'token',
  LEVEL_UP = 'level_up',
}

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ type: 'enum', enum: AchievementType })
  type: AchievementType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  icon: string;

  @Column({ type: 'jsonb' })
  requirements: {
    target: number;
    current: number;
    unit: string;
  };

  @Column({ type: 'jsonb' })
  rewards: {
    type: RewardType;
    amount: number;
    description: string;
  }[];

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ default: 0 })
  progress: number; // 0-100

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系
  @ManyToOne(() => User, (user) => user.achievements)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

@Entity('user_points')
export class UserPoints {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ default: 0 })
  totalPoints: number;

  @Column({ default: 0 })
  availablePoints: number;

  @Column({ default: 0 })
  spentPoints: number;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  experience: number;

  @Column({ default: 100 })
  nextLevelExp: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系
  @ManyToOne(() => User, (user) => user.userPoints)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

@Entity('point_transactions')
export class PointTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column()
  type: string; // 'earn', 'spend', 'expire'

  @Column()
  amount: number;

  @Column()
  reason: string;

  @Column({ nullable: true })
  achievementId: string;

  @Column({ nullable: true })
  orderId: string;

  @Column({ type: 'timestamp' })
  transactionDate: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // 关系
  @ManyToOne(() => User, (user) => user.pointTransactions)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

@Entity('daily_challenges')
export class DailyChallenge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ type: 'date' })
  challengeDate: Date;

  @Column({ type: 'jsonb' })
  challenges: {
    id: string;
    title: string;
    description: string;
    target: number;
    current: number;
    unit: string;
    points: number;
    isCompleted: boolean;
  }[];

  @Column({ default: 0 })
  totalPoints: number;

  @Column({ default: 0 })
  completedChallenges: number;

  @Column({ default: false })
  isCompleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系
  @ManyToOne(() => User, (user) => user.dailyChallenges)
  @JoinColumn({ name: 'user_id' })
  user: User;
}


