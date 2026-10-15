/** Cas recalculés à la main depuis les sources (UNASA 2024, DREES 2021, Urssaf 2026, CGI art. 219). */
import { describe, expect, it } from 'vitest';
import { reference, rangRevenu } from './references';
import { cabinet, totalCharges } from './cabinet';
import { coefRgdu, coutEmployeur, tauxPatronal, brutMinimal } from './employeur';
import { impotSocietes, distribution } from './selarl';
import { distinctions } from './distinction';
import { gap } from './benchmark';

describe('références UNASA 2024', () => {
  it('chirurgiens-dentistes, ensemble : bénéfice 34,7 % → taux de charges 65,3 %', () => {
    const r = reference('omni');
    expect(r.taux).toBeCloseTo(0.653, 6);
    expect(r.tauxHorsCotis).toBeCloseTo(1 - 0.347 - 0.126 - 0.03, 6);
    expect(r.personnel).toBeCloseTo(0.108, 6);
    expect(r.recettes).toBe(309713); expect(r.benefice).toBe(107474); expect(r.echantillon).toBe(1969);
  });
  it('quart de recettes le plus proche : 250 000 € → 2e quart (236 480 €), bénéfice 32,9 %', () => {
    const r = reference('omni', 250000);
    expect(r.quartile).toBe(2); expect(r.taux).toBeCloseTo(0.671, 6);
  });
  it('orthodontistes : ensemble seulement (37 cabinets), bénéfice 35,5 %', () => {
    const r = reference('odf', 150000);
    expect(r.quartile).toBe(0); expect(r.taux).toBeCloseTo(0.645, 6); expect(r.fragile).toBe(true);
  });
  it('stomatologues : référence des chirurgiens-dentistes, signalée', () => {
    expect(reference('stomato').proxy).toBe(true);
  });
});

describe('position dans la distribution DREES 2021', () => {
  it('quantiles publiés exacts', () => {
    expect(rangRevenu(93700).centile).toBe(50);
    expect(rangRevenu(57500).centile).toBe(25);
    expect(rangRevenu(218700).centile).toBe(90);
  });
  it('interpolation : 119 700 € est à mi-chemin entre médiane et Q3 → 63e centile', () => {
    expect(rangRevenu(119700).centile).toBe(63);
  });
  it('hors des déciles extrêmes : rien n’est inventé', () => {
    expect(rangRevenu(20000)).toEqual({ centile: null, sous: true, au: false });
    expect(rangRevenu(300000)).toEqual({ centile: null, sous: false, au: true });
  });
});

describe('ratios du cabinet', () => {
  const base = { recettes: 300000, fauteuils: 2, salaries: 2, joursSemaine: 4, semaines: 45, charges: { personnel: 0, prothesiste: 0, fournitures: 0, loyer: 0, autres: 0 }, cotisationsPerso: 0 };
  it('sans charges saisies : estimation au taux de référence', () => {
    const c = cabinet(base, 0.653);
    expect(c.chargesEstimees).toBe(true); expect(c.benefice).toBeCloseTo(104100, 6);
    expect(c.parFauteuil).toBe(150000); expect(c.joursAn).toBe(180); expect(c.parJour).toBeCloseTo(1666.67, 2); expect(c.parSalarie).toBe(150000);
  });
  it('charges saisies : 300 000 − 150 000 − 30 000 = 120 000 €', () => {
    const c = cabinet({ ...base, charges: { personnel: 40000, prothesiste: 50000, fournitures: 20000, loyer: 15000, autres: 25000 }, cotisationsPerso: 30000 }, 0.653);
    expect(totalCharges({ personnel: 40000, prothesiste: 50000, fournitures: 20000, loyer: 15000, autres: 25000 })).toBe(150000);
    expect(c.chargesEstimees).toBe(false); expect(c.benefice).toBe(120000); expect(c.tauxCharges).toBeCloseTo(0.6, 9);
    expect(c.partPersonnel).toBeCloseTo(40000 / 300000, 9); expect(c.partProthese).toBeCloseTo(50000 / 300000, 9);
  });
  it('aucun fauteuil ou salarié : ratio absent, pas de division par zéro', () => {
    const c = cabinet({ ...base, fauteuils: 0, salaries: 0, joursSemaine: 0 }, 0.6);
    expect(c.parFauteuil).toBeNull(); expect(c.parSalarie).toBeNull(); expect(c.parJour).toBeNull();
  });
});

