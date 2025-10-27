import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/reports');
    },
    filename: (req, file, cb) => {
      // 处理中文文件名编码
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const timestamp = Date.now();
      const fileExtension = extname(originalName);
      const baseName = originalName.replace(fileExtension, '');
      const safeBaseName = baseName.replace(/[^\w\u4e00-\u9fa5]/g, '_');
      const fileName = `${timestamp}-${safeBaseName}${fileExtension}`;
      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    // 允许的文件类型
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
};







