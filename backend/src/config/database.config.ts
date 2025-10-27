import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Report } from '../entities/report.entity';
import { Product } from '../entities/product.entity';
import { Trace } from '../entities/trace.entity';
import { Order } from '../entities/order.entity';
import { Recommendation } from '../entities/recommendation.entity';
import { IPFSFile } from '../entities/ipfs-file.entity';
import { EncryptionKey } from '../entities/encryption-key.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DATABASE_HOST', 'localhost'),
  port: configService.get('DATABASE_PORT', 5432),
  username: configService.get('DATABASE_USERNAME', 'postgres'),
  password: configService.get('DATABASE_PASSWORD', 'swj21bsss'),
  database: configService.get('DATABASE_NAME', 'eyehealth'),
  entities: [User, Report, Product, Trace, Order, Recommendation, IPFSFile, EncryptionKey],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
  ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
  migrations: ['dist/migrations/*.js'],
  migrationsRun: false,
  autoLoadEntities: true,
});