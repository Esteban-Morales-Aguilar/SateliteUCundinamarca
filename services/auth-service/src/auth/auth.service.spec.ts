import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const user: any = { id: 'u1', email: 'a@b.co', name: 'A', role: 'visitante', isActive: true };
  let store: any[];
  const tokens: any = {
    create: (x: any) => x,
    save: async (x: any) => { if (!store.includes(x)) store.push(x); return x; },
    findOne: async ({ where }: any) => store.find((t) => t.token === where.token) ?? null,
    update: async (w: any) => { store.filter((t) => t.userId === w.userId || t.token === w.token).forEach((t) => (t.revoked = true)); },
  };
  const jwt: any = { signAsync: async () => 'jwt.token.here' };
  const users: any = {
    findByEmailWithHash: async (e: string) => (e === user.email ? { ...user, passwordHash: bcrypt.hashSync('Secret123', 4) } : null),
    findOne: async () => user, create: async () => user,
  };
  let svc: AuthService;
  beforeEach(() => { store = []; svc = new AuthService(users, jwt, tokens); });

  it('login correcto devuelve tokens y guarda solo el hash', async () => {
    const r = await svc.login(user.email, 'Secret123');
    expect(r.accessToken).toBe('jwt.token.here');
    expect(r.refreshToken).toHaveLength(96);
    expect(store[0].token).not.toBe(r.refreshToken);
  });
  it('contraseña errónea falla', async () => { await expect(svc.login(user.email, 'bad')).rejects.toThrow(UnauthorizedException); });
  it('usuario inexistente falla', async () => { await expect(svc.login('no@existe.co', 'x')).rejects.toThrow(UnauthorizedException); });
  it('refresh rota el token', async () => {
    const a = await svc.login(user.email, 'Secret123');
    const b = await svc.refresh(a.refreshToken);
    expect(b.refreshToken).not.toBe(a.refreshToken);
    expect(store[0].revoked).toBe(true);
  });
  it('reutilizar un refresh revoca todas las sesiones', async () => {
    const a = await svc.login(user.email, 'Secret123');
    await svc.refresh(a.refreshToken);
    await expect(svc.refresh(a.refreshToken)).rejects.toThrow(UnauthorizedException);
    expect(store.every((t) => t.revoked)).toBe(true);
  });
});
