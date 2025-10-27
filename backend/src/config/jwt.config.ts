import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.get('JWT_SECRET', 'your-super-secret-jwt-key'),
  signOptions: {
    expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
  },
});

export const getJwtRefreshConfig = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.get('JWT_REFRESH_SECRET', 'your-super-secret-refresh-key'),
  signOptions: {
    expiresIn: configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
  },
});

