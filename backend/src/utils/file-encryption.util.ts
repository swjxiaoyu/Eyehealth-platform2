import * as crypto from 'crypto';

export class FileEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 16; // 128 bits
  private static readonly TAG_LENGTH = 16; // 128 bits

  /**
   * 生成随机加密密钥
   */
  static generateKey(): string {
    return crypto.randomBytes(this.KEY_LENGTH).toString('hex');
  }

  /**
   * 生成随机IV
   */
  static generateIV(): Buffer {
    return crypto.randomBytes(this.IV_LENGTH);
  }

  /**
   * 加密文件内容
   * @param fileBuffer 文件内容
   * @param key 加密密钥
   * @returns 加密后的数据和元数据
   */
  static encryptFile(fileBuffer: Buffer, key: string): {
    encryptedData: Buffer;
    iv: Buffer;
    tag: Buffer;
    keyHash: string;
  } {
    try {
      // 生成IV
      const iv = this.generateIV();
      
      // 创建加密器
      const cipher = crypto.createCipheriv(this.ALGORITHM, Buffer.from(key, 'hex'), iv);
      cipher.setAAD(Buffer.from('eyehealth-platform', 'utf8')); // 附加认证数据
      
      // 加密数据
      const encrypted = Buffer.concat([
        cipher.update(fileBuffer),
        cipher.final()
      ]);
      
      // 获取认证标签
      const tag = cipher.getAuthTag();
      
      // 生成密钥哈希（用于验证）
      const keyHash = crypto.createHash('sha256').update(key).digest('hex');
      
      return {
        encryptedData: encrypted,
        iv,
        tag,
        keyHash
      };
    } catch (error) {
      throw new Error(`文件加密失败: ${error.message}`);
    }
  }

  /**
   * 解密文件内容
   * @param encryptedData 加密的数据
   * @param key 解密密钥
   * @param iv 初始化向量
   * @param tag 认证标签
   * @returns 解密后的文件内容
   */
  static decryptFile(
    encryptedData: Buffer,
    key: string,
    iv: Buffer,
    tag: Buffer
  ): Buffer {
    try {
      // 创建解密器
      const decipher = crypto.createDecipheriv(this.ALGORITHM, Buffer.from(key, 'hex'), iv);
      decipher.setAAD(Buffer.from('eyehealth-platform', 'utf8')); // 附加认证数据
      decipher.setAuthTag(tag);
      
      // 解密数据
      const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final()
      ]);
      
      return decrypted;
    } catch (error) {
      throw new Error(`文件解密失败: ${error.message}`);
    }
  }

  /**
   * 生成文件哈希
   * @param fileBuffer 文件内容
   * @returns SHA256哈希值
   */
  static generateFileHash(fileBuffer: Buffer): string {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  /**
   * 验证密钥哈希
   * @param key 密钥
   * @param expectedHash 期望的哈希值
   * @returns 是否匹配
   */
  static verifyKeyHash(key: string, expectedHash: string): boolean {
    const actualHash = crypto.createHash('sha256').update(key).digest('hex');
    return actualHash === expectedHash;
  }
}
