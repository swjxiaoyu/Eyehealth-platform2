import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class WalletLoginDto {
  @ApiProperty({
    description: '钱包地址',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  })
  @IsString()
  @IsNotEmpty({ message: '钱包地址不能为空' })
  walletAddress: string;

  @ApiProperty({
    description: '签名消息',
    example: '0x1234567890abcdef...',
    required: false,
  })
  @IsString()
  @IsOptional()
  signature?: string;

  @ApiProperty({
    description: '原始消息',
    example: 'Welcome to EyeHealth Platform! Please sign this message to authenticate.',
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;
}


