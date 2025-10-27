import { 
  Controller, 
  Post, 
  Delete, 
  Get,
  Param, 
  UseGuards, 
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { MinioService } from './minio.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Response } from 'express';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

export interface UploadFileDto {
  bucket: string;
  folder?: string;
  filename?: string;
}

export interface FileListQuery {
  bucket: string;
  prefix?: string;
  limit?: number;
}

@ApiTags('存储管理')
@Controller('api/v1/storage')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly minioService: MinioService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = 'uploads/temp';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
    fileFilter: (req, file, cb) => {
      // 允许的文件类型
      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('不支持的文件类型'), false);
      }
    },
  }))
  @ApiOperation({ summary: '上传文件到MinIO' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '上传成功' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
  ): Promise<any> {
    if (!file) {
      throw new HttpException('没有上传文件', HttpStatus.BAD_REQUEST);
    }

    try {
      // 确定存储桶
      const bucket = uploadDto.bucket || 'eyehealth-uploads';
      
      // 生成对象名称
      const folder = uploadDto.folder || 'general';
      const filename = uploadDto.filename || file.originalname;
      const objectName = `${folder}/${Date.now()}-${filename}`;

      // 上传到MinIO
      const result = await this.minioService.uploadFile(
        bucket,
        objectName,
        file.path,
        file.mimetype,
      );

      // 清理临时文件
      try {
        fs.unlinkSync(file.path);
      } catch (cleanupError) {
        console.warn('清理临时文件失败:', cleanupError);
      }

      if (result.success) {
        return {
          success: true,
          message: '文件上传成功',
          data: {
            url: result.url,
            bucket: result.bucket,
            objectName: result.objectName,
            etag: result.etag,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
          },
        };
      } else {
        throw new HttpException(result.error || '上传失败', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      // 清理临时文件
      if (file?.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          console.warn('清理临时文件失败:', cleanupError);
        }
      }
      
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('upload-buffer')
  @ApiOperation({ summary: '上传缓冲区数据到MinIO' })
  @ApiResponse({ status: 201, description: '上传成功' })
  async uploadBuffer(@Body() uploadData: {
    bucket: string;
    objectName: string;
    data: string; // base64编码的数据
    contentType: string;
    folder?: string;
  }): Promise<any> {
    try {
      const bucket = uploadData.bucket || 'eyehealth-uploads';
      const folder = uploadData.folder || 'general';
      const objectName = uploadData.objectName || `${folder}/${Date.now()}-buffer`;
      
      // 解码base64数据
      const buffer = Buffer.from(uploadData.data, 'base64');

      const result = await this.minioService.uploadBuffer(
        bucket,
        objectName,
        buffer,
        uploadData.contentType,
      );

      if (result.success) {
        return {
          success: true,
          message: '数据上传成功',
          data: {
            url: result.url,
            bucket: result.bucket,
            objectName: result.objectName,
            etag: result.etag,
            size: buffer.length,
          },
        };
      } else {
        throw new HttpException(result.error || '上传失败', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('list')
  @ApiOperation({ summary: '列出存储桶中的文件' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async listFiles(@Query() query: FileListQuery): Promise<any> {
    try {
      const bucket = query.bucket || 'eyehealth-uploads';
      const prefix = query.prefix || '';
      const limit = query.limit || 100;

      const files = await this.minioService.listFiles(bucket, prefix);
      
      // 限制返回数量
      const limitedFiles = files.slice(0, limit);

      return {
        success: true,
        data: {
          files: limitedFiles,
          total: files.length,
          bucket,
          prefix,
        },
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('url/:bucket/:objectName')
  @ApiOperation({ summary: '获取文件访问URL' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getFileUrl(
    @Param('bucket') bucket: string,
    @Param('objectName') objectName: string,
  ): Promise<any> {
    try {
      const url = await this.minioService.getFileUrl(bucket, objectName);
      
      if (url) {
        return {
          success: true,
          data: {
            url,
            bucket,
            objectName,
          },
        };
      } else {
        throw new HttpException('文件不存在', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('download/:bucket/:objectName')
  @ApiOperation({ summary: '下载文件' })
  @ApiResponse({ status: 200, description: '下载成功' })
  async downloadFile(
    @Param('bucket') bucket: string,
    @Param('objectName') objectName: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const buffer = await this.minioService.downloadFile(bucket, objectName);
      
      // 设置响应头
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${objectName}"`,
        'Content-Length': buffer.length.toString(),
      });

      res.send(buffer);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('info/:bucket/:objectName')
  @ApiOperation({ summary: '获取文件信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getFileInfo(
    @Param('bucket') bucket: string,
    @Param('objectName') objectName: string,
  ): Promise<any> {
    try {
      const info = await this.minioService.getFileInfo(bucket, objectName);
      
      if (info) {
        return {
          success: true,
          data: {
            bucket,
            objectName,
            size: info.size,
            lastModified: info.lastModified,
            etag: info.etag,
            contentType: info.metaData['content-type'],
          },
        };
      } else {
        throw new HttpException('文件不存在', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':bucket/:objectName')
  @ApiOperation({ summary: '删除文件' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteFile(
    @Param('bucket') bucket: string,
    @Param('objectName') objectName: string,
  ): Promise<any> {
    try {
      const success = await this.minioService.deleteFile(bucket, objectName);
      
      if (success) {
        return {
          success: true,
          message: '文件删除成功',
        };
      } else {
        throw new HttpException('文件删除失败', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('buckets')
  @ApiOperation({ summary: '列出所有存储桶' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async listBuckets(): Promise<any> {
    try {
      const buckets = await this.minioService.listBuckets();
      
      return {
        success: true,
        data: {
          buckets,
        },
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'MinIO健康检查' })
  @ApiResponse({ status: 200, description: '健康检查成功' })
  async healthCheck(): Promise<any> {
    try {
      const isHealthy = await this.minioService.healthCheck();
      
      return {
        success: true,
        data: {
          healthy: isHealthy,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        data: {
          healthy: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
}