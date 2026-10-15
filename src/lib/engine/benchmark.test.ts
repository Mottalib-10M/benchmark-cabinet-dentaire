/**
 * Cas de référence recalculés à la main depuis les CSV officiels (scripts/data/raw/honoraires.csv,
 * export data.ameli.fr du 2026-10-15, année 2025), indépendamment du script de construction.
 */
import { describe, expect, it } from 'vitest';
import { comparable, depRank, depShare, depsBelow, gap, growth, refs, effGrowth } from './benchmark';
import { DEP_CODES, DATA_YEAR, stat } from './data';

describe('jeu de données Ameli', () => {
  it('année 2025, 101 départements', () => {
    expect(DATA_YEAR).toBe(2025);
    expect(DEP_CODES.length).toBe(101);
  });
  it('Rhône, omnipraticiens : 149 832 € sans dépassement + 132 066 € de dépassements', () => {
    const s = stat('dep', '69', 'omni')!;
    expect(s.hsd).toBe(149832); expect(s.dep).toBe(132066); expect(s.tot).toBe(281898);
  });
  it('France, orthodontistes (ODF) : 245 972 + 496 218 = 742 190 €', () => {
    expect(stat('fr', null, 'odf')!.tot).toBe(742190);
  });
  it('Paris, ODF : 119 890 + 381 093 €', () => {
    expect(stat('dep', '75', 'odf')!.tot).toBe(119890 + 381093);
  });
  it('Auvergne-Rhône-Alpes, ODF : 287 921 + 636 295 €', () => {
    expect(refs('odf', '69').reg!.tot).toBe(287921 + 636295);
    expect(refs('odf', '69').region).toBe('84');
  });
  it('secret statistique : stomatologues de la Drôme non publiés', () => {
    expect(stat('dep', '26', 'stomato')?.tot ?? null).toBeNull();
  });
});

describe('comparaisons', () => {
  it('honoraires comparables : 400 000 € dont 20 % hors nomenclature → 320 000 €', () => {
    expect(comparable(400000, 0.2)).toBe(320000);
    expect(comparable(400000, 1.5)).toBe(0);
    expect(comparable(-5, 0)).toBe(0);
  });
  it('écart à la moyenne du Rhône : 320 000 / 281 898 − 1 = 13,5 %', () => {
    const g = gap(320000, 281898)!;
    expect(g.diff).toBe(38102); expect(g.ratio).toBeCloseTo(0.13516, 4); expect(g.above).toBe(true);
    expect(gap(1, null)).toBeNull();
  });
  it('300 000 € dépassent la moyenne omnipraticien de 34 départements sur 101', () => {
    expect(depsBelow('omni', 300000)).toEqual({ below: 34, total: 101 });
  });
  it('Rhône : 83e moyenne omnipraticien sur 101', () => {
    expect(depRank('omni', '69')).toEqual({ rank: 83, total: 101 });
  });
  it('part des dépassements en France (omni) : 138 030 / 302 480', () => {
    expect(depShare(stat('fr', null, 'omni'))).toBeCloseTo(138030 / 302480, 6);
  });
  it('évolution 2019-2025 et effectifs sur cinq ans', () => {
    const s = stat('fr', null, 'omni')!;
    expect(growth(s, 2019, 2025)).toBeCloseTo(s.hist['2025'] / s.hist['2019'] - 1, 9);
    expect(effGrowth(s)).toBeCloseTo(38065 / 35072 - 1, 6);
  });
});
