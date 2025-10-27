import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('游戏化系统')
@Controller('api/v1/gamification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('points')
  @ApiOperation({ summary: '获取用户积分信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserPoints(@Request() req: any): Promise<any> {
    return this.gamificationService.getUserPoints(req.user.id);
  }

  @Get('transactions')
  @ApiOperation({ summary: '获取积分交易记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'limit', required: false, description: '记录数量限制' })
  @ApiQuery({ name: 'offset', required: false, description: '偏移量' })
  async getPointTransactions(
    @Request() req: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ): Promise<any[]> {
    return this.gamificationService.getPointTransactions(req.user.id, limit, offset);
  }

  @Get('achievements')
  @ApiOperation({ summary: '获取用户成就' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAchievements(@Request() req: any): Promise<any[]> {
    return this.gamificationService.getAvailableAchievements(req.user.id);
  }

  @Get('challenge/today')
  @ApiOperation({ summary: '获取今日挑战' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getTodayChallenge(@Request() req: any): Promise<any> {
    return this.gamificationService.getTodayChallenge(req.user.id);
  }

  @Post('challenge/progress')
  @ApiOperation({ summary: '更新挑战进度' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateChallengeProgress(
    @Request() req: any,
    @Body() data: { challengeId: string; progress: number }
  ): Promise<void> {
    return this.gamificationService.updateChallengeProgress(req.user.id, data.challengeId, data.progress);
  }

  @Post('points/spend')
  @ApiOperation({ summary: '消费积分' })
  @ApiResponse({ status: 200, description: '消费成功' })
  async spendPoints(
    @Request() req: any,
    @Body() data: { amount: number; reason: string; orderId?: string }
  ): Promise<{ success: boolean; message: string }> {
    const success = await this.gamificationService.spendPoints(req.user.id, data.amount, data.reason, data.orderId);
    return {
      success,
      message: success ? '积分消费成功' : '积分不足',
    };
  }

  @Get('leaderboard')
  @ApiOperation({ summary: '获取排行榜' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'limit', required: false, description: '排行榜数量限制' })
  async getLeaderboard(@Query('limit') limit?: number): Promise<any[]> {
    return this.gamificationService.getLeaderboard(limit);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取用户游戏化统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserStats(@Request() req: any): Promise<any> {
    return this.gamificationService.getUserStats(req.user.id);
  }

  // 管理员接口
  @Post('admin/award-points')
  @ApiOperation({ summary: '管理员奖励积分' })
  @ApiResponse({ status: 200, description: '奖励成功' })
  async awardPoints(
    @Body() data: { userId: string; amount: number; reason: string }
  ): Promise<void> {
    return this.gamificationService.awardPoints(data.userId, data.amount, data.reason);
  }
}
