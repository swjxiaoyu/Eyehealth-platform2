import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EyeHealthProfile, EyeCondition, WorkEnvironment } from '../../entities/eye-health-profile.entity';
import { EyeHealthRecord, ActivityType, SymptomType } from '../../entities/eye-health-record.entity';

@Injectable()
export class EyeHealthService {
  constructor(
    @InjectRepository(EyeHealthProfile)
    private profileRepository: Repository<EyeHealthProfile>,
    @InjectRepository(EyeHealthRecord)
    private recordRepository: Repository<EyeHealthRecord>,
  ) {}

  // 创建或更新眼健康档案
  async createOrUpdateProfile(userId: string, profileData: Partial<EyeHealthProfile>): Promise<EyeHealthProfile> {
    let profile = await this.profileRepository.findOne({ where: { userId } });
    
    if (!profile) {
      profile = this.profileRepository.create({ userId, ...profileData });
    } else {
      Object.assign(profile, profileData);
    }

    // 计算健康评分
    profile.overallScore = this.calculateHealthScore(profile);
    profile.riskLevel = this.calculateRiskLevel(profile);

    return this.profileRepository.save(profile);
  }

  // 获取用户眼健康档案
  async getProfile(userId: string): Promise<EyeHealthProfile> {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('眼健康档案不存在');
    }
    return profile;
  }

  // 记录眼健康数据
  async recordHealthData(userId: string, recordData: Partial<EyeHealthRecord>): Promise<EyeHealthRecord> {
    const record = this.recordRepository.create({
      userId,
      recordedAt: new Date(),
      ...recordData,
    });

    // 计算健康评分
    record.healthScore = this.calculateRecordHealthScore(record);
    record.riskScore = this.calculateRecordRiskScore(record);

    return this.recordRepository.save(record);
  }

  // 获取用户眼健康记录
  async getHealthRecords(userId: string, limit: number = 50, offset: number = 0): Promise<EyeHealthRecord[]> {
    return this.recordRepository.find({
      where: { userId },
      order: { recordedAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  // 获取统计数据
  async getHealthStatistics(userId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await this.recordRepository.find({
      where: { userId },
      order: { recordedAt: 'DESC' },
    });

    const filteredRecords = records.filter(record => record.recordedAt >= startDate);

    return {
      totalRecords: filteredRecords.length,
      averageHealthScore: this.calculateAverageScore(filteredRecords, 'healthScore'),
      averageRiskScore: this.calculateAverageScore(filteredRecords, 'riskScore'),
      screenTimeStats: this.calculateScreenTimeStats(filteredRecords),
      symptomStats: this.calculateSymptomStats(filteredRecords),
      exerciseStats: this.calculateExerciseStats(filteredRecords),
      trends: this.calculateTrends(filteredRecords),
    };
  }

  // 获取健康建议
  async getHealthRecommendations(userId: string): Promise<any[]> {
    const profile = await this.getProfile(userId);
    const recentRecords = await this.getHealthRecords(userId, 7);
    
    const recommendations: any[] = [];

    // 基于档案的建议
    if (profile.dailyScreenTime > 8) {
      recommendations.push({
        type: 'screen_time',
        priority: 'high',
        title: '减少屏幕使用时间',
        description: '您每日屏幕使用时间过长，建议每20分钟休息一次',
        action: '设置定时提醒，进行20-20-20护眼法则',
      });
    }

    if (profile.workDistance < 50) {
      recommendations.push({
        type: 'distance',
        priority: 'medium',
        title: '调整工作距离',
        description: '工作距离过近，建议保持50-70厘米距离',
        action: '调整座椅或屏幕位置',
      });
    }

    // 基于症状的建议
    const recentSymptoms = recentRecords
      .filter(record => record.symptoms && record.symptoms.length > 0)
      .flatMap(record => record.symptoms);

    if (recentSymptoms.some(s => s.type === SymptomType.DRYNESS && s.severity > 5)) {
      recommendations.push({
        type: 'symptom',
        priority: 'high',
        title: '缓解眼部干涩',
        description: '检测到眼部干涩症状，建议使用人工泪液',
        action: '使用无防腐剂的人工泪液，增加眨眼频率',
      });
    }

    if (recentSymptoms.some(s => s.type === SymptomType.FATIGUE && s.severity > 6)) {
      recommendations.push({
        type: 'fatigue',
        priority: 'high',
        title: '缓解眼部疲劳',
        description: '眼部疲劳严重，建议进行护眼操',
        action: '进行眼部按摩和热敷，保证充足睡眠',
      });
    }

    return recommendations;
  }

  // 计算健康评分
  private calculateHealthScore(profile: EyeHealthProfile): number {
    let score = 100;

    // 屏幕时间评分
    if (profile.dailyScreenTime > 8) score -= 20;
    else if (profile.dailyScreenTime > 6) score -= 10;

    // 工作距离评分
    if (profile.workDistance < 50) score -= 15;
    else if (profile.workDistance < 60) score -= 5;

    // 眼健康状况评分
    if (profile.eyeConditions.includes(EyeCondition.DRY_EYE)) score -= 10;
    if (profile.eyeConditions.includes(EyeCondition.EYE_FATIGUE)) score -= 15;

    // 生活习惯评分
    if (!profile.doesEyeExercises) score -= 10;
    if (!profile.usesEyeDrops && profile.eyeConditions.includes(EyeCondition.DRY_EYE)) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  // 计算风险等级
  private calculateRiskLevel(profile: EyeHealthProfile): number {
    let risk = 1;

    if (profile.dailyScreenTime > 8) risk += 1;
    if (profile.workDistance < 50) risk += 1;
    if (profile.eyeConditions.length > 2) risk += 1;
    if (!profile.doesEyeExercises) risk += 1;

    return Math.min(5, risk);
  }

  // 计算记录健康评分
  private calculateRecordHealthScore(record: EyeHealthRecord): number {
    let score = 100;

    // 屏幕时间评分
    if (record.screenTime > 480) score -= 20; // 8小时
    else if (record.screenTime > 360) score -= 10; // 6小时

    // 休息时间评分
    if (record.breakTime < 60) score -= 15; // 少于1小时休息
    else if (record.breakTime < 120) score -= 5; // 少于2小时休息

    // 眨眼频率评分
    if (record.blinkRate < 15) score -= 10; // 正常眨眼频率15-20次/分钟

    // 症状评分
    if (record.symptoms && record.symptoms.length > 0) {
      const avgSeverity = record.symptoms.reduce((sum, s) => sum + s.severity, 0) / record.symptoms.length;
      score -= avgSeverity * 2;
    }

    return Math.max(0, Math.min(100, score));
  }

  // 计算记录风险评分
  private calculateRecordRiskScore(record: EyeHealthRecord): number {
    let risk = 0;

    if (record.screenTime > 480) risk += 20;
    if (record.breakTime < 60) risk += 15;
    if (record.blinkRate < 15) risk += 10;
    if (record.symptoms && record.symptoms.length > 0) {
      const avgSeverity = record.symptoms.reduce((sum, s) => sum + s.severity, 0) / record.symptoms.length;
      risk += avgSeverity * 3;
    }

    return Math.min(100, risk);
  }

  // 计算平均评分
  private calculateAverageScore(records: EyeHealthRecord[], field: string): number {
    if (records.length === 0) return 0;
    const sum = records.reduce((acc, record) => acc + (record[field] || 0), 0);
    return Math.round(sum / records.length);
  }

  // 计算屏幕时间统计
  private calculateScreenTimeStats(records: EyeHealthRecord[]): any {
    const screenTimeRecords = records.filter(r => r.screenTime > 0);
    if (screenTimeRecords.length === 0) return { average: 0, total: 0, max: 0 };

    const total = screenTimeRecords.reduce((sum, r) => sum + r.screenTime, 0);
    const average = total / screenTimeRecords.length;
    const max = Math.max(...screenTimeRecords.map(r => r.screenTime));

    return { average: Math.round(average), total, max };
  }

  // 计算症状统计
  private calculateSymptomStats(records: EyeHealthRecord[]): any {
    const symptomCounts = {};
    records.forEach(record => {
      if (record.symptoms) {
        record.symptoms.forEach(symptom => {
          symptomCounts[symptom.type] = (symptomCounts[symptom.type] || 0) + 1;
        });
      }
    });

    return symptomCounts;
  }

  // 计算护眼操统计
  private calculateExerciseStats(records: EyeHealthRecord[]): any {
    const exerciseRecords = records.filter(r => r.exerciseDuration > 0);
    if (exerciseRecords.length === 0) return { count: 0, totalDuration: 0, averageDuration: 0 };

    const totalDuration = exerciseRecords.reduce((sum, r) => sum + r.exerciseDuration, 0);
    const averageDuration = totalDuration / exerciseRecords.length;

    return {
      count: exerciseRecords.length,
      totalDuration,
      averageDuration: Math.round(averageDuration),
    };
  }

  // 计算趋势
  private calculateTrends(records: EyeHealthRecord[]): any {
    if (records.length < 2) return { healthScore: 'stable', riskScore: 'stable' };

    const recent = records.slice(0, Math.floor(records.length / 2));
    const older = records.slice(Math.floor(records.length / 2));

    const recentAvgHealth = this.calculateAverageScore(recent, 'healthScore');
    const olderAvgHealth = this.calculateAverageScore(older, 'healthScore');
    const recentAvgRisk = this.calculateAverageScore(recent, 'riskScore');
    const olderAvgRisk = this.calculateAverageScore(older, 'riskScore');

    return {
      healthScore: recentAvgHealth > olderAvgHealth ? 'improving' : 
                  recentAvgHealth < olderAvgHealth ? 'declining' : 'stable',
      riskScore: recentAvgRisk > olderAvgRisk ? 'increasing' : 
                recentAvgRisk < olderAvgRisk ? 'decreasing' : 'stable',
    };
  }
}
