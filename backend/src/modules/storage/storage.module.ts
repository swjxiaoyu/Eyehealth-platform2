import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { MinioService } from './minio.service';
import { IPFSController } from './ipfs.controller';
import { PublicIPFSController } from './public-ipfs.controller';
import { IPFSService } from './ipfs-enhanced.service';
import { IPFSFile } from '../../entities/ipfs-file.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IPFSFile, User])],
  controllers: [StorageController, IPFSController, PublicIPFSController],
  providers: [StorageService, MinioService, IPFSService],
  exports: [StorageService, MinioService, IPFSService],
})
export class StorageModule {}

