import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { Product } from '../../entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../decorators/public.decorator';

@ApiTags('产品管理')
@Controller('api/v1/products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: '获取产品列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'category', required: false, description: '产品分类' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProducts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.productService.findAll({ page, limit, category, search });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取产品详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async getProduct(@Param('id') id: string): Promise<Product | null> {
    return this.productService.findById(id);
  }

  @Get('sku/:sku')
  @ApiOperation({ summary: '根据SKU获取产品' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async getProductBySku(@Param('sku') sku: string): Promise<Product | null> {
    return this.productService.findBySku(sku);
  }

  @Public()
  @Get('qr/:qrCode')
  @ApiOperation({ summary: '根据二维码获取产品及溯源信息（公开访问）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async getProductByQrCode(@Param('qrCode') qrCode: string): Promise<any> {
    const product = await this.productService.findByQrCode(qrCode);
    if (!product) {
      return null;
    }

    // 获取产品的溯源记录
    const traceRecords = await this.productService.getTraceRecords(product.id);
    
    return {
      ...product,
      traceRecords
    };
  }

  @Get('test/qr/:qrCode')
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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建产品' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async createProduct(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新产品' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除产品' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async deleteProduct(@Param('id') id: string): Promise<void> {
    return this.productService.remove(id);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: '验证产品' })
  @ApiResponse({ status: 200, description: '验证成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async verifyProduct(@Param('id') id: string): Promise<{ verified: boolean; message: string }> {
    return this.productService.verifyProduct(id);
  }
}
