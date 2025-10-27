import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ReportModule } from './modules/reports/report.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { StorageModule } from './modules/storage/storage.module';
import { EncryptionModule } from './modules/encryption/encryption.module';
import { EyeHealthModule } from './modules/eye-health/eye-health.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [{
          ttl: parseInt(configService.get('RATE_LIMIT_TTL', '60')),
          limit: parseInt(configService.get('RATE_LIMIT_LIMIT', '100')),
        }],
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    ReportModule,
    ProductModule,
    OrderModule,
    RecommendationModule,
    BlockchainModule,
    StorageModule,
    EncryptionModule,
    EyeHealthModule,
    GamificationModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}