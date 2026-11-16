import { SetMetadata } from '@nestjs/common';
export type Role = 'admin' | 'docente' | 'estudiante' | 'visitante';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
