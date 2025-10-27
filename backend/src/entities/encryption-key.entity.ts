import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('encryption_keys')
export class EncryptionKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ unique: true })
  keyHash: string; // SHA256哈希，用于验证

  @Column('text')
  encryptedKey: string; // 加密后的密钥

  @Column()
  fileName: string; // 原始文件名

  @Column()
  mimeType: string; // 文件类型

  @Column({ default: true })
  isActive: boolean; // 是否激活

  @Column({ type: 'json', nullable: true })
  metadata: any; // 额外元数据

  @ManyToOne(() => User, user => user.encryptionKeys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}




