import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('ipfs_files')
export class IPFSFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  cid: string;

  @Column()
  filename: string;

  @Column()
  size: number;

  @Column({ nullable: true })
  mimeType: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ nullable: true })
  originalPath: string;

  @Column({ nullable: true })
  hash: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
