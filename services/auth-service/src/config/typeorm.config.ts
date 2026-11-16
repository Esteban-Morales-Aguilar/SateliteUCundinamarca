import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { InitSchema1700000000000 } from '../migrations/1700000000000-init-schema';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres', url: process.env.DATABASE_URL,
  entities: [User, RefreshToken], migrations: [InitSchema1700000000000],
  migrationsRun: true, synchronize: false, retryAttempts: 10, retryDelay: 3000,
});
