import { describe, expect, it } from 'vitest';
import { cotisationsCarcdsf } from './carcdsf';
describe('CARCDSF 2026', () => {
  it('100 000 € : calcul à la main sur le barème de la caisse', () => {
    const c = cotisationsCarcdsf(100000);
    expect(c.rbl).toBeCloseTo(0.0873 * 48060 + 0.0187 * 100000, 6);
    expect(c.rc).toBeCloseTo(3210.6 + 0.1135 * (100000 - 0.65 * 48060), 6);
    expect(c.pcv).toBeCloseTo(1663.6 + 0.00725 * 100000, 6);
    expect(c.rid).toBe(1235);
  });
  it('revenu nul : minimum du régime de base (573 €) et forfaits', () => {
    const c = cotisationsCarcdsf(0);
    expect(c.rbl).toBeCloseTo(573.354, 3);
    expect(c.rc).toBe(3210.6);
  });
  it('au-delà de 5 Pass : plafonds', () => {
    const a = cotisationsCarcdsf(5 * 48060), b = cotisationsCarcdsf(400000);
    expect(b.rbl).toBeCloseTo(a.rbl, 6); expect(b.rc).toBeCloseTo(a.rc, 6); expect(b.pcv).toBeCloseTo(a.pcv, 6);
  });
});
