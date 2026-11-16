import { Body, Controller, ForbiddenException, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth') @Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register') @Throttle({ default: { limit: 5, ttl: 60_000 } })
  register(@Body() dto: RegisterDto) {
    // El sitio no tiene registro público; solo se habilita explícitamente.
    if (process.env.ALLOW_PUBLIC_REGISTER !== 'true') throw new ForbiddenException('Registro deshabilitado');
    return this.auth.register(dto.email, dto.password, dto.name);
  }
  @Post('login') @HttpCode(200)
  login(@Body() dto: LoginDto) { return this.auth.login(dto.email, dto.password); }
  @Post('refresh') @HttpCode(200) refresh(@Body() dto: RefreshDto) { return this.auth.refresh(dto.refreshToken); }
  @Post('logout') @HttpCode(200) logout(@Body() dto: RefreshDto) { return this.auth.logout(dto.refreshToken); }
  @Get('me') @ApiBearerAuth() @UseGuards(JwtAuthGuard) me(@CurrentUser() u: JwtUser) { return this.auth.me(u.id); }
}
