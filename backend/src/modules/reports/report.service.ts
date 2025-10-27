import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../../entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { MinioService } from '../storage/minio.service';
import { EncryptionService } from '../encryption/encryption.service';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface FindByUserIdOptions {
  page?: number;
  limit?: number;
  type?: string;
}

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    private minioService: MinioService,
    private encryptionService: EncryptionService,
  ) {}

  async createReport(
    userId: string,
    file: Express.Multer.File,
    createReportDto: CreateReportDto,
  ) {
    try {
      // 读取文件内容
      const fileBuffer = fs.readFileSync(file.path);
      
      // 处理文件名编码问题
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      
      // 加密文件
      const encryptionResult = await this.encryptionService.encryptFile(
        fileBuffer,
        userId,
        originalName,
        file.mimetype,
      );
      
      // 生成文件哈希（基于原始文件内容）
      const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      
      // 生成MinIO对象名称
      const timestamp = Date.now();
      const objectName = `reports/${userId}/${timestamp}-${file.filename}`;
      
      // 上传加密后的文件到MinIO
      const uploadResult = await this.minioService.uploadBuffer(
        'eyehealth-reports',
        objectName,
        encryptionResult.encryptedData,
        'application/octet-stream', // 加密文件使用通用二进制类型
      );
      
      if (!uploadResult.success) {
        throw new Error(`MinIO上传失败: ${uploadResult.error}`);
      }
      
      // 创建报告记录
      const report = this.reportRepository.create({
        userId,
        type: createReportDto.type,
        fileName: file.filename,
        originalName: originalName,
        mimeType: file.mimetype,
        fileSize: file.size,
        storageUri: uploadResult.url,
        reportHash: fileHash,
        metadata: {
          description: createReportDto.description,
          uploadDate: new Date().toISOString(),
          minioBucket: 'eyehealth-reports',
          minioObjectName: objectName,
          // 加密相关元数据
          encryptionKeyId: encryptionResult.encryptionKeyId,
          keyHash: encryptionResult.keyHash,
          iv: encryptionResult.iv.toString('base64'),
          tag: encryptionResult.tag.toString('base64'),
          isEncrypted: true,
        },
        isProcessed: false,
      });

      const savedReport = await this.reportRepository.save(report);
      
      // 清理本地临时文件
      try {
        fs.unlinkSync(file.path);
      } catch (cleanupError) {
        console.warn('清理临时文件失败:', cleanupError);
      }

      // TODO: 这里应该调用AI服务进行报告分析
      // TODO: 这里应该将哈希记录到区块链

      return {
        id: savedReport.id,
        message: '报告上传并加密成功',
        fileHash,
        storageUri: savedReport.storageUri,
        originalName: originalName,
        encryptionKeyId: encryptionResult.encryptionKeyId,
        isEncrypted: true,
      };
    } catch (error) {
      console.error('报告上传失败:', error);
      throw new Error('报告上传失败');
    }
  }

  async createReportRecord(userId: string, createReportDto: CreateReportDto) {
    const report = this.reportRepository.create({
      userId,
      type: createReportDto.type,
      fileName: 'manual-record',
      originalName: 'manual-record',
      mimeType: 'text/plain',
      fileSize: 0,
      storageUri: '',
      metadata: {
        description: createReportDto.description,
        uploadDate: new Date().toISOString(),
      },
      isProcessed: true,
    });

    return this.reportRepository.save(report);
  }

  async findByUserId(userId: string, options: FindByUserIdOptions = {}): Promise<{ reports: Report[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, type } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.reportRepository.createQueryBuilder('report')
      .where('report.userId = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('report.type = :type', { type });
    }

    const [reports, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('report.createdAt', 'DESC')
      .getManyAndCount();

    return {
      reports,
      total,
      page,
      limit,
    };
  }

  async findById(id: string, userId: string): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id, userId },
    });

    if (!report) {
      throw new NotFoundException('报告不存在');
    }

    return report;
  }

  async getUserReports(userId: string) {
    return this.reportRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async downloadDecryptedReport(id: string, userId: string): Promise<{
    decryptedData: Buffer;
    originalName: string;
    mimeType: string;
  }> {
    const report = await this.getReportById(id, userId);
    
    if (!report.metadata?.isEncrypted) {
      throw new Error('报告未加密，无法解密');
    }
    
    try {
      // 从MinIO下载加密文件
      const encryptedData = await this.minioService.downloadFile(
        report.metadata.minioBucket,
        report.metadata.minioObjectName,
      );
      
      // 解密文件
      const decryptionResult = await this.encryptionService.decryptFile(
        encryptedData,
        Buffer.from(report.metadata.iv, 'base64'),
        Buffer.from(report.metadata.tag, 'base64'),
        report.metadata.encryptionKeyId,
        userId,
      );
      
      return {
        decryptedData: decryptionResult.decryptedData,
        originalName: decryptionResult.originalFileName,
        mimeType: decryptionResult.mimeType,
      };
    } catch (error) {
      console.error('报告解密失败:', error);
      throw new Error('报告解密失败');
    }
  }

  async getReportById(id: string, userId: string) {
    const report = await this.reportRepository.findOne({
      where: { id, userId },
    });

    if (!report) {
      throw new NotFoundException('报告不存在');
    }

    return report;
  }

  async deleteReport(id: string, userId: string) {
    const report = await this.getReportById(id, userId);
    
    // 删除文件
    if (report.storageUri && fs.existsSync(report.storageUri)) {
      fs.unlinkSync(report.storageUri);
    }
    
    await this.reportRepository.remove(report);
    return { message: '报告删除成功' };
  }
}
