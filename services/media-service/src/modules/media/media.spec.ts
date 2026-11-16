import { parseRange } from './range';
import { SAFE_ID, ALLOWED_MIME } from './media.service';

describe('parseRange', () => {
  it('sin cabecera => null (respuesta completa)', () => expect(parseRange(undefined, 1000)).toBeNull());
  it('rango cerrado', () => expect(parseRange('bytes=0-99', 1000)).toEqual({ start: 0, end: 99 }));
  it('rango abierto', () => expect(parseRange('bytes=500-', 1000)).toEqual({ start: 500, end: 999 }));
  it('sufijo', () => expect(parseRange('bytes=-100', 1000)).toEqual({ start: 900, end: 999 }));
  it('end se recorta al tamaño', () => expect(parseRange('bytes=900-5000', 1000)).toEqual({ start: 900, end: 999 }));
  it('fuera de rango => invalid', () => expect(parseRange('bytes=2000-3000', 1000)).toBe('invalid'));
  it('mal formado => invalid', () => {
    expect(parseRange('bytes=abc', 1000)).toBe('invalid');
    expect(parseRange('bytes=-', 1000)).toBe('invalid');
    expect(parseRange('bytes=50-10', 1000)).toBe('invalid');
  });
});

describe('validaciones', () => {
  it('SAFE_ID rechaza traversal', () => {
    expect(SAFE_ID.test('../etc/passwd')).toBe(false);
    expect(SAFE_ID.test('a/b')).toBe(false);
    expect(SAFE_ID.test('estratosat-telco-despliegue.mp4')).toBe(true);
  });
  it('MIME permitidos', () => {
    expect(ALLOWED_MIME.video.test('video/mp4')).toBe(true);
    expect(ALLOWED_MIME.video.test('application/x-msdownload')).toBe(false);
    expect(ALLOWED_MIME.pdfs.test('application/pdf')).toBe(true);
  });
});
