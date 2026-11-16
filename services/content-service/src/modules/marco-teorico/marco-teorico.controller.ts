import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MarcoTeoricoService } from './marco-teorico.service';
import { CreateMarcoDto, ListQueryDto, UpdateMarcoDto } from './marco-teorico.dto';
import { AdminGuard } from '../../common/admin.guard';

@ApiTags('marco-teorico') @Controller('content/marco-teorico')
export class MarcoTeoricoController {
  constructor(private readonly svc: MarcoTeoricoService) {}
  @Get() list(@Query() q: ListQueryDto) { return this.svc.list(q); }
  @Get(':slug') one(@Param('slug') slug: string) { return this.svc.bySlug(slug); }
  @Post() @ApiBearerAuth() @UseGuards(AdminGuard) create(@Body() dto: CreateMarcoDto) { return this.svc.create(dto); }
  @Patch(':id') @ApiBearerAuth() @UseGuards(AdminGuard) update(@Param('id') id: string, @Body() dto: UpdateMarcoDto) { return this.svc.update(id, dto); }
  @Delete(':id') @ApiBearerAuth() @UseGuards(AdminGuard) remove(@Param('id') id: string) { return this.svc.remove(id); }
}
