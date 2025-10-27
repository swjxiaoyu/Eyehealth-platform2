import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  async uploadFile(file: any): Promise<any> {
    // 模拟文件上传
    return { 
      success: true, 
      url: 'mock_url_' + Date.now(),
      hash: 'mock_hash_' + Date.now()
    };
  }

  async deleteFile(fileId: string): Promise<any> {
    // 模拟文件删除
    return { success: true };
  }
}






