import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import {
  CreateBucketCommand, DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, HeadObjectCommand,
  ListObjectsV2Command, S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createReadStream, createWriteStream } from 'fs';
import { rm } from 'fs/promises';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import sharp from 'sharp';

export type MediaKind = 'video' | 'images' | 'pdfs';
export const BUCKETS: Record<MediaKind, string> = {
  video: 'spacenet-videos', images: 'spacenet-images', pdfs: 'spacenet-pdfs',
};
export const ALLOWED_MIME: Record<MediaKind, RegExp> = {
  video: /^video\/(mp4|webm|ogg)$/, images: /^image\/(png|jpe?g|webp|svg\+xml)$/, pdfs: /^application\/pdf$/,
};
/** Evita path traversal / claves raras: solo nombre plano con caracteres seguros. */
export const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

@Injectable()
export class MediaService implements OnModuleInit {
  private readonly log = new Logger('Media');
  private readonly s3 = new S3Client({
    region: 'us-east-1',
    endpoint: process.env.MINIO_ENDPOINT ?? 'http://minio:9000',
    forcePathStyle: true,
    credentials: { accessKeyId: process.env.MINIO_ACCESS_KEY ?? '', secretAccessKey: process.env.MINIO_SECRET_KEY ?? '' },
  });

  /** Crea los buckets si no existen (con reintentos mientras MinIO arranca). */
  async onModuleInit(): Promise<void> {
    for (const bucket of Object.values(BUCKETS)) {
      for (let i = 0; i < 10; i++) {
        try {
          try { await this.s3.send(new HeadBucketCommand({ Bucket: bucket })); }
          catch { await this.s3.send(new CreateBucketCommand({ Bucket: bucket })); }
          break;
        } catch (e) {
          if (i === 9) this.log.warn(`No se pudo preparar ${bucket}: ${(e as Error).message}`);
          else await new Promise((r) => setTimeout(r, 3000));
        }
      }
    }
  }

  assertId(id: string): void {
    if (!SAFE_ID.test(id)) throw new BadRequestException('Identificador inválido');
  }

  async head(kind: MediaKind, id: string) {
    this.assertId(id);
    try {
      return await this.s3.send(new HeadObjectCommand({ Bucket: BUCKETS[kind], Key: id }));
    } catch {
      throw new NotFoundException('Archivo no encontrado');
    }
  }

  async stream(kind: MediaKind, id: string, range?: { start: number; end: number }): Promise<Readable> {
    const res = await this.s3.send(new GetObjectCommand({
      Bucket: BUCKETS[kind], Key: id, Range: range ? `bytes=${range.start}-${range.end}` : undefined,
    }));
    return res.Body as Readable;
  }

  signedUrl(kind: MediaKind, id: string, ttlS = 900): Promise<string> {
    this.assertId(id);
    return getSignedUrl(this.s3, new GetObjectCommand({ Bucket: BUCKETS[kind], Key: id }), { expiresIn: ttlS });
  }

  /** Sube desde un archivo temporal en disco (no carga videos de cientos de MB en memoria). */
  async upload(kind: MediaKind, id: string, tmpPath: string, mime: string): Promise<{ id: string; kind: MediaKind; size?: number }> {
    this.assertId(id);
    if (!ALLOWED_MIME[kind].test(mime)) throw new BadRequestException(`Tipo ${mime} no permitido para ${kind}`);
    let path = tmpPath; let contentType = mime;
    try {
      if (kind === 'images' && mime !== 'image/svg+xml') {
        // Optimización: máx. 1920 px de ancho y WebP de calidad 82
        const out = `${tmpPath}.webp`;
        await pipeline(createReadStream(tmpPath), sharp().rotate().resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 82 }), createWriteStream(out));
        path = out; contentType = 'image/webp';
      }
      const upload = new Upload({
        client: this.s3,
        params: { Bucket: BUCKETS[kind], Key: id, Body: createReadStream(path), ContentType: contentType },
        partSize: 8 * 1024 * 1024, queueSize: 3,
      });
      await upload.done();
      return { id, kind };
    } finally {
      await rm(tmpPath, { force: true }); await rm(`${tmpPath}.webp`, { force: true });
    }
  }

  async remove(kind: MediaKind, id: string): Promise<void> {
    await this.head(kind, id);
    await this.s3.send(new DeleteObjectCommand({ Bucket: BUCKETS[kind], Key: id }));
  }

  /** Busca un id en todos los buckets (para DELETE /media/:id sin tipo). */
  async locate(id: string): Promise<MediaKind | null> {
    this.assertId(id);
    for (const kind of Object.keys(BUCKETS) as MediaKind[]) {
      try { await this.s3.send(new HeadObjectCommand({ Bucket: BUCKETS[kind], Key: id })); return kind; } catch { /* siguiente */ }
    }
    return null;
  }

  async list(kind: MediaKind) {
    const res = await this.s3.send(new ListObjectsV2Command({ Bucket: BUCKETS[kind], MaxKeys: 200 }));
    return (res.Contents ?? []).map((o) => ({ id: o.Key, size: o.Size, updatedAt: o.LastModified }));
  }
}
