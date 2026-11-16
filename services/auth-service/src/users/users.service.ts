import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/user.dto';

export const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  async create(email: string, password: string, name: string, role = 'visitante'): Promise<User> {
    if (await this.repo.findOne({ where: { email: email.toLowerCase() } })) throw new ConflictException('El correo ya está registrado');
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    return this.repo.save(this.repo.create({ email: email.toLowerCase(), passwordHash, name, role }));
  }
  findAll(): Promise<User[]> { return this.repo.find({ order: { createdAt: 'DESC' } }); }
  async findOne(id: string): Promise<User> {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return u;
  }
  findByEmailWithHash(email: string): Promise<User | null> {
    return this.repo.createQueryBuilder('u').addSelect('u.passwordHash').where('u.email = :email', { email: email.toLowerCase() }).getOne();
  }
  async update(id: string, dto: UpdateUserDto, isAdmin: boolean): Promise<User> {
    const user = await this.findOne(id);
    if (dto.email && dto.email.toLowerCase() !== user.email) {
      if (await this.repo.findOne({ where: { email: dto.email.toLowerCase() } })) throw new ConflictException('El correo ya está registrado');
      user.email = dto.email.toLowerCase();
    }
    if (dto.name) user.name = dto.name;
    if (dto.password) user.passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    if (dto.role && isAdmin) user.role = dto.role; // anti escalada de privilegios
    return this.repo.save(user);
  }
  async remove(id: string): Promise<{ deleted: string }> {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Usuario no encontrado');
    return { deleted: id };
  }
}
