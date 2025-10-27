import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { Report } from '../../entities/report.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('报告管理')
@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @ApiOperation({ summary: '创建报告' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createReport(@Body() reportData: Partial<Report>): Promise<Report> {
    return this.reportService.create(reportData);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取报告详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getReport(@Param('id') id: string): Promise<Report | null> {
    return this.reportService.findById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户报告列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserReports(@Param('userId') userId: string): Promise<Report[]> {
    return this.reportService.findByUserId(userId);
  }
}
