import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

export interface MinioConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  bucket?: string;
  objectName?: string;
  etag?: any; // MinIO的etag类型
  error?: string;
}

export interface FileInfo {
  name?: string;
  size?: number;
  lastModified?: Date;
  etag?: string;
  contentType?: string;
}

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;
  private config: MinioConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      endPoint: this.configService.get('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.configService.get('MINIO_PORT', '9000')),
      useSSL: this.configService.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY', 'admin'),
      secretKey: this.configService.get('MINIO_SECRET_KEY', 'password123'),
    };

    // 调试日志
    console.log('MinIO配置:', {
      endPoint: this.config.endPoint,
      port: this.config.port,
      useSSL: this.config.useSSL,
      accessKey: this.config.accessKey,
      secretKey: this.config.secretKey ? '***' : 'undefined'
    });

    this.minioClient = new Minio.Client(this.config);
  }

  async uploadFile(
    bucketName: string,
    objectName: string,
    filePath: string,
    contentType?: string,
  ): Promise<UploadResult> {
    try {
      // 确保存储桶存在
      await this.ensureBucketExists(bucketName);

      // 上传文件
      const etag = await this.minioClient.fPutObject(
        bucketName,
        objectName,
        filePath,
        {
          'Content-Type': contentType || 'application/octet-stream',
        },
      );

      // 生成访问URL
      const url = await this.getFileUrl(bucketName, objectName);

      return {
        success: true,
        url,
        bucket: bucketName,
        objectName,
        etag,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async uploadBuffer(
    bucketName: string,
    objectName: string,
    buffer: Buffer,
    contentType?: string,
  ): Promise<UploadResult> {
    try {
      // 确保存储桶存在
      await this.ensureBucketExists(bucketName);

      // 上传缓冲区
      const etag = await this.minioClient.putObject(
        bucketName,
        objectName,
        buffer,
        buffer.length,
        {
          'Content-Type': contentType || 'application/octet-stream',
        },
      );

      // 生成访问URL
      const url = await this.getFileUrl(bucketName, objectName);

      return {
        success: true,
        url,
        bucket: bucketName,
        objectName,
        etag,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async deleteFile(bucketName: string, objectName: string): Promise<boolean> {
    try {
      await this.minioClient.removeObject(bucketName, objectName);
      return true;
    } catch (error) {
      console.error('删除文件失败:', error);
      return false;
    }
  }

  async getFileUrl(bucketName: string, objectName: string): Promise<string> {
    try {
      // 生成预签名URL，有效期7天
      const url = await this.minioClient.presignedGetObject(
        bucketName,
        objectName,
        7 * 24 * 60 * 60, // 7天
      );
      return url;
    } catch (error) {
      console.error('生成文件URL失败:', error);
      return '';
    }
  }

  async listFiles(bucketName: string, prefix?: string): Promise<FileInfo[]> {
    try {
      const files: FileInfo[] = [];
      const stream = this.minioClient.listObjects(bucketName, prefix, true);

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          files.push({
            name: obj.name || '',
            size: obj.size || 0,
            lastModified: obj.lastModified || new Date(),
            etag: obj.etag || '',
            contentType: undefined, // MinIO ObjectInfo没有contentType属性
          });
        });

        stream.on('end', () => {
          resolve(files);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('列出文件失败:', error);
      return [];
    }
  }

  async fileExists(bucketName: string, objectName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(bucketName, objectName);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getFileInfo(bucketName: string, objectName: string): Promise<any> {
    try {
      const stat = await this.minioClient.statObject(bucketName, objectName);
      return stat;
    } catch (error) {
      console.error('获取文件信息失败:', error);
      return null;
    }
  }

  async downloadFile(bucketName: string, objectName: string): Promise<Buffer> {
    try {
      const stream = await this.minioClient.getObject(bucketName, objectName);
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => {
          chunks.push(chunk);
        });

        stream.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        stream.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('下载文件失败:', error);
      throw error;
    }
  }

  private async ensureBucketExists(bucketName: string): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(bucketName, 'us-east-1');
        console.log(`创建存储桶: ${bucketName}`);
      }
    } catch (error) {
      console.error(`确保存储桶存在失败: ${bucketName}`, error);
      throw error;
    }
  }

  async createBucket(bucketName: string, region: string = 'us-east-1'): Promise<boolean> {
    try {
      await this.minioClient.makeBucket(bucketName, region);
      return true;
    } catch (error) {
      console.error('创建存储桶失败:', error);
      return false;
    }
  }

  async deleteBucket(bucketName: string): Promise<boolean> {
    try {
      await this.minioClient.removeBucket(bucketName);
      return true;
    } catch (error) {
      console.error('删除存储桶失败:', error);
      return false;
    }
  }

  async listBuckets(): Promise<string[]> {
    try {
      const buckets = await this.minioClient.listBuckets();
      return buckets.map(bucket => bucket.name);
    } catch (error) {
      console.error('列出存储桶失败:', error);
      return [];
    }
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    try {
      await this.minioClient.listBuckets();
      return true;
    } catch (error) {
      console.error('MinIO健康检查失败:', error);
      return false;
    }
  }
}
