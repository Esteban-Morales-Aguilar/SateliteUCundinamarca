import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import '../i18n';
import { sanitizeHtml, RichContent } from '../components/common/RichContent';
import { ComponentsTable, totals } from '../components/guias/ComponentsTable';
import { Navbar } from '../components/common/Navbar';
import { groupByTopic } from '../pages/Creditos';
import { DEFAULT_STATE, slantRange, toLinkInput } from '../hooks/useSimulation';

describe('sanitizeHtml', () => {
  it('elimina scripts, handlers y javascript:', () => {
    const out = sanitizeHtml('<p>ok</p><script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">x</a>');
    expect(out).toContain('<p>ok</p>');
    expect(out).not.toMatch(/script|onerror|javascript:/i);
  });
  it('RichContent renderiza HTML seguro', () => {
    render(<RichContent html="<h2>Título</h2><p>Texto</p>" />);
    expect(screen.getByRole('heading', { name: 'Título' })).toBeInTheDocument();
  });
});

describe('ComponentsTable', () => {
  const rows = [
    { category: 'A', item: 'Uno', economico: 1000, premium: 4000 },
    { category: 'B', item: 'Dos', economico: 2500, premium: 500 },
  ];
  it('suma los totales de las filas', () => expect(totals(rows)).toEqual({ economico: 3500, premium: 4500 }));
  it('muestra una fila por componente y el total', () => {
    render(<ComponentsTable rows={rows} />);
    expect(screen.getByText('Uno')).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Total/ })).toBeInTheDocument();
  });
});

describe('simulación', () => {
  it('slantRange es la hipotenusa', () => expect(slantRange(30, 40)).toBe(50));
  it('slantRange nunca es 0', () => expect(slantRange(0, 0)).toBeGreaterThan(0));
  it('toLinkInput usa la distancia en línea recta', () => {
    const i = toLinkInput({ ...DEFAULT_STATE, altitude_km: 30, horizontal_km: 40 });
    expect(i.distance_km).toBe(50);
    expect(i.altitude_km).toBe(30);
  });
});

describe('Creditos', () => {
  it('agrupa por tema', () => {
    const g = groupByTopic([{ _id: '1', citeKey: 'a', topic: 'lora', apa: 'x' }, { _id: '2', citeKey: 'b', topic: 'lora', apa: 'y' }, { _id: '3', citeKey: 'c', topic: 'otro', apa: 'z' }]);
    expect(g.map(([k, v]) => [k, v.length])).toEqual([['LoRa y LoRaWAN', 2], ['Otras referencias', 1]]);
  });
});

describe('Navbar', () => {
  it('muestra todas las secciones y el botón de menú móvil accesible', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    for (const n of ['Inicio', 'Marco teórico', 'Dashboard', 'Guías técnicas', 'Video', 'Créditos']) expect(screen.getAllByText(n).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /menú/i })).toHaveAttribute('aria-expanded', 'false');
  });
});
