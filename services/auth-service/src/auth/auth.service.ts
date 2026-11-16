import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';

export const ACCESS_TTL_S = 15 * 60;
export const REFRESH_TTL_MS = 7 * 24 * 3600 * 1000;
const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

@Injectable()
export class AuthService {
  private readonly loginAttempts = new Map<string, { count: number; until: number }>();

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    @InjectRepository(RefreshToken) private readonly tokens: Repository<RefreshToken>,
  ) {}

  /** El registro público siempre crea 'visitante'; los roles los otorga un admin. */
  async register(email: string, password: string, name: string) {
    return this.issue(await this.users.create(email, password, name, 'visitante'));
  }

  private checkLoginThrottle(email: string): void {
    const key = email.toLowerCase();
    const now = Date.now();
    const st = this.loginAttempts.get(key);
    // Sólo bloquea si ya tenemos 5+ intentos Y el tiempo de bloqueo aún no venció.
    // No borramos el entry si until es 0 (significa "nunca se alcanzó el umbral").
    if (st && st.until > now && st.count >= 5) {
      throw new UnauthorizedException('Demasiados intentos; intente más tarde');
    }
    // Limpia entries expiradas solo cuando actually tenían un bloqueo vigente.
    if (st && st.until > 0 && st.until <= now) this.loginAttempts.delete(key);
  }

  private recordLoginFailure(email: string): void {
    const key = email.toLowerCase();
    const now = Date.now();
    const st = this.loginAttempts.get(key) ?? { count: 0, until: 0 };
    st.count += 1;
    if (st.count >= 5) st.until = now + 15 * 60 * 1000;
    this.loginAttempts.set(key, st);
  }

  async login(email: string, password: string) {
    this.checkLoginThrottle(email);
    const user = await this.users.findByEmailWithHash(email);
    // compare siempre se ejecuta: evita enumeración de usuarios por timing
    const hash = user?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
    const ok = await bcrypt.compare(password, hash);
    if (!user || !ok || !user.isActive) {
      this.recordLoginFailure(email);
      throw new UnauthorizedException('Credenciales inválidas');
    }
    this.loginAttempts.delete(email.toLowerCase());
    return this.issue(user);
  }

  /** Rotación: el refresh usado se revoca; reutilizar uno revocado revoca todas las sesiones. */
  async refresh(rawToken: string) {
    const stored = await this.tokens.findOne({ where: { token: sha256(rawToken) } });
    if (!stored) throw new UnauthorizedException('Refresh token inválido');
    if (stored.revoked) {
      await this.tokens.update({ userId: stored.userId }, { revoked: true });
      throw new UnauthorizedException('Refresh token reutilizado; sesiones revocadas');
    }
    if (stored.expiresAt < new Date()) throw new UnauthorizedException('Refresh token expirado');
    stored.revoked = true;
    await this.tokens.save(stored);
    return this.issue(await this.users.findOne(stored.userId));
  }

  async logout(rawToken: string) {
    await this.tokens.update({ token: sha256(rawToken) }, { revoked: true });
    return { message: 'Sesión cerrada' };
  }

  me(id: string) { return this.users.findOne(id); }

  private async issue(user: User) {
    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role }, { secret: process.env.JWT_SECRET, expiresIn: ACCESS_TTL_S });
    const refreshToken = randomBytes(48).toString('hex');
    await this.tokens.save(this.tokens.create({ userId: user.id, token: sha256(refreshToken), expiresAt: new Date(Date.now() + REFRESH_TTL_MS) }));
    const { passwordHash: _omit, ...safe } = user as User & { passwordHash?: string };
    return { user: safe, accessToken, refreshToken, expiresIn: ACCESS_TTL_S };
  }
}