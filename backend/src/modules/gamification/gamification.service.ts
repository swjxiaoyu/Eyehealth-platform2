import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement, AchievementType, RewardType, UserPoints, PointTransaction, DailyChallenge } from '../../entities/gamification.entity';
import { EyeHealthRecord, ActivityType } from '../../entities/eye-health-record.entity';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(UserPoints)
    private userPointsRepository: Repository<UserPoints>,
    @InjectRepository(PointTransaction)
    private pointTransactionRepository: Repository<PointTransaction>,
    @InjectRepository(DailyChallenge)
    private dailyChallengeRepository: Repository<DailyChallenge>,
  ) {}

  // 初始化用户积分系统
  async initializeUserPoints(userId: string): Promise<UserPoints> {
    let userPoints = await this.userPointsRepository.findOne({ where: { userId } });
    
    if (!userPoints) {
      userPoints = this.userPointsRepository.create({
        userId,
        totalPoints: 0,
        availablePoints: 0,
        spentPoints: 0,
        level: 1,
        experience: 0,
        nextLevelExp: 100,
      });
      userPoints = await this.userPointsRepository.save(userPoints);
    }

    return userPoints;
  }

  // 创建每日挑战
  async createDailyChallenge(userId: string, date: Date): Promise<DailyChallenge> {
    const challenges = [
      {
        id: 'screen_time_limit',
        title: '控制屏幕时间',
        description: '今日屏幕使用时间不超过6小时',
        target: 360, // 6小时 = 360分钟
        current: 0,
        unit: '分钟',
        points: 50,
        isCompleted: false,
      },
      {
        id: 'break_reminder',
        title: '定时休息',
        description: '每20分钟休息一次，完成5次',
        target: 5,
        current: 0,
        unit: '次',
        points: 30,
        isCompleted: false,
      },
      {
        id: 'eye_exercise',
        title: '护眼操',
        description: '完成护眼操练习',
        target: 1,
        current: 0,
        unit: '次',
        points: 40,
        isCompleted: false,
      },
      {
        id: 'health_record',
        title: '记录健康数据',
        description: '记录至少3次健康数据',
        target: 3,
        current: 0,
        unit: '次',
        points: 20,
        isCompleted: false,
      },
    ];

    const challenge = this.dailyChallengeRepository.create({
      userId,
      challengeDate: date,
      challenges,
      totalPoints: challenges.reduce((sum, c) => sum + c.points, 0),
      completedChallenges: 0,
      isCompleted: false,
    });

    return this.dailyChallengeRepository.save(challenge);
  }

  // 获取今日挑战
  async getTodayChallenge(userId: string): Promise<DailyChallenge | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let challenge = await this.dailyChallengeRepository.findOne({
      where: { userId, challengeDate: today },
    });

    if (!challenge) {
      challenge = await this.createDailyChallenge(userId, today);
    }

    return challenge;
  }

  // 更新挑战进度
  async updateChallengeProgress(userId: string, challengeId: string, progress: number): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const challenge = await this.dailyChallengeRepository.findOne({
      where: { userId, challengeDate: today },
    });

    if (!challenge) return;

    const challengeIndex = challenge.challenges.findIndex(c => c.id === challengeId);
    if (challengeIndex === -1) return;

    challenge.challenges[challengeIndex].current = Math.min(
      challenge.challenges[challengeIndex].current + progress,
      challenge.challenges[challengeIndex].target
    );

    // 检查是否完成
    if (challenge.challenges[challengeIndex].current >= challenge.challenges[challengeIndex].target) {
      challenge.challenges[challengeIndex].isCompleted = true;
      
      // 奖励积分
      await this.awardPoints(userId, challenge.challenges[challengeIndex].points, 'daily_challenge', challengeId);
    }

    // 更新完成统计
    challenge.completedChallenges = challenge.challenges.filter(c => c.isCompleted).length;
    challenge.isCompleted = challenge.completedChallenges === challenge.challenges.length;

    await this.dailyChallengeRepository.save(challenge);
  }

  // 奖励积分
  async awardPoints(userId: string, amount: number, reason: string, achievementId?: string): Promise<void> {
    const userPoints = await this.initializeUserPoints(userId);
    
    userPoints.totalPoints += amount;
    userPoints.availablePoints += amount;
    userPoints.experience += amount;

    // 检查是否升级
    if (userPoints.experience >= userPoints.nextLevelExp) {
      userPoints.level += 1;
      userPoints.experience -= userPoints.nextLevelExp;
      userPoints.nextLevelExp = Math.floor(userPoints.nextLevelExp * 1.2); // 每级增加20%经验需求
    }

    await this.userPointsRepository.save(userPoints);

    // 记录交易
    const transaction = this.pointTransactionRepository.create({
      userId,
      type: 'earn',
      amount,
      reason,
      achievementId,
      transactionDate: new Date(),
    });

    await this.pointTransactionRepository.save(transaction);

    this.logger.log(`用户 ${userId} 获得 ${amount} 积分，原因: ${reason}`);
  }

  // 消费积分
  async spendPoints(userId: string, amount: number, reason: string, orderId?: string): Promise<boolean> {
    const userPoints = await this.userPointsRepository.findOne({ where: { userId } });
    
    if (!userPoints || userPoints.availablePoints < amount) {
      return false;
    }

    userPoints.availablePoints -= amount;
    userPoints.spentPoints += amount;

    await this.userPointsRepository.save(userPoints);

    // 记录交易
    const transaction = this.pointTransactionRepository.create({
      userId,
      type: 'spend',
      amount: -amount,
      reason,
      orderId,
      transactionDate: new Date(),
    });

    await this.pointTransactionRepository.save(transaction);

    this.logger.log(`用户 ${userId} 消费 ${amount} 积分，原因: ${reason}`);
    return true;
  }

  // 获取用户积分信息
  async getUserPoints(userId: string): Promise<UserPoints> {
    return this.initializeUserPoints(userId);
  }

  // 获取积分交易记录
  async getPointTransactions(userId: string, limit: number = 20, offset: number = 0): Promise<PointTransaction[]> {
    return this.pointTransactionRepository.find({
      where: { userId },
      order: { transactionDate: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  // 处理眼健康记录的游戏化
  async processHealthRecord(userId: string, record: EyeHealthRecord): Promise<void> {
    // 更新挑战进度
    if (record.activityType === ActivityType.SCREEN_TIME) {
      await this.updateChallengeProgress(userId, 'screen_time_limit', record.screenTime || 0);
    }

    if (record.activityType === ActivityType.BREAK_TIME) {
      await this.updateChallengeProgress(userId, 'break_reminder', 1);
    }

    if (record.activityType === ActivityType.EYE_EXERCISE) {
      await this.updateChallengeProgress(userId, 'eye_exercise', 1);
    }

    // 记录健康数据
    await this.updateChallengeProgress(userId, 'health_record', 1);

    // 检查成就
    await this.checkAchievements(userId, record);
  }

  // 检查成就
  async checkAchievements(userId: string, record: EyeHealthRecord): Promise<void> {
    const achievements = await this.getAvailableAchievements(userId);
    
    for (const achievement of achievements) {
      if (await this.checkAchievementProgress(userId, achievement, record)) {
        await this.completeAchievement(userId, achievement.id);
      }
    }
  }

  // 获取可用成就
  async getAvailableAchievements(userId: string): Promise<Achievement[]> {
    const achievements = await this.achievementRepository.find({
      where: { userId, isCompleted: false },
    });

    // 如果没有成就，创建默认成就
    if (achievements.length === 0) {
      await this.createDefaultAchievements(userId);
      return this.achievementRepository.find({
        where: { userId, isCompleted: false },
      });
    }

    return achievements;
  }

  // 创建默认成就
  async createDefaultAchievements(userId: string): Promise<void> {
    const defaultAchievements = [
      {
        type: AchievementType.DAILY_LOGIN,
        title: '每日签到',
        description: '连续登录7天',
        icon: 'calendar',
        requirements: { target: 7, current: 0, unit: '天' },
        rewards: [{ type: RewardType.POINTS, amount: 100, description: '获得100积分' }],
      },
      {
        type: AchievementType.HEALTH_RECORD,
        title: '健康记录达人',
        description: '累计记录100次健康数据',
        icon: 'activity',
        requirements: { target: 100, current: 0, unit: '次' },
        rewards: [{ type: RewardType.BADGE, amount: 1, description: '健康记录达人徽章' }],
      },
      {
        type: AchievementType.EXERCISE_COMPLETE,
        title: '护眼操专家',
        description: '完成50次护眼操',
        icon: 'eye',
        requirements: { target: 50, current: 0, unit: '次' },
        rewards: [{ type: RewardType.POINTS, amount: 200, description: '获得200积分' }],
      },
      {
        type: AchievementType.SCREEN_TIME_LIMIT,
        title: '屏幕时间控制者',
        description: '连续30天控制屏幕时间在6小时以内',
        icon: 'monitor',
        requirements: { target: 30, current: 0, unit: '天' },
        rewards: [{ type: RewardType.BADGE, amount: 1, description: '屏幕时间控制者徽章' }],
      },
      {
        type: AchievementType.HEALTH_SCORE,
        title: '健康评分大师',
        description: '健康评分达到90分以上',
        icon: 'heart',
        requirements: { target: 90, current: 0, unit: '分' },
        rewards: [{ type: RewardType.TOKEN, amount: 10, description: '获得10个EYE代币' }],
      },
    ];

    for (const achievementData of defaultAchievements) {
      const achievement = this.achievementRepository.create({
        userId,
        ...achievementData,
      });
      await this.achievementRepository.save(achievement);
    }
  }

  // 检查成就进度
  async checkAchievementProgress(userId: string, achievement: Achievement, record: EyeHealthRecord): Promise<boolean> {
    // 这里应该根据成就类型和记录数据来更新进度
    // 简化实现，实际应该更复杂
    return false;
  }

  // 完成成就
  async completeAchievement(userId: string, achievementId: string): Promise<void> {
    const achievement = await this.achievementRepository.findOne({
      where: { id: achievementId },
    });

    if (!achievement || achievement.isCompleted) return;

    achievement.isCompleted = true;
    achievement.completedAt = new Date();
    achievement.progress = 100;

    await this.achievementRepository.save(achievement);

    // 发放奖励
    for (const reward of achievement.rewards) {
      if (reward.type === RewardType.POINTS) {
        await this.awardPoints(userId, reward.amount, `achievement_${achievement.type}`, achievementId);
      }
    }

    this.logger.log(`用户 ${userId} 完成成就: ${achievement.title}`);
  }

  // 获取用户排行榜
  async getLeaderboard(limit: number = 10): Promise<any[]> {
    const results = await this.userPointsRepository
      .createQueryBuilder('up')
      .leftJoin('up.user', 'user')
      .select(['up.userId', 'up.totalPoints', 'up.level', 'user.name'])
      .orderBy('up.totalPoints', 'DESC')
      .limit(limit)
      .getRawMany();

    // 转换字段名以匹配前端期望
    return results.map(result => ({
      userId: result.up_userId,
      totalPoints: result.up_totalPoints,
      level: result.up_level,
      name: result.user_name
    }));
  }

  // 获取用户统计
  async getUserStats(userId: string): Promise<any> {
    const userPoints = await this.getUserPoints(userId);
    const achievements = await this.achievementRepository.find({
      where: { userId },
    });
    const completedAchievements = achievements.filter(a => a.isCompleted);
    const todayChallenge = await this.getTodayChallenge(userId);

    return {
      points: userPoints,
      achievements: {
        total: achievements.length,
        completed: completedAchievements.length,
        progress: achievements.length > 0 ? (completedAchievements.length / achievements.length) * 100 : 0,
      },
      todayChallenge: todayChallenge ? {
        completed: todayChallenge.completedChallenges,
        total: todayChallenge.challenges.length,
        progress: (todayChallenge.completedChallenges / todayChallenge.challenges.length) * 100,
      } : null,
    };
  }
}
