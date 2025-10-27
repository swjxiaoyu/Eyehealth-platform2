import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateIPFSUploadDto {
  @ApiProperty({ description: '文件名', required: false })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiProperty({ description: '文件描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class IPFSDownloadDto {
  @ApiProperty({ description: 'IPFS内容标识符(CID)' })
  @IsNotEmpty()
  @IsString()
  cid: string;
}

export class IPFSPinDto {
  @ApiProperty({ description: 'IPFS内容标识符(CID)' })
  @IsNotEmpty()
  @IsString()
  cid: string;
}

export class IPFSUploadResponseDto {
  @ApiProperty({ description: 'IPFS内容标识符(CID)' })
  cid: string;

  @ApiProperty({ description: '文件大小(字节)' })
  size: number;

  @ApiProperty({ description: '文件路径', required: false })
  path?: string;
}

export class IPFSFileInfoDto {
  @ApiProperty({ description: 'IPFS内容标识符(CID)' })
  cid: string;

  @ApiProperty({ description: '文件大小(字节)' })
  size: number;

  @ApiProperty({ description: '文件名', required: false })
  name?: string;

  @ApiProperty({ description: '文件类型', required: false })
  type?: string;

  @ApiProperty({ description: '上传时间' })
  uploadedAt: Date;
}

export class IPFSHealthDto {
  @ApiProperty({ description: '服务状态' })
  status: string;

  @ApiProperty({ description: '节点ID', required: false })
  nodeId?: string;

  @ApiProperty({ description: '版本信息', required: false })
  version?: string;
}
