import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationPriority } from '../../entities/notification.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  // 创建通知
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    content: string,
    options: {
      priority?: NotificationPriority;
      actionUrl?: string;
      actionText?: string;
      metadata?: Record<string, any>;
      scheduledAt?: Date;
      expiresAt?: Date;
    } = {}
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      type,
      title,
      content,
      priority: options.priority || NotificationPriority.MEDIUM,
      actionUrl: options.actionUrl,
      actionText: options.actionText,
      metadata: options.metadata,
      scheduledAt: options.scheduledAt,
      expiresAt: options.expiresAt,
    });

    const savedNotification = await this.notificationRepository.save(notification);
    this.logger.log(`创建通知: ${title} for user ${userId}`);
    
    return savedNotification;
  }

  // 获取用户通知
  async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      includeArchived?: boolean;
    } = {}
  ): Promise<Notification[]> {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (options.unreadOnly) {
      query.andWhere('notification.isRead = false');
    }

    if (!options.includeArchived) {
      query.andWhere('notification.isArchived = false');
    }

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.offset) {
      query.offset(options.offset);
    }

    return query.getMany();
  }

  // 标记通知为已读
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId, userId },
      { isRead: true }
    );
    this.logger.log(`标记通知 ${notificationId} 为已读`);
  }

  // 标记所有通知为已读
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true }
    );
    this.logger.log(`标记用户 ${userId} 所有通知为已读`);
  }

  // 归档通知
  async archiveNotification(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId, userId },
      { isArchived: true }
    );
    this.logger.log(`归档通知 ${notificationId}`);
  }

  // 删除通知
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.delete({ id: notificationId, userId });
    this.logger.log(`删除通知 ${notificationId}`);
  }

  // 获取未读通知数量
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false, isArchived: false },
    });
  }

  // 健康提醒通知
  async createHealthReminder(userId: string, message: string): Promise<Notification> {
    return this.createNotification(
      userId,
      NotificationType.HEALTH_REMINDER,
      '健康提醒',
      message,
      {
        priority: NotificationPriority.MEDIUM,
        actionUrl: '/eye-health',
        actionText: '查看健康档案',
      }
    );
  }

  // 休息提醒通知
  async createBreakReminder(userId: string): Promise<Notification> {
    return this.createNotification(
      userId,
      NotificationType.BREAK_REMINDER,
      '休息提醒',
      '您已经连续使用屏幕20分钟了，建议休息一下，看看远处或做做护眼操。',
      {
        priority: NotificationPriority.HIGH,
        actionUrl: '/eye-health',
        actionText: '开始护眼操',
      }
    );
  }

  // 护眼操提醒通知
  async createExerciseReminder(userId: string): Promise<Notification> {
    return this.createNotification(
      userId,
      NotificationType.EXERCISE_REMINDER,
      '护眼操提醒',
      '今天还没有做护眼操，建议花5分钟时间放松眼部肌肉。',
      {
        priority: NotificationPriority.MEDIUM,
        actionUrl: '/eye-health',
        actionText: '开始护眼操',
      }
    );
  }

  // 成就解锁通知
  async createAchievementNotification(userId: string, achievementTitle: string, points: number): Promise<Notification> {
    return this.createNotification(
      userId,
      NotificationType.ACHIEVEMENT_UNLOCKED,
      '成就解锁',
      `恭喜！您解锁了成就"${achievementTitle}"，获得${points}积分奖励！`,
      {
        priority: NotificationPriority.HIGH,
        actionUrl: '/gamification',
        actionText: '查看成就',
        metadata: { achievementTitle, points },
      }
    );
  }

  // 积分获得通知
  async createPointsNotification(userId: string, points: number, reason: string): Promise<Notification> {
    return this.createNotification(
      userId,
      NotificationType.POINTS_EARNED,
      '积分获得',
      `您获得了${points}积分！原因：${reason}`,
      {
        priority: NotificationPriority.LOW,
        actionUrl: '/gamification',
        actionText: '查看积分',
        metadata: { points, reason },
      }
    );
  }

  // 挑战完成通知
  async createChallengeNotification(userId: string, challengeTitle: string, points: number): Promise<Notification> {
    return this.createNotification(
      userId,
      NotificationType.CHALLENGE_COMPLETED,
      '挑战完成',
      `恭喜完成挑战"${challengeTitle}"！获得${points}积分奖励！`,
      {
        priority: NotificationPriority.MEDIUM,
        actionUrl: '/gamification',
        actionText: '查看挑战',
        metadata: { challengeTitle, points },
      }
    );
  }

  // 产品推荐通知
  async createProductRecommendation(userId: string, productName: string, reason: string): Promise<Notification> {
    return this.createNotification(
      userId,
      NotificationType.PRODUCT_RECOMMENDATION,
      '产品推荐',
      `基于您的眼健康状况，我们为您推荐"${productName}"。${reason}`,
      {
        priority: NotificationPriority.LOW,
        actionUrl: '/products',
        actionText: '查看产品',
        metadata: { productName, reason },
      }
    );
  }

  // 系统更新通知
  async createSystemUpdateNotification(userId: string, updateTitle: string, updateContent: string): Promise<Notification> {
    return this.createNotification(
      userId,
      NotificationType.SYSTEM_UPDATE,
      '系统更新',
      `${updateTitle}: ${updateContent}`,
      {
        priority: NotificationPriority.MEDIUM,
        actionUrl: '/dashboard',
        actionText: '了解更多',
        metadata: { updateTitle, updateContent },
      }
    );
  }

  // 安全提醒通知
  async createSecurityAlert(userId: string, alertMessage: string): Promise<Notification> {
    return this.createNotification(
      userId,
      NotificationType.SECURITY_ALERT,
      '安全提醒',
      alertMessage,
      {
        priority: NotificationPriority.URGENT,
        actionUrl: '/settings',
        actionText: '检查设置',
      }
    );
  }

  // 批量发送通知
  async sendBulkNotification(
    userIds: string[],
    type: NotificationType,
    title: string,
    content: string,
    options: {
      priority?: NotificationPriority;
      actionUrl?: string;
      actionText?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<Notification[]> {
    const notifications: Notification[] = [];

    for (const userId of userIds) {
      const notification = await this.createNotification(
        userId,
        type,
        title,
        content,
        options
      );
      notifications.push(notification);
    }

    this.logger.log(`批量发送通知给 ${userIds.length} 个用户: ${title}`);
    return notifications;
  }

  // 清理过期通知
  async cleanupExpiredNotifications(): Promise<number> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();

    this.logger.log(`清理了 ${result.affected} 个过期通知`);
    return result.affected || 0;
  }

  // 获取通知统计
  async getNotificationStats(userId: string): Promise<any> {
    const total = await this.notificationRepository.count({ where: { userId } });
    const unread = await this.notificationRepository.count({ 
      where: { userId, isRead: false, isArchived: false } 
    });
    const archived = await this.notificationRepository.count({ 
      where: { userId, isArchived: true } 
    });

    return {
      total,
      unread,
      archived,
      read: total - unread - archived,
    };
  }
}


