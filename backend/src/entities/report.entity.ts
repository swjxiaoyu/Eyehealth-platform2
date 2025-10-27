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

export enum ReportType {
  EXAMINATION = 'examination',
  PRESCRIPTION = 'prescription',
  MEDICAL_RECORD = 'medical_record',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({
    type: 'varchar',
    default: 'examination',
  })
  type: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ name: 'storage_uri' })
  storageUri: string;

  @Column({ nullable: true, name: 'report_hash' })
  reportHash: string;

  @Column({ nullable: true, name: 'ipfs_cid' })
  ipfsCid: string;

  @Column({ nullable: true, name: 'chain_hash' })
  chainHash: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, name: 'extracted_data' })
  extractedData: Record<string, any>;

  @Column({ default: false, name: 'is_encrypted' })
  isEncrypted: boolean;

  @Column({ nullable: true, name: 'encryption_key' })
  encryptionKey: string;

  @Column({ default: false, name: 'is_processed' })
  isProcessed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系
  @ManyToOne(() => User, (user) => user.reports)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
