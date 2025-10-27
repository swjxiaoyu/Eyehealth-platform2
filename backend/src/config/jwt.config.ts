import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (configService: ConfigService): JwtModuleOptions => {
  const expiresIn = configService.get<string | number>('JWT_EXPIRES_IN', '7d') || '7d';
  
  return {
    secret: configService.get<string>('JWT_SECRET', 'your-super-secret-jwt-key'),
    signOptions: {
      expiresIn: expiresIn,
    },
  };
};

export const getJwtRefreshConfig = (configService: ConfigService): JwtModuleOptions => {
  const expiresIn = configService.get<string | number>('JWT_REFRESH_EXPIRES_IN', '30d') || '30d';
  
  return {
    secret: configService.get<string>('JWT_REFRESH_SECRET', 'your-super-secret-refresh-key'),
    signOptions: {
      expiresIn: expiresIn,
    },
  };
};

