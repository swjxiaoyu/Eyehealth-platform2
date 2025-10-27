import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IPFSService } from './ipfs-enhanced.service';

@ApiTags('IPFS公开接口')
@Controller('api/v1/public/ipfs')
export class PublicIPFSController {
  constructor(private readonly ipfsService: IPFSService) {}

  @Get('health')
  @ApiOperation({ summary: 'IPFS服务公开健康检查' })
  @ApiResponse({ status: 200, description: '服务状态正常' })
  async healthCheck(): Promise<{ status: string; nodeId?: string; version?: string }> {
    return await this.ipfsService.healthCheck();
  }
}




