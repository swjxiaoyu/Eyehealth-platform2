import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum ReportType {
  EXAMINATION = 'examination',
  PRESCRIPTION = 'prescription',
  MEDICAL_RECORD = 'medical_record',
}

export class CreateReportDto {
  @ApiProperty({
    description: '报告类型',
    enum: ReportType,
    example: ReportType.EXAMINATION,
  })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({
    description: '报告描述',
    example: '定期眼健康检查报告',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '检查日期',
    example: '2024-01-15',
    required: false,
  })
  @IsOptional()
  @IsString()
  date?: string;
}






