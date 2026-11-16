import { describe, expect, it } from 'vitest';
import { fmt, fmtBytes, fmtCOP, guessLang } from './format';

describe('format', () => {
  it('fmt maneja nulos', () => { expect(fmt(null)).toBe('—'); expect(fmt(undefined)).toBe('—'); expect(fmt(NaN)).toBe('—'); });
  it('fmt redondea', () => expect(fmt(1.26, 1)).toMatch(/1[,.]3/));
  it('fmtBytes', () => { expect(fmtBytes(500)).toBe('500 B'); expect(fmtBytes(5 * 1024 * 1024)).toBe('5.0 MB'); });
  it('fmtCOP', () => expect(fmtCOP(1289149).replace(/\s/g, '')).toMatch(/1\.289\.149/));
  it('guessLang', () => { expect(guessLang('import time\nwhile True:')).toBe('python'); expect(guessLang('sudo apt update')).toBe('bash'); });
});
