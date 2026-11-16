import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreditsService } from './credits.service';

@ApiTags('creditos') @Controller('content')
export class CreditsController {
  constructor(private readonly svc: CreditsService) {}
  @Get('creditos') creditos() { return this.svc.getCreditos(); }
  @Get('referencias') referencias() { return this.svc.referencias(); }
}
