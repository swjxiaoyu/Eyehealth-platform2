import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEncryption } from '../../utils/file-encryption.util';
import { EncryptionKey } from '../../entities/encryption-key.entity';
import * as crypto from 'crypto';

export interface EncryptionResult {
  encryptedData: Buffer;
  iv: Buffer;
  tag: Buffer;
  keyHash: string;
  encryptionKeyId: string;
}

export interface DecryptionResult {
  decryptedData: Buffer;
  originalFileName: string;
  mimeType: string;
}

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);

  constructor(
    @InjectRepository(EncryptionKey)
    private encryptionKeyRepository: Repository<EncryptionKey>,
  ) {}

  /**
   * 加密文件
   * @param fileBuffer 文件内容
   * @param userId 用户ID
   * @param fileName 文件名
   * @param mimeType 文件类型
   * @returns 加密结果
   */
  async encryptFile(
    fileBuffer: Buffer,
    userId: string,
    fileName: string,
    mimeType: string,
  ): Promise<EncryptionResult> {
    try {
      // 生成新的加密密钥
      const encryptionKey = FileEncryption.generateKey();
      
      // 加密文件
      const encryptionResult = FileEncryption.encryptFile(fileBuffer, encryptionKey);
      
      // 保存加密密钥到数据库
      const keyRecord = this.encryptionKeyRepository.create({
        userId,
        keyHash: encryptionResult.keyHash,
        encryptedKey: this.encryptKey(encryptionKey), // 对密钥本身进行加密
        fileName,
        mimeType,
        isActive: true,
      });
      
      const savedKey = await this.encryptionKeyRepository.save(keyRecord);
      
      this.logger.log(`文件加密成功: ${fileName}, 密钥ID: ${savedKey.id}`);
      
      return {
        encryptedData: encryptionResult.encryptedData,
        iv: encryptionResult.iv,
        tag: encryptionResult.tag,
        keyHash: encryptionResult.keyHash,
        encryptionKeyId: savedKey.id,
      };
    } catch (error) {
      this.logger.error(`文件加密失败: ${error.message}`);
      throw new Error(`文件加密失败: ${error.message}`);
    }
  }

  /**
   * 解密文件
   * @param encryptedData 加密的数据
   * @param iv 初始化向量
   * @param tag 认证标签
   * @param encryptionKeyId 加密密钥ID
   * @param userId 用户ID
   * @returns 解密结果
   */
  async decryptFile(
    encryptedData: Buffer,
    iv: Buffer,
    tag: Buffer,
    encryptionKeyId: string,
    userId: string,
  ): Promise<DecryptionResult> {
    try {
      // 获取加密密钥记录
      const keyRecord = await this.encryptionKeyRepository.findOne({
        where: { id: encryptionKeyId, userId, isActive: true },
      });
      
      if (!keyRecord) {
        throw new Error('加密密钥不存在或已失效');
      }
      
      // 解密密钥
      const decryptionKey = this.decryptKey(keyRecord.encryptedKey);
      
      // 验证密钥哈希
      if (!FileEncryption.verifyKeyHash(decryptionKey, keyRecord.keyHash)) {
        throw new Error('密钥验证失败');
      }
      
      // 解密文件
      const decryptedData = FileEncryption.decryptFile(
        encryptedData,
        decryptionKey,
        iv,
        tag,
      );
      
      this.logger.log(`文件解密成功: ${keyRecord.fileName}`);
      
      return {
        decryptedData,
        originalFileName: keyRecord.fileName,
        mimeType: keyRecord.mimeType,
      };
    } catch (error) {
      this.logger.error(`文件解密失败: ${error.message}`);
      throw new Error(`文件解密失败: ${error.message}`);
    }
  }

  /**
   * 删除加密密钥
   * @param encryptionKeyId 加密密钥ID
   * @param userId 用户ID
   */
  async deleteEncryptionKey(encryptionKeyId: string, userId: string): Promise<void> {
    try {
      const keyRecord = await this.encryptionKeyRepository.findOne({
        where: { id: encryptionKeyId, userId },
      });
      
      if (keyRecord) {
        keyRecord.isActive = false;
        await this.encryptionKeyRepository.save(keyRecord);
        this.logger.log(`加密密钥已删除: ${encryptionKeyId}`);
      }
    } catch (error) {
      this.logger.error(`删除加密密钥失败: ${error.message}`);
      throw new Error(`删除加密密钥失败: ${error.message}`);
    }
  }

  /**
   * 获取用户的加密密钥列表
   * @param userId 用户ID
   * @returns 加密密钥列表
   */
  async getUserEncryptionKeys(userId: string): Promise<EncryptionKey[]> {
    return this.encryptionKeyRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 加密密钥本身（使用主密钥）
   * @param key 要加密的密钥
   * @returns 加密后的密钥
   */
  private encryptKey(key: string): string {
    // 使用环境变量中的主密钥
    const masterKey = process.env.MASTER_ENCRYPTION_KEY || 'default-master-key-change-in-production';
    const keyHash = crypto.createHash('sha256').update(masterKey).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', keyHash, iv);
    let encrypted = cipher.update(key, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
  }

  /**
   * 解密密钥本身
   * @param encryptedKey 加密的密钥
   * @returns 解密后的密钥
   */
  private decryptKey(encryptedKey: string): string {
    // 使用环境变量中的主密钥
    const masterKey = process.env.MASTER_ENCRYPTION_KEY || 'default-master-key-change-in-production';
    const keyHash = crypto.createHash('sha256').update(masterKey).digest();
    
    const parts = encryptedKey.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted key format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyHash, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
