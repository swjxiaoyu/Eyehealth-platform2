import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EyeHealthController } from './eye-health.controller';
import { EyeHealthService } from './eye-health.service';
import { EyeHealthProfile } from '../../entities/eye-health-profile.entity';
import { EyeHealthRecord } from '../../entities/eye-health-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EyeHealthProfile, EyeHealthRecord]),
  ],
  controllers: [EyeHealthController],
  providers: [EyeHealthService],
  exports: [EyeHealthService],
})
export class EyeHealthModule {}


