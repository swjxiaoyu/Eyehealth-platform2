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

export enum ActivityType {
  SCREEN_TIME = 'screen_time',
  BREAK_TIME = 'break_time',
  EYE_EXERCISE = 'eye_exercise',
  BLINK_COUNT = 'blink_count',
  DISTANCE_CHECK = 'distance_check',
  LIGHTING_CHECK = 'lighting_check',
  SYMPTOM_RECORD = 'symptom_record',
  MEDICATION = 'medication',
  SLEEP = 'sleep',
}

export enum SymptomType {
  DRYNESS = 'dryness',
  FATIGUE = 'fatigue',
  BLUR = 'blur',
  HEADACHE = 'headache',
  SENSITIVITY = 'sensitivity',
  TEARING = 'tearing',
  ITCHING = 'itching',
  BURNING = 'burning',
  PRESSURE = 'pressure',
}

@Entity('eye_health_records')
export class EyeHealthRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ type: 'enum', enum: ActivityType })
  activityType: ActivityType;

  @Column({ type: 'timestamp' })
  recordedAt: Date;

  // 屏幕使用数据
  @Column({ nullable: true })
  screenTime: number; // 屏幕使用时间（分钟）

  @Column({ nullable: true })
  breakTime: number; // 休息时间（分钟）

  @Column({ nullable: true })
  blinkCount: number; // 眨眼次数

  @Column({ nullable: true })
  blinkRate: number; // 眨眼频率（次/分钟）

  // 环境数据
  @Column({ nullable: true })
  workDistance: number; // 工作距离（厘米）

  @Column({ nullable: true })
  screenBrightness: number; // 屏幕亮度（百分比）

  @Column({ nullable: true })
  ambientLight: number; // 环境光强度（lux）

  @Column({ nullable: true })
  roomHumidity: number; // 室内湿度（百分比）

  @Column({ nullable: true })
  roomTemperature: number; // 室内温度（摄氏度）

  // 症状记录
  @Column({ type: 'jsonb', nullable: true })
  symptoms: {
    type: SymptomType;
    severity: number; // 严重程度 1-10
    duration: number; // 持续时间（分钟）
    triggers: string[]; // 触发因素
  }[];

  // 护眼活动
  @Column({ nullable: true })
  exerciseType: string; // 护眼操类型

  @Column({ nullable: true })
  exerciseDuration: number; // 护眼操时长（分钟）

  @Column({ nullable: true })
  medicationType: string; // 药物类型

  @Column({ nullable: true })
  medicationDose: string; // 药物剂量

  // 睡眠数据
  @Column({ nullable: true })
  sleepDuration: number; // 睡眠时长（小时）

  @Column({ nullable: true })
  sleepQuality: number; // 睡眠质量 1-10

  // 位置信息
  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  coordinates: string;

  // 设备信息
  @Column({ nullable: true })
  deviceType: string; // 设备类型

  @Column({ nullable: true })
  deviceModel: string; // 设备型号

  @Column({ nullable: true })
  appVersion: string; // 应用版本

  // 健康评分
  @Column({ nullable: true })
  healthScore: number; // 健康评分 0-100

  @Column({ nullable: true })
  riskScore: number; // 风险评分 0-100

  // 备注
  @Column({ type: 'text', nullable: true })
  notes: string;

  // 元数据
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系
  @ManyToOne(() => User, (user) => user.eyeHealthRecords)
  @JoinColumn({ name: 'user_id' })
  user: User;
}


