import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EyeHealthService } from './eye-health.service';
import { EyeHealthProfile } from '../../entities/eye-health-profile.entity';
import { EyeHealthRecord, ActivityType } from '../../entities/eye-health-record.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('眼健康管理')
@Controller('api/v1/eye-health')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EyeHealthController {
  constructor(private readonly eyeHealthService: EyeHealthService) {}

  @Post('profile')
  @ApiOperation({ summary: '创建或更新眼健康档案' })
  @ApiResponse({ status: 201, description: '档案创建/更新成功' })
  async createOrUpdateProfile(
    @Request() req: any,
    @Body() profileData: Partial<EyeHealthProfile>
  ): Promise<EyeHealthProfile> {
    return this.eyeHealthService.createOrUpdateProfile(req.user.id, profileData);
  }

  @Get('profile')
  @ApiOperation({ summary: '获取眼健康档案' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProfile(@Request() req: any): Promise<EyeHealthProfile> {
    return this.eyeHealthService.getProfile(req.user.id);
  }

  @Post('record')
  @ApiOperation({ summary: '记录眼健康数据' })
  @ApiResponse({ status: 201, description: '记录创建成功' })
  async recordHealthData(
    @Request() req: any,
    @Body() recordData: Partial<EyeHealthRecord>
  ): Promise<EyeHealthRecord> {
    return this.eyeHealthService.recordHealthData(req.user.id, recordData);
  }

  @Get('records')
  @ApiOperation({ summary: '获取眼健康记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'limit', required: false, description: '记录数量限制' })
  @ApiQuery({ name: 'offset', required: false, description: '偏移量' })
  async getHealthRecords(
    @Request() req: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ): Promise<EyeHealthRecord[]> {
    return this.eyeHealthService.getHealthRecords(req.user.id, limit, offset);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取眼健康统计数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'days', required: false, description: '统计天数' })
  async getHealthStatistics(
    @Request() req: any,
    @Query('days') days?: number
  ): Promise<any> {
    return this.eyeHealthService.getHealthStatistics(req.user.id, days);
  }

  @Get('recommendations')
  @ApiOperation({ summary: '获取健康建议' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getHealthRecommendations(@Request() req: any): Promise<any[]> {
    return this.eyeHealthService.getHealthRecommendations(req.user.id);
  }

  // 快速记录接口
  @Post('quick-record')
  @ApiOperation({ summary: '快速记录眼健康数据' })
  @ApiResponse({ status: 201, description: '记录创建成功' })
  async quickRecord(
    @Request() req: any,
    @Body() data: {
      screenTime?: number;
      breakTime?: number;
      symptoms?: any[];
      notes?: string;
    }
  ): Promise<EyeHealthRecord> {
    const recordData: Partial<EyeHealthRecord> = {
      activityType: ActivityType.SCREEN_TIME,
      screenTime: data.screenTime,
      breakTime: data.breakTime,
      symptoms: data.symptoms,
      notes: data.notes,
    };

    return this.eyeHealthService.recordHealthData(req.user.id, recordData);
  }

  // 护眼操记录接口
  @Post('exercise-record')
  @ApiOperation({ summary: '记录护眼操' })
  @ApiResponse({ status: 201, description: '记录创建成功' })
  async recordExercise(
    @Request() req: any,
    @Body() data: {
      exerciseType: string;
      duration: number;
      notes?: string;
    }
  ): Promise<EyeHealthRecord> {
    const recordData: Partial<EyeHealthRecord> = {
      activityType: ActivityType.EYE_EXERCISE,
      exerciseType: data.exerciseType,
      exerciseDuration: data.duration,
      notes: data.notes,
    };

    return this.eyeHealthService.recordHealthData(req.user.id, recordData);
  }

  // 症状记录接口
  @Post('symptom-record')
  @ApiOperation({ summary: '记录症状' })
  @ApiResponse({ status: 201, description: '记录创建成功' })
  async recordSymptom(
    @Request() req: any,
    @Body() data: {
      symptoms: any[];
      notes?: string;
    }
  ): Promise<EyeHealthRecord> {
    const recordData: Partial<EyeHealthRecord> = {
      activityType: ActivityType.SYMPTOM_RECORD,
      symptoms: data.symptoms,
      notes: data.notes,
    };

    return this.eyeHealthService.recordHealthData(req.user.id, recordData);
  }
}
