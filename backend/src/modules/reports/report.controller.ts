import { Controller, Post, Get, Param, Body, UseInterceptors, UploadedFile, UseGuards, Request, HttpCode, HttpStatus, Query, Delete, Res, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { multerConfig } from '../../config/multer.config';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('报告管理')
@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  @ApiOperation({ summary: '获取用户报告列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'type', required: false, description: '报告类型' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getReports(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
  ) {
    return this.reportService.findByUserId(req.user.id, { page, limit, type });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取报告详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '报告不存在' })
  async getReport(@Param('id') id: string, @Request() req: any) {
    return this.reportService.findById(id, req.user.id);
  }

  @Get(':id/download-decrypted')
  @ApiOperation({ summary: '下载解密后的报告文件' })
  @ApiResponse({ status: 200, description: '文件下载成功' })
  @ApiResponse({ status: 404, description: '报告不存在' })
  async downloadDecryptedReport(
    @Param('id') id: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    try {
      console.log(`开始解密下载报告: ${id}, 用户: ${req.user.id}`);
      const result = await this.reportService.downloadDecryptedReport(id, req.user.id);
      
      console.log(`解密成功，文件大小: ${result.decryptedData.length} bytes`);
      
      res.set({
        'Content-Type': result.mimeType,
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(result.originalName)}`,
        'Content-Length': result.decryptedData.length.toString(),
      });
      
      res.send(result.decryptedData);
    } catch (error) {
      console.error('解密下载失败:', error);
      res.status(404).json({ message: error.message });
    }
  }

  @Get(':id/download')
  @ApiOperation({ summary: '下载报告文件' })
  @ApiResponse({ status: 200, description: '下载成功' })
  @ApiResponse({ status: 404, description: '报告不存在' })
  async downloadReport(@Param('id') id: string, @Request() req: any, @Res() res: Response) {
    const report = await this.reportService.findById(id, req.user.id);
    
    if (!report.storageUri || !fs.existsSync(report.storageUri)) {
      throw new NotFoundException('文件不存在');
    }

    const filePath = report.storageUri;
    const fileName = report.originalName || report.fileName;

    res.setHeader('Content-Type', report.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    res.setHeader('Content-Length', report.fileSize.toString());

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Get(':id/view')
  @ApiOperation({ summary: '在线查看报告文件' })
  @ApiResponse({ status: 200, description: '查看成功' })
  @ApiResponse({ status: 404, description: '报告不存在' })
  async viewReport(@Param('id') id: string, @Request() req: any, @Res() res: Response) {
    const report = await this.reportService.findById(id, req.user.id);
    
    try {
      // 检查是否为加密文件
      if (report.metadata?.isEncrypted) {
        console.log(`查看加密文件: ${id}, 用户: ${req.user.id}`);
        
        // 解密文件
        const result = await this.reportService.downloadDecryptedReport(id, req.user.id);
        
        // 对于PDF文件，直接返回解密后的内容
        if (result.mimeType === 'application/pdf') {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(result.originalName)}`);
          res.setHeader('Content-Length', result.decryptedData.length.toString());
          res.send(result.decryptedData);
        } else {
          // 对于其他文件类型，返回文件信息
          res.json({
            id: report.id,
            fileName: result.originalName,
            mimeType: result.mimeType,
            fileSize: result.decryptedData.length,
            message: '此文件类型不支持在线预览，请下载查看',
            isEncrypted: true
          });
        }
        return;
      }
      
      // 处理未加密文件
      if (!report.storageUri || !fs.existsSync(report.storageUri)) {
        throw new NotFoundException('文件不存在');
      }

      const filePath = report.storageUri;
      
      // 对于PDF文件，直接返回文件内容
      if (report.mimeType === 'application/pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(report.originalName)}`);
        
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
      } else {
        // 对于其他文件类型，返回文件信息
        res.json({
          id: report.id,
          fileName: report.originalName,
          mimeType: report.mimeType,
          fileSize: report.fileSize,
          message: '此文件类型不支持在线预览，请下载查看',
          isEncrypted: false
        });
      }
    } catch (error) {
      console.error('查看文件失败:', error);
      throw new NotFoundException('文件查看失败');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除报告' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '报告不存在' })
  async deleteReport(@Param('id') id: string, @Request() req: any) {
    return this.reportService.deleteReport(id, req.user.id);
  }

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiOperation({ summary: '上传健康报告' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '报告上传成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  async uploadReport(
    @UploadedFile() file: Express.Multer.File,
    @Body() createReportDto: CreateReportDto,
    @Request() req: any,
  ) {
    if (!file) {
      throw new Error('请选择要上传的文件');
    }

    return this.reportService.createReport(req.user.id, file, createReportDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建报告记录' })
  @ApiResponse({ status: 201, description: '报告创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async createReport(
    @Body() createReportDto: CreateReportDto,
    @Request() req: any,
  ) {
    return this.reportService.createReportRecord(req.user.id, createReportDto);
  }
}
