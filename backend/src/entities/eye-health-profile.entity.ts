import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum EyeCondition {
  NORMAL = 'normal',
  MYOPIA = 'myopia',
  HYPEROPIA = 'hyperopia',
  ASTIGMATISM = 'astigmatism',
  PRESBYOPIA = 'presbyopia',
  DRY_EYE = 'dry_eye',
  EYE_FATIGUE = 'eye_fatigue',
}

export enum WorkEnvironment {
  OFFICE = 'office',
  HOME = 'home',
  OUTDOOR = 'outdoor',
  LABORATORY = 'laboratory',
  STUDIO = 'studio',
}

@Entity('eye_health_profiles')
export class EyeHealthProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  // 基本信息
  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  occupation: string;

  @Column({ type: 'enum', enum: WorkEnvironment, nullable: true })
  workEnvironment: WorkEnvironment;

  @Column({ nullable: true })
  dailyScreenTime: number; // 每日屏幕使用时间（小时）

  @Column({ nullable: true })
  workDistance: number; // 工作距离（厘米）

  // 眼健康状况
  @Column({ type: 'enum', enum: EyeCondition, array: true, default: [] })
  eyeConditions: EyeCondition[];

  @Column({ nullable: true })
  leftEyeVision: number; // 左眼视力

  @Column({ nullable: true })
  rightEyeVision: number; // 右眼视力

  @Column({ nullable: true })
  leftEyeDegree: number; // 左眼度数

  @Column({ nullable: true })
  rightEyeDegree: number; // 右眼度数

  @Column({ nullable: true })
  astigmatismDegree: number; // 散光度数

  @Column({ nullable: true })
  pupilDistance: number; // 瞳距（毫米）

  // 生活习惯
  @Column({ default: false })
  wearsGlasses: boolean;

  @Column({ default: false })
  wearsContactLens: boolean;

  @Column({ nullable: true })
  glassesType: string; // 眼镜类型

  @Column({ nullable: true })
  contactLensType: string; // 隐形眼镜类型

  @Column({ default: false })
  usesEyeDrops: boolean;

  @Column({ nullable: true })
  eyeDropsFrequency: string; // 眼药水使用频率

  @Column({ default: false })
  doesEyeExercises: boolean;

  @Column({ nullable: true })
  eyeExerciseFrequency: string; // 护眼操频率

  // 症状评估
  @Column({ type: 'jsonb', nullable: true })
  symptoms: {
    dryness: number; // 干涩程度 1-10
    fatigue: number; // 疲劳程度 1-10
    blur: number; // 模糊程度 1-10
    headache: number; // 头痛程度 1-10
    sensitivity: number; // 光敏感程度 1-10
    tearing: number; // 流泪程度 1-10
  };

  // 环境因素
  @Column({ nullable: true })
  lightingCondition: string; // 照明条件

  @Column({ nullable: true })
  airHumidity: number; // 空气湿度

  @Column({ nullable: true })
  airQuality: string; // 空气质量

  // 健康评分
  @Column({ default: 0 })
  overallScore: number; // 总体健康评分 0-100

  @Column({ default: 0 })
  riskLevel: number; // 风险等级 1-5

  // 最后更新
  @Column({ nullable: true })
  lastEyeExam: Date; // 最后眼科检查时间

  @Column({ nullable: true })
  nextExamDue: Date; // 下次检查建议时间

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系
  @OneToOne(() => User, (user) => user.eyeHealthProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

