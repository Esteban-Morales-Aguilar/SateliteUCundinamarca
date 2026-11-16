import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshToken } from './entities/refresh-token.entity';
import { UsersModule } from '../users/users.module';
import { SeedService } from './seed.service';

@Module({
  imports: [PassportModule, JwtModule.register({}), TypeOrmModule.forFeature([RefreshToken]), UsersModule],
  controllers: [AuthController], providers: [AuthService, JwtStrategy, SeedService],
})
export class AuthModule {}
