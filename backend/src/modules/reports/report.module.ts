import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { Report } from '../../entities/report.entity';
import { MinioService } from '../storage/minio.service';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    EncryptionModule,
  ],
  controllers: [ReportController],
  providers: [ReportService, MinioService],
  exports: [ReportService],
})
export class ReportModule {}

