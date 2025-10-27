import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ethers } from 'ethers';

@Injectable()
export class SignatureService {
  /**
   * 生成用于签名的消息
   */
  generateMessage(walletAddress: string, timestamp?: number): string {
    const ts = timestamp || Date.now();
    return `Welcome to EyeHealth Platform!\n\nPlease sign this message to authenticate.\n\nWallet: ${walletAddress}\nTimestamp: ${ts}`;
  }

  /**
   * 验证以太坊签名
   * @param message 原始消息
   * @param signature 签名
   * @param address 钱包地址
   */
  verifySignature(message: string, signature: string, address: string): boolean {
    try {
      console.log('验证签名:', { message, signature, address });
      
      // 验证签名格式
      if (!signature.startsWith('0x') || signature.length !== 132) {
        console.log('签名格式无效');
        return false;
      }

      // 使用ethers.js验证签名
      const recoveredAddress = ethers.verifyMessage(message, signature);
      console.log('恢复的地址:', recoveredAddress);
      console.log('期望的地址:', address);
      
      const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();
      console.log('签名验证结果:', isValid);
      
      return isValid;
    } catch (error) {
      console.error('签名验证失败:', error);
      return false;
    }
  }

  /**
   * 生成随机nonce用于防重放攻击
   */
  generateNonce(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 验证nonce是否有效
   */
  validateNonce(nonce: string): boolean {
    return Boolean(nonce && nonce.length === 64 && /^[0-9a-f]+$/i.test(nonce));
  }
}
