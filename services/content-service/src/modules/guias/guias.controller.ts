import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GuiasService } from './guias.service';

@ApiTags('guias') @Controller('content/guias')
export class GuiasController {
  constructor(private readonly svc: GuiasService) {}
  @Get() list() { return this.svc.list(); }
  @Get(':slug') one(@Param('slug') slug: string) { return this.svc.bySlug(slug); }
}
