import { expect, test } from '@playwright/test';

test.describe('API a través del gateway', () => {
  test('simulación: balance de enlace', async ({ request }) => {
    const r = await request.post('/api/v1/simulation/link-budget', { data: { distance_km: 10 } });
    expect(r.ok()).toBeTruthy();
    const b = await r.json();
    expect(b.link_margin_db).toBeGreaterThan(0);
    expect(b.fspl_db).toBeCloseTo(111.67, 1);
  });

  test('simulación: validación rechaza SF fuera de rango', async ({ request }) => {
    expect((await request.post('/api/v1/simulation/link-budget', { data: { sf: 20 } })).status()).toBe(422);
  });

  test('contenido: marco teórico paginado', async ({ request }) => {
    const b = await (await request.get('/api/v1/content/marco-teorico')).json();
    expect(b.total).toBeGreaterThanOrEqual(4);
  });

  test('telemetría: POST sin API key es rechazado', async ({ request }) => {
    expect((await request.post('/api/v1/telemetry', { data: { altitude: 1 } })).status()).toBe(401);
  });

  test('auth: login inválido => 401 y perfil sin token => 401', async ({ request }) => {
    expect((await request.post('/api/v1/auth/login', { data: { email: 'x@y.co', password: 'nope' } })).status()).toBe(401);
    expect((await request.get('/api/v1/auth/me')).status()).toBe(401);
  });

  test('cabeceras de seguridad presentes', async ({ request }) => {
    const h = (await request.get('/')).headers();
    expect(h['x-frame-options']).toBeDefined();
    expect(h['content-security-policy']).toContain("default-src 'self'");
  });
});
