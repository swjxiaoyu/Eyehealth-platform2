import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { NotificationType, NotificationPriority } from '../../entities/notification.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('通知管理')
@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: '获取用户通知' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'limit', required: false, description: '记录数量限制' })
  @ApiQuery({ name: 'offset', required: false, description: '偏移量' })
  @ApiQuery({ name: 'unreadOnly', required: false, description: '仅未读通知' })
  @ApiQuery({ name: 'includeArchived', required: false, description: '包含已归档通知' })
  async getNotifications(
    @Request() req: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('unreadOnly') unreadOnly?: boolean,
    @Query('includeArchived') includeArchived?: boolean
  ): Promise<any[]> {
    return this.notificationService.getUserNotifications(req.user.id, {
      limit,
      offset,
      unreadOnly: unreadOnly === true,
      includeArchived: includeArchived === true,
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读通知数量' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUnreadCount(@Request() req: any): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadCount(req.user.id);
    return { count };
  }

  @Get('stats')
  @ApiOperation({ summary: '获取通知统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getNotificationStats(@Request() req: any): Promise<any> {
    return this.notificationService.getNotificationStats(req.user.id);
  }

  @Put(':id/read')
  @ApiOperation({ summary: '标记通知为已读' })
  @ApiResponse({ status: 200, description: '标记成功' })
  async markAsRead(@Request() req: any, @Param('id') id: string): Promise<void> {
    return this.notificationService.markAsRead(id, req.user.id);
  }

  @Put('read-all')
  @ApiOperation({ summary: '标记所有通知为已读' })
  @ApiResponse({ status: 200, description: '标记成功' })
  async markAllAsRead(@Request() req: any): Promise<void> {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  @Put(':id/archive')
  @ApiOperation({ summary: '归档通知' })
  @ApiResponse({ status: 200, description: '归档成功' })
  async archiveNotification(@Request() req: any, @Param('id') id: string): Promise<void> {
    return this.notificationService.archiveNotification(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除通知' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteNotification(@Request() req: any, @Param('id') id: string): Promise<void> {
    return this.notificationService.deleteNotification(id, req.user.id);
  }

  // 管理员接口
  @Post('admin/send')
  @ApiOperation({ summary: '管理员发送通知' })
  @ApiResponse({ status: 201, description: '发送成功' })
  async sendNotification(
    @Body() data: {
      userIds: string[];
      type: NotificationType;
      title: string;
      content: string;
      priority?: NotificationPriority;
      actionUrl?: string;
      actionText?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<any[]> {
    return this.notificationService.sendBulkNotification(
      data.userIds,
      data.type,
      data.title,
      data.content,
      {
        priority: data.priority,
        actionUrl: data.actionUrl,
        actionText: data.actionText,
        metadata: data.metadata,
      }
    );
  }

  @Post('admin/cleanup')
  @ApiOperation({ summary: '清理过期通知' })
  @ApiResponse({ status: 200, description: '清理成功' })
  async cleanupExpiredNotifications(): Promise<{ cleaned: number }> {
    const cleaned = await this.notificationService.cleanupExpiredNotifications();
    return { cleaned };
  }
}
