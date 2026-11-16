import { expect, test } from '@playwright/test';

test('portada con título y acceso al ODC', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/SpaceNet/i);
});

test('el marco teórico muestra sus 4 secciones sin evaluaciones', async ({ page }) => {
  await page.goto('/marco-teorico');
  await expect(page.getByRole('tab')).toHaveCount(4);
  await expect(page.getByText(/cuestionario|puntaje|insignia/i)).toHaveCount(0);
});

test('las 5 guías técnicas están disponibles', async ({ page }) => {
  await page.goto('/guias');
  await expect(page.getByRole('tab')).toHaveCount(5);
});

test('créditos: licencia CC BY-NC-SA 4.0 y autores', async ({ page }) => {
  await page.goto('/creditos');
  await expect(page.getByText(/BY-NC-SA 4\.0/).first()).toBeVisible();
  await expect(page.getByText('Esteban Morales Aguilar')).toBeVisible();
});

test('ruta inexistente muestra 404', async ({ page }) => {
  await page.goto('/no-existe');
  await expect(page.getByText(/404/)).toBeVisible();
});
