/** Moteur du diagnostic de l'accueil (lib/engine/diagnostic.ts) : repères, notes, gains, déblocage. */
import { describe, expect, it } from 'vitest';
import {
  ACTES, AXES, AXE_ETAPE, diagnostic, gainTotal, heuresAn, indicateurs, noteGlobale, notes, priorites, refCA, refHoraire, verdict, depsCompares, delaiMedianPublie,
  type DiagInput,
} from '../src/lib/engine/diagnostic';
import { FR, DEP_CODES, stat } from '../src/lib/engine/data';
import { P } from '../src/lib/engine/params';

const base: DiagInput = {
  exercice: 'omni', dep: '75', ca: 300_000, fauteuils: 2, jours: 4.5, heures: 7, semaines: 45, etp: 1.5, loyer: 2500,
  lapins: 'un', delai: 'deux', actes: ['fauteuil', 'sterilisation', 'accueil'],
};
const H = P.diagnostic;

describe('repères', () => {
  it('moyenne du département quand elle est publiée, sinon région, sinon France', () => {
    const r = refCA('omni', '75')!;
    expect(r.level).toBe('dep');
    expect(r.value).toBe(stat('dep', '75', 'omni')!.tot);
    for (const c of DEP_CODES) { const x = refCA('omni', c); expect(x).not.toBeNull(); expect(x!.value).toBeGreaterThan(0); }
    for (const c of DEP_CODES) { const x = refCA('odf', c); if (x && x.level === 'fr') expect(x.value).toBe(FR.p.odf!.tot); }
  });
  it('tous les départements ont un repère omnipraticien', () => {
    expect(depsCompares('omni')).toBeGreaterThan(90);
  });
  it('repère horaire = honoraires ÷ heures publiées (ORS)', () => {
    expect(refHoraire({ value: 197_900, level: 'fr' })).toBeCloseTo(197_900 / P.temps_travail.heures_an, 6);
    expect(refHoraire(null)).toBeNull();
  });
  it('délai médian DREES lu dans les paramètres', () => {
    expect(delaiMedianPublie()).toBe(P.delais_rdv.dentiste_median_jours);
  });
});

describe('indicateurs', () => {
  const x = indicateurs(base);
  it('heures, chiffre horaire, par fauteuil, loyer', () => {
    expect(heuresAn(base)).toBeCloseTo(4.5 * 7 * 45, 6);
    expect(x.caHoraire).toBeCloseTo(300_000 / (4.5 * 7 * 45), 6);
    expect(x.caFauteuil).toBe(150_000);
    expect(x.partLoyer).toBeCloseTo(30_000 / 300_000, 6);
  });
  it('rendez-vous manqués rapportés aux créneaux de la journée', () => {
    expect(x.tauxLapins).toBeCloseTo(1 / ((7 * 60) / H.duree_rdv_min), 6);
  });
  it('chiffre d’affaires nul ou heures nulles : aucune division par zéro', () => {
    const z = indicateurs({ ...base, ca: 0, heures: 0, fauteuils: 0 });
    expect(z.caHoraire).toBeNull(); expect(z.caFauteuil).toBeNull(); expect(z.partLoyer).toBeNull(); expect(z.tauxLapins).toBeNull();
    expect(Number.isFinite(z.benefice)).toBe(true);
  });
  it('bénéfice : référence UNASA, loyer et personnel remplacés par ceux du cabinet', () => {
    const plusCher = indicateurs({ ...base, loyer: base.loyer + 1000 });
    expect(x.benefice - plusCher.benefice).toBeCloseTo(12_000, 6);
  });
});

