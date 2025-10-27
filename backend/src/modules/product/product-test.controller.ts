import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductService } from './product.service';

@ApiTags('产品测试')
@Controller('api/v1/test/products')
export class ProductTestController {
  constructor(private readonly productService: ProductService) {}

  @Get('qr/:qrCode')
  @ApiOperation({ summary: '测试二维码扫描（无需认证）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async testProductByQrCode(@Param('qrCode') qrCode: string): Promise<any> {
    const product = await this.productService.findByQrCode(qrCode);
    if (!product) {
      return { error: '产品不存在' };
    }

    // 获取产品的溯源记录
    const traceRecords = await this.productService.getTraceRecords(product.id);
    
    return {
      ...product,
      traceRecords
    };
  }
}





