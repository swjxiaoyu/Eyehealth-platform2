import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, IsDateString, MinLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: '产品SKU',
    example: 'EYE-VIT-001',
  })
  @IsString()
  @MinLength(3)
  sku: string;

  @ApiProperty({
    description: '产品名称',
    example: '护眼维生素胶囊',
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: '产品描述',
    example: '富含叶黄素和玉米黄质的护眼维生素',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '制造商ID',
    example: 'MFG-001',
  })
  @IsString()
  manufacturerId: string;

  @ApiProperty({
    description: '制造商名称',
    example: '健康科技有限公司',
  })
  @IsString()
  manufacturerName: string;

  @ApiProperty({
    description: '二维码',
    example: 'QR123456789',
  })
  @IsString()
  qrCode: string;

  @ApiProperty({
    description: '条形码',
    example: '1234567890123',
    required: false,
  })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({
    description: '价格',
    example: 299.99,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    description: '货币',
    example: 'CNY',
    required: false,
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: '产品分类',
    example: '保健品',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: '产品子分类',
    example: '护眼产品',
    required: false,
  })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiProperty({
    description: '产品规格',
    example: { weight: '500mg', count: 60 },
    required: false,
  })
  @IsOptional()
  specifications?: Record<string, any>;

  @ApiProperty({
    description: '成分列表',
    example: ['叶黄素', '玉米黄质', '维生素A'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  ingredients?: string[];

  @ApiProperty({
    description: '过期日期',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({
    description: '批次号',
    example: 'BATCH-2024-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiProperty({
    description: '序列号',
    example: 'SN123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;
}

export class UpdateProductDto {
  @ApiProperty({
    description: '产品名称',
    example: '护眼维生素胶囊',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({
    description: '产品描述',
    example: '富含叶黄素和玉米黄质的护眼维生素',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '价格',
    example: 299.99,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    description: '产品分类',
    example: '保健品',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: '产品子分类',
    example: '护眼产品',
    required: false,
  })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiProperty({
    description: '产品规格',
    example: { weight: '500mg', count: 60 },
    required: false,
  })
  @IsOptional()
  specifications?: Record<string, any>;

  @ApiProperty({
    description: '成分列表',
    example: ['叶黄素', '玉米黄质', '维生素A'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  ingredients?: string[];

  @ApiProperty({
    description: '过期日期',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({
    description: '是否激活',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}