describe('notes', () => {
  it('bornées entre 5 et 95, 50 au repère', () => {
    const x = indicateurs(base);
    const ref = x.ref!.value;
    const n = notes({ ...base, ca: ref }, indicateurs({ ...base, ca: ref }));
    expect(n.production).toBe(50);
    for (const ca of [0.01, 1e7]) {
      const v = notes({ ...base, ca }, indicateurs({ ...base, ca }));
      for (const a of AXES) if (v[a] != null) { expect(v[a]!).toBeGreaterThanOrEqual(5); expect(v[a]!).toBeLessThanOrEqual(95); }
    }
  });
  it('plus de rendez-vous manqués ou un délai plus long font baisser l’organisation', () => {
    const o = (i: DiagInput) => notes(i, indicateurs(i)).organisation!;
    expect(o({ ...base, lapins: 'trois' })).toBeLessThan(o({ ...base, lapins: 'jamais' }));
    expect(o({ ...base, delai: 'plus' })).toBeLessThan(o({ ...base, delai: 'semaine' }));
  });
  it('la délégation ne compte qu’une fois l’étape 4 validée', () => {
    const peu = { ...base, actes: [] as DiagInput['actes'] }, tout = { ...base, actes: [...ACTES] };
    expect(notes(tout, indicateurs(tout), 3).equipe).toBe(notes(peu, indicateurs(peu), 3).equipe);
    expect(notes(tout, indicateurs(tout), 4).equipe!).toBeGreaterThan(notes(peu, indicateurs(peu), 4).equipe!);
  });
  it('note globale : seulement les axes débloqués', () => {
    const n = { production: 80, rendement: 60, charges: 20, equipe: 20, organisation: 20 };
    expect(noteGlobale(n, 0)).toBeNull();
    expect(noteGlobale(n, 2)).toBe(70);
    expect(noteGlobale(n, 4)).toBe(40);
    expect(AXE_ETAPE.organisation).toBe(4);
  });
});

describe('priorités et gains', () => {
  it('rien avant les étapes qui les débloquent', () => {
    expect(priorites(base, indicateurs(base), 1)).toEqual([]);
    expect(priorites(base, indicateurs(base), 3).some((p) => p.id === 'lapins')).toBe(false);
  });
  it('rendez-vous manqués : un tiers de la production perdue', () => {
    const x = indicateurs(base);
    const p = priorites(base, x, 4).find((q) => q.id === 'lapins')!;
    const perdu = 1 * 4.5 * 45 * (H.duree_rdv_min / 60) * x.caHoraire!;
    expect(p.data.perdu).toBeCloseTo(perdu, 6);
  });
  it('total plafonné à une part du chiffre d’affaires', () => {
    const lourd: DiagInput = { ...base, ca: 120_000, loyer: 9000, lapins: 'trois', actes: [] };
    const p = priorites(lourd, indicateurs(lourd), 4);
    expect(gainTotal(p)).toBeLessThanOrEqual(lourd.ca * H.plafond_gain_ca + 1e-6);
  });
  it('triées par gain, « garder le cap » seulement quand rien ne ressort', () => {
    const p = priorites(base, indicateurs(base), 4);
    for (let i = 1; i < p.length; i++) expect((p[i - 1].gain ?? -1) >= (p[i].gain ?? -1)).toBe(true);
    const parfait: DiagInput = { ...base, ca: 2_000_000, loyer: 0, lapins: 'jamais', delai: 'semaine', actes: [...ACTES], fauteuils: 2 };
    expect(priorites(parfait, indicateurs(parfait), 4).map((q) => q.id)).toEqual(['cap']);
  });
  it('diagnostic complet cohérent', () => {
    const d = diagnostic(base, 4);
    expect(d.note).not.toBeNull();
    expect(d.priorites.length).toBeGreaterThan(0);
  });
});

describe('verdict', () => {
  it('au-dessus, dans la moyenne, en dessous, sans repère', () => {
    expect(verdict(110, 100)).toBe('bon'); expect(verdict(100, 100)).toBe('moyen'); expect(verdict(80, 100)).toBe('faible');
    expect(verdict(50, null)).toBe('neutre');
    expect(verdict(5, 10, false)).toBe('bon'); expect(verdict(20, 10, false)).toBe('faible'); expect(verdict(0, 10, false)).toBe('bon');
  });
});
