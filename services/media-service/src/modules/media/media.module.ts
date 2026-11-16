import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminGuard } from '../../common/admin.guard';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [MediaController],
  providers: [MediaService, AdminGuard],
})
export class MediaModule {}
