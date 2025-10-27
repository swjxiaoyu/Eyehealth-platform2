import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { Achievement, UserPoints, PointTransaction, DailyChallenge } from '../../entities/gamification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Achievement, UserPoints, PointTransaction, DailyChallenge]),
  ],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}


