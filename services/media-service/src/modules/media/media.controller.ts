import {
  BadRequestException, Body, Controller, Delete, Get, Header, HttpStatus, NotFoundException, Param, Post, Req, Res,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import type { Request, Response } from 'express';
import { MediaKind, MediaService } from './media.service';
import { parseRange } from './range';
import { AdminGuard } from '../../common/admin.guard';

const KINDS: MediaKind[] = ['video', 'images', 'pdfs'];
const CACHE = 'public, max-age=86400, stale-while-revalidate=604800'; // CDN-ready

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get('video/:id')
  async video(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const head = await this.media.head('video', id);
    const size = head.ContentLength ?? 0;
    const range = parseRange(req.headers.range, size);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', head.ContentType ?? 'video/mp4');
    res.setHeader('Cache-Control', CACHE);
    if (head.ETag) res.setHeader('ETag', head.ETag);
    if (range === 'invalid') {
      res.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE).setHeader('Content-Range', `bytes */${size}`).end();
      return;
    }
    if (range) {
      res.status(HttpStatus.PARTIAL_CONTENT);
      res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${size}`);
      res.setHeader('Content-Length', String(range.end - range.start + 1));
    } else {
      res.status(HttpStatus.OK);
      res.setHeader('Content-Length', String(size));
    }
    const stream = await this.media.stream('video', id, range ?? undefined);
    stream.on('error', () => res.destroy());
    req.on('close', () => stream.destroy());   // el usuario hizo seek/cerró: cortar lectura
    stream.pipe(res);
  }

  @Get('video/:id/signed-url') @ApiBearerAuth() @UseGuards(AdminGuard)
  async videoSigned(@Param('id') id: string) {
    await this.media.head('video', id);
    return { url: await this.media.signedUrl('video', id), expiresInSeconds: 900 };
  }

  @Get('images/:id')
  async image(@Param('id') id: string, @Res() res: Response) { return this.pipeSimple('images', id, res); }

  @Get('pdfs/:id')
  async pdf(@Param('id') id: string, @Res() res: Response) { return this.pipeSimple('pdfs', id, res, true); }

  /** ¿Existe el archivo? Permite a la interfaz mostrar un estado vacío en vez de un reproductor roto. */
  @Get('exists/:kind/:id')
  async exists(@Param('kind') kind: string, @Param('id') id: string) {
    if (!KINDS.includes(kind as MediaKind)) throw new NotFoundException();
    try { await this.media.head(kind as MediaKind, id); return { exists: true }; }
    catch (e) { if (e instanceof NotFoundException) return { exists: false }; throw e; }
  }

  @Get('list/:kind') @ApiBearerAuth() @UseGuards(AdminGuard)
  list(@Param('kind') kind: string) {
    if (!KINDS.includes(kind as MediaKind)) throw new NotFoundException();
    return this.media.list(kind as MediaKind);
  }

  @Post('upload') @ApiBearerAuth() @ApiConsumes('multipart/form-data') @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: tmpdir(),
      filename: (_r, _f, cb) => cb(null, `upload-${randomBytes(8).toString('hex')}`),
    }),
    limits: { fileSize: 500 * 1024 * 1024, files: 1 },
  }))
  async upload(@UploadedFile() file: Express.Multer.File, @Body() body: { kind?: string; id?: string }) {
    if (!file) throw new BadRequestException('Falta el archivo (campo "file")');
    const kind = body.kind as MediaKind;
    if (!KINDS.includes(kind)) throw new BadRequestException('kind debe ser video, images o pdfs');
    let id = body.id ?? file.originalname.replace(/[^A-Za-z0-9._-]/g, '_');
    if (kind === 'images' && file.mimetype !== 'image/svg+xml') id = id.replace(/\.[^.]+$/, '') + '.webp';
    return this.media.upload(kind, id, file.path, file.mimetype);
  }

  @Delete(':id') @ApiBearerAuth() @UseGuards(AdminGuard)
  async remove(@Param('id') id: string) {
    const kind = await this.media.locate(id);
    if (!kind) throw new NotFoundException('Archivo no encontrado');
    await this.media.remove(kind, id);
    return { deleted: id };
  }

  private async pipeSimple(kind: MediaKind, id: string, res: Response, download = false) {
    const head = await this.media.head(kind, id);
    res.setHeader('Content-Type', head.ContentType ?? 'application/octet-stream');
    res.setHeader('Content-Length', String(head.ContentLength ?? 0));
    res.setHeader('Cache-Control', CACHE);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (kind === 'images' && head.ContentType === 'image/svg+xml')
      res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'"); // SVG sin scripts
    if (download) res.setHeader('Content-Disposition', `attachment; filename="${id}"`);
    const stream = await this.media.stream(kind, id);
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  }
}
