import { Body, Controller, Delete, ForbiddenException, Get, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';

@ApiTags('users') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Get() @Roles('admin') findAll() { return this.users.findAll(); }
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() me: JwtUser) {
    if (me.role !== 'admin' && me.id !== id) throw new ForbiddenException();
    return this.users.findOne(id);
  }
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto, @CurrentUser() me: JwtUser) {
    if (me.role !== 'admin' && me.id !== id) throw new ForbiddenException();
    return this.users.update(id, dto, me.role === 'admin');
  }
  @Delete(':id') @Roles('admin') remove(@Param('id', ParseUUIDPipe) id: string) { return this.users.remove(id); }
}
