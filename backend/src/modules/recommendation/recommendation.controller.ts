import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';
import { Recommendation } from '../../entities/recommendation.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('推荐管理')
@Controller('api/v1/recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get()
  @ApiOperation({ summary: '获取推荐列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRecommendations(): Promise<Recommendation[]> {
    return this.recommendationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取推荐详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRecommendation(@Param('id') id: string): Promise<Recommendation | null> {
    return this.recommendationService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建推荐' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createRecommendation(@Body() recommendationData: Partial<Recommendation>): Promise<Recommendation> {
    return this.recommendationService.create(recommendationData);
  }
}
