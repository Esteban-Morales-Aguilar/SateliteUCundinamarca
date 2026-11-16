import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from '../users/users.service';

/** Crea el admin inicial desde ADMIN_EMAIL / ADMIN_PASSWORD (hash bcrypt real). */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly log = new Logger('Seed');
  constructor(private readonly users: UsersService) {}
  async onApplicationBootstrap(): Promise<void> {
    const { ADMIN_EMAIL: email, ADMIN_PASSWORD: pass } = process.env;
    if (!email || !pass) return;
    try { await this.users.create(email, pass, 'Administrador', 'admin'); this.log.log(`Admin inicial creado: ${email}`); }
    catch { /* ya existe */ }
  }
}
