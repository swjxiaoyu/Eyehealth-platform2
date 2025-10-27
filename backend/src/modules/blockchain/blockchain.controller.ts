import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BlockchainService } from './blockchain.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('区块链管理')
@Controller('api/v1/blockchain')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post('trace')
  @ApiOperation({ summary: '创建溯源记录' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createTrace(@Body() traceData: any, @Request() req: any): Promise<any> {
    // 添加用户信息到溯源数据
    traceData.issuer = req.user.walletAddress || req.user.id;
    traceData.issuerName = req.user.name || 'Unknown User';
    return this.blockchainService.createTrace(traceData);
  }

  @Get('trace/:id')
  @ApiOperation({ summary: '获取溯源记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getTrace(@Param('id') id: string): Promise<any> {
    return this.blockchainService.getTrace(id);
  }

  @Get('trace/product/:productId')
  @ApiOperation({ summary: '根据产品ID获取溯源记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getTracesByProduct(@Param('productId') productId: string): Promise<any[]> {
    return this.blockchainService.getTracesByProduct(productId);
  }

  @Post('trace/:id/verify')
  @ApiOperation({ summary: '验证溯源记录' })
  @ApiResponse({ status: 200, description: '验证成功' })
  async verifyTrace(@Param('id') id: string, @Body() body: { verificationMethod?: string }): Promise<any> {
    return this.blockchainService.verifyTrace(id, body.verificationMethod || 'manual');
  }

  @Post('product')
  @ApiOperation({ summary: '创建产品' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createProduct(@Body() productData: any, @Request() req: any): Promise<any> {
    // 添加制造商信息
    productData.manufacturerId = req.user.walletAddress || req.user.id;
    productData.manufacturerName = req.user.name || 'Unknown Manufacturer';
    return this.blockchainService.createProduct(productData);
  }

  @Get('product/:id')
  @ApiOperation({ summary: '获取产品信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProduct(@Param('id') id: string): Promise<any> {
    return this.blockchainService.getProduct(id);
  }

  @Get('product/sku/:sku')
  @ApiOperation({ summary: '根据SKU获取产品' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProductBySKU(@Param('sku') sku: string): Promise<any> {
    return this.blockchainService.getProductBySKU(sku);
  }

  @Post('product/:id/verify')
  @ApiOperation({ summary: '验证产品' })
  @ApiResponse({ status: 200, description: '验证成功' })
  async verifyProduct(@Param('id') id: string): Promise<any> {
    return this.blockchainService.verifyProduct(id);
  }

  @Get('network/info')
  @ApiOperation({ summary: '获取网络信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getNetworkInfo(): Promise<any> {
    return this.blockchainService.getNetworkInfo();
  }
}