describe('coût employeur 2026', () => {
  it('somme des taux patronaux retenus : 41,306 %', () => {
    expect(tauxPatronal).toBeCloseTo(0.41306, 6);
  });
  it('exemple Urssaf : 2 000 € brut en juin 2026, 50 salariés ou plus → coefficient 0,3178', () => {
    expect(coefRgdu(2000, { cinquanteEtPlus: true })).toBeCloseTo(0.3178, 4);
  });
  it('au-delà de 2,9293 Smic : plus de réduction', () => {
    expect(coefRgdu(2.93 * 1867.02)).toBe(0);
  });
  it('assistant(e) dentaire au minimum conventionnel : 13,93 € × 151,67 h', () => {
    const b = brutMinimal('assistant_dentaire');
    expect(b).toBeCloseTo(2112.76, 2);
    const c = coutEmployeur(b);
    expect(c.cout).toBeCloseTo(b * (1 + 0.41306 - c.coefRgdu), 6);
  });
  it('emploi conventionnel sous le Smic : le Smic s’applique (réceptionniste 12,02 € < 12,31 €)', () => {
    expect(brutMinimal('receptionniste')).toBeCloseTo(12.31 * 151.67, 6);
  });
});

describe('SELARL : IS et dividendes 2026', () => {
  it('IS : 15 % jusqu’à 42 500 €, 25 % au-delà', () => {
    expect(impotSocietes(42500)).toBeCloseTo(6375, 6);
    expect(impotSocietes(100000)).toBeCloseTo(6375 + 57500 * 0.25, 6);
    expect(impotSocietes(100000, false)).toBe(25000);
  });
  it('dividendes : 12,8 % sur tout, 18,6 % sur la part ≤ 10 % du capital', () => {
    const d = distribution(100000, 50000);
    expect(d.distribuable).toBeCloseTo(100000 - 20750, 6);
    expect(d.ir).toBeCloseTo(79250 * 0.128, 6);
    expect(d.ps).toBeCloseTo(5000 * 0.186, 6);
    expect(d.horsPs).toBeCloseTo(74250, 6);
  });
});

describe('ce qui vous distingue', () => {
  const cab = cabinet({ recettes: 300000, fauteuils: 2, salaries: 2, joursSemaine: 4, semaines: 45, charges: { personnel: 60000, prothesiste: 0, fournitures: 0, loyer: 0, autres: 90000 }, cotisationsPerso: 0 }, 0.653);
  it('écart de 15 % au-dessus de la moyenne → point fort ; écart de 5 % → rien', () => {
    const base = { spec: 'omni' as const, gFr: null, cab, tauxRef: 0.497, refPersonnel: 0.108, patients: 0, refPatients: 837, parPatient: null, refParPatient: null, depPart: 0, refDepPart: 0.45, hn: 0 };
    const fort = distinctions({ ...base, gDep: gap(345000, 300000) });
    expect(fort.find((p) => p.code === 'hono-haut')?.kind).toBe('fort');
    const neutre = distinctions({ ...base, gDep: gap(315000, 300000) });
    expect(neutre.some((p) => p.code.startsWith('hono'))).toBe(false);
    expect(fort.some((p) => p.code === 'personnel-haut')).toBe(true);
  });
});

describe('coût employeur : jamais sous le brut au Smic', () => {
  it('au Smic, cotisations 41,306 % > coefficient maximal 39,81 % : coût ≥ brut', () => {
    const c = coutEmployeur(1867.02);
    expect(c.coefRgdu).toBeLessThanOrEqual(0.3981);
    expect(c.cout).toBeGreaterThan(c.brut);
  });
});
