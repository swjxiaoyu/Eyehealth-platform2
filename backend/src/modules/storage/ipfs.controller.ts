import { Controller, Post, Get, Delete, Param, Body, UseInterceptors, UploadedFile, UseGuards, HttpException, HttpStatus, Query, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { IPFSService, IPFSUploadResult, IPFSFileInfo } from './ipfs-enhanced.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateIPFSUploadDto, IPFSDownloadDto, IPFSPinDto } from './dto/ipfs.dto';
import { IPFSFile } from '../../entities/ipfs-file.entity';

@ApiTags('IPFS去中心化存储')
@Controller('api/v1/ipfs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IPFSController {
  constructor(private readonly ipfsService: IPFSService) {}

  @Post('upload/file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传文件到IPFS' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '文件上传成功' })
  @ApiResponse({ status: 400, description: '上传失败' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: CreateIPFSUploadDto,
    @Request() req: any,
  ): Promise<IPFSUploadResult> {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    try {
      // 正确处理中文文件名编码
      let filename = uploadDto.filename || file.originalname;
      if (file.originalname && !uploadDto.filename) {
        // 尝试修复中文文件名编码问题
        try {
          filename = Buffer.from(file.originalname, 'latin1').toString('utf8');
        } catch (e) {
          // 如果转换失败，使用原始文件名
          filename = file.originalname;
        }
      }
      
      return await this.ipfsService.uploadFile(
        file.buffer, 
        filename,
        req.user.id,
        file.mimetype,
        uploadDto.description
      );
    } catch (error) {
      throw new HttpException(`Upload failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('upload/string')
  @ApiOperation({ summary: '上传字符串到IPFS' })
  @ApiResponse({ status: 201, description: '字符串上传成功' })
  @ApiResponse({ status: 400, description: '上传失败' })
  async uploadString(
    @Body() uploadDto: { content: string; filename: string; description?: string },
    @Request() req: any,
  ): Promise<IPFSUploadResult> {
    if (!uploadDto.content || !uploadDto.filename) {
      throw new HttpException('Content and filename are required', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.ipfsService.uploadString(
        uploadDto.content, 
        uploadDto.filename,
        req.user.id,
        uploadDto.description
      );
    } catch (error) {
      throw new HttpException(`Upload failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('upload/json')
  @ApiOperation({ summary: '上传JSON数据到IPFS' })
  @ApiResponse({ status: 201, description: 'JSON上传成功' })
  @ApiResponse({ status: 400, description: '上传失败' })
  async uploadJSON(
    @Body() uploadDto: { data: any; filename: string; description?: string },
    @Request() req: any,
  ): Promise<IPFSUploadResult> {
    if (!uploadDto.data || !uploadDto.filename) {
      throw new HttpException('Data and filename are required', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.ipfsService.uploadJSON(
        uploadDto.data, 
        uploadDto.filename,
        req.user.id,
        uploadDto.description
      );
    } catch (error) {
      throw new HttpException(`Upload failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('files')
  @ApiOperation({ summary: '获取用户的IPFS文件列表' })
  @ApiResponse({ status: 200, description: '文件列表获取成功' })
  async getUserFiles(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ files: IPFSFile[]; total: number }> {
    try {
      return await this.ipfsService.getUserFiles(req.user.id, page, limit);
    } catch (error) {
      throw new HttpException(`Failed to get files: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('file/:id')
  @ApiOperation({ summary: '获取IPFS文件详情' })
  @ApiResponse({ status: 200, description: '文件详情获取成功' })
  @ApiResponse({ status: 404, description: '文件不存在' })
  async getFileById(@Param('id') id: string): Promise<IPFSFile> {
    try {
      return await this.ipfsService.getFileById(id);
    } catch (error) {
      throw new HttpException(`File not found: ${error.message}`, HttpStatus.NOT_FOUND);
    }
  }

  @Get('download/:cid')
  @ApiOperation({ summary: '从IPFS下载文件' })
  @ApiResponse({ status: 200, description: '文件下载成功' })
  @ApiResponse({ status: 404, description: '文件不存在' })
  async downloadFile(@Param('cid') cid: string): Promise<Buffer> {
    try {
      return await this.ipfsService.downloadFile(cid);
    } catch (error) {
      throw new HttpException(`Download failed: ${error.message}`, HttpStatus.NOT_FOUND);
    }
  }

  @Get('download/string/:cid')
  @ApiOperation({ summary: '从IPFS下载字符串' })
  @ApiResponse({ status: 200, description: '字符串下载成功' })
  @ApiResponse({ status: 404, description: '内容不存在' })
  async downloadString(@Param('cid') cid: string): Promise<{ content: string }> {
    try {
      const content = await this.ipfsService.downloadString(cid);
      return { content };
    } catch (error) {
      throw new HttpException(`Download failed: ${error.message}`, HttpStatus.NOT_FOUND);
    }
  }

  @Get('download/json/:cid')
  @ApiOperation({ summary: '从IPFS下载JSON数据' })
  @ApiResponse({ status: 200, description: 'JSON下载成功' })
  @ApiResponse({ status: 404, description: '数据不存在' })
  async downloadJSON(@Param('cid') cid: string): Promise<any> {
    try {
      return await this.ipfsService.downloadJSON(cid);
    } catch (error) {
      throw new HttpException(`Download failed: ${error.message}`, HttpStatus.NOT_FOUND);
    }
  }

  @Get('info/:cid')
  @ApiOperation({ summary: '获取IPFS文件信息' })
  @ApiResponse({ status: 200, description: '文件信息获取成功' })
  @ApiResponse({ status: 404, description: '文件不存在' })
  async getFileInfo(@Param('cid') cid: string): Promise<IPFSFileInfo> {
    try {
      return await this.ipfsService.getFileInfo(cid);
    } catch (error) {
      throw new HttpException(`Info retrieval failed: ${error.message}`, HttpStatus.NOT_FOUND);
    }
  }

  @Post('pin/:cid')
  @ApiOperation({ summary: '固定IPFS文件' })
  @ApiResponse({ status: 200, description: '文件固定成功' })
  @ApiResponse({ status: 400, description: '固定失败' })
  async pinFile(
    @Param('cid') cid: string,
    @Request() req: any,
  ): Promise<{ message: string; cid: string }> {
    try {
      await this.ipfsService.pinFile(cid, req.user.id);
      return { message: 'File pinned successfully', cid };
    } catch (error) {
      throw new HttpException(`Pin failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('pin/:cid')
  @ApiOperation({ summary: '取消固定IPFS文件' })
  @ApiResponse({ status: 200, description: '文件取消固定成功' })
  @ApiResponse({ status: 400, description: '取消固定失败' })
  async unpinFile(
    @Param('cid') cid: string,
    @Request() req: any,
  ): Promise<{ message: string; cid: string }> {
    try {
      await this.ipfsService.unpinFile(cid, req.user.id);
      return { message: 'File unpinned successfully', cid };
    } catch (error) {
      throw new HttpException(`Unpin failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('file/:id')
  @ApiOperation({ summary: '删除IPFS文件记录' })
  @ApiResponse({ status: 200, description: '文件删除成功' })
  @ApiResponse({ status: 404, description: '文件不存在' })
  async deleteFile(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string; id: string }> {
    try {
      await this.ipfsService.deleteFile(id, req.user.id);
      return { message: 'File deleted successfully', id };
    } catch (error) {
      throw new HttpException(`Delete failed: ${error.message}`, HttpStatus.NOT_FOUND);
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'IPFS服务健康检查' })
  @ApiResponse({ status: 200, description: '服务状态正常' })
  async healthCheck(): Promise<{ status: string; nodeId?: string; version?: string }> {
    return await this.ipfsService.healthCheck();
  }

  @Get('public/health')
  @ApiOperation({ summary: 'IPFS服务公开健康检查' })
  @ApiResponse({ status: 200, description: '服务状态正常' })
  async publicHealthCheck(): Promise<{ status: string; nodeId?: string; version?: string }> {
    return await this.ipfsService.healthCheck();
  }
}