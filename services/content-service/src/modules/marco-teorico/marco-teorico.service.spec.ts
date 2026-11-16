import { NotFoundException } from '@nestjs/common';
import { MarcoTeoricoService } from './marco-teorico.service';
import { sanitize } from '../../common/sanitize';

describe('MarcoTeoricoService', () => {
  const cache: any = { wrap: (_k: string, fn: () => any) => fn(), invalidate: jest.fn() };
  it('bySlug lanza 404', async () => {
    const model: any = { findOne: () => ({ lean: async () => null }) };
    await expect(new MarcoTeoricoService(model, cache).bySlug('x')).rejects.toThrow(NotFoundException);
  });
  it('update versiona y sanitiza', async () => {
    const doc: any = { version: 1, title: 'T', content: 'old', history: [], save: jest.fn() };
    const model: any = { findById: async () => doc };
    await new MarcoTeoricoService(model, cache).update('id', { content: '<p>ok</p><script>alert(1)</script>' });
    expect(doc.version).toBe(2);
    expect(doc.history[0].content).toBe('old');
    expect(doc.content).not.toContain('script');
  });
  it('sanitize elimina handlers y javascript:', () => {
    expect(sanitize('<img src=x onerror=alert(1)>')).not.toContain('onerror');
    expect(sanitize('<a href="javascript:alert(1)">x</a>')).not.toContain('javascript:');
  });
});
