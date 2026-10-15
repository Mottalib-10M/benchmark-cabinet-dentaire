/**
 * Références de gestion de la profession, tirées des statistiques publiques des organismes de gestion
 * agréés (UNASA, comptes 2024 des adhérents en BNC, src/data/unasa.json) et de la distribution des
 * revenus de la DREES (params-2026.json). Testé dans `references.test.ts`.
 */
import raw from '../../data/unasa.json';
import { P } from './params';
import type { Spec } from './data';

type Table = { echantillon: number; colonnes: string[]; lignes: Record<string, Array<number | string | null>> };
const U = raw as unknown as Record<string, Table>;
export const UNASA_YEAR = 2024;
const CODE: Record<Spec, string> = { omni: '851EAA', odf: '851EAB', stomato: '851EAA' };

export interface Ref {
  /** Charges totales / recettes, cotisations personnelles et CSG déductible comprises (1 − bénéfice %). */
  taux: number;
  /** Même taux hors cotisations sociales personnelles et CSG déductible : à comparer quand elles ne sont pas saisies. */
  tauxHorsCotis: number;
  personnel: number; loyer: number; achats: number; cotisPerso: number;
  recettes: number; benefice: number; echantillon: number;
  /** 0 = ensemble des adhérents, 1 à 4 = quart de recettes le plus proche. */
  quartile: number;
  /** Vrai quand la spécialité n'a pas de statistique propre (stomatologues : référence des chirurgiens-dentistes). */
  proxy: boolean;
  /** Vrai quand l'échantillon est petit (moins de 100 cabinets). */
  fragile: boolean;
}

const v = (t: Table, row: string, i: number) => Number(t.lignes[row][i]) / 100;

/** Référence de la spécialité ; avec `recettes`, celle du quart de recettes dont la moyenne est la plus proche (omnipraticiens). */
export function reference(spec: Spec, recettes?: number): Ref {
  const t = U[`${CODE[spec]}_${UNASA_YEAR}`];
  let i = 0;
  // Les quarts ne se lisent que sur l'échantillon des chirurgiens-dentistes : 37 orthodontistes en 2024,
  // soit neuf cabinets par quart, ne font pas une référence.
  if (recettes && recettes > 0 && spec !== 'odf') {
    const m = [1, 2, 3, 4].map((q) => Number(t.lignes['Montant net des recettes'][q]));
    i = 1 + m.reduce((best, x, k) => (Math.abs(x - recettes) < Math.abs(m[best] - recettes) ? k : best), 0);
  }
  const benef = v(t, 'Bénéfice (%)', i), cotis = v(t, 'Charges sociales personnelles', i), csg = v(t, 'CSG déductible', i);
  return {
    taux: 1 - benef, tauxHorsCotis: 1 - benef - cotis - csg,
    personnel: v(t, 'Charges de personnel', i), loyer: v(t, 'Loyers et charges locatives', i), achats: v(t, 'Achats', i), cotisPerso: cotis + csg,
    recettes: Number(t.lignes['Montant net des recettes'][i]), benefice: Number(t.lignes['Bénéfice comptable'][i]),
    echantillon: t.echantillon, quartile: i, proxy: spec === 'stomato', fragile: t.echantillon < 100,
  };
}

/**
 * Position d'un revenu dans la distribution DREES des revenus d'activité des chirurgiens-dentistes
 * libéraux (D1, Q1, médiane, Q3, D9). Interpolation linéaire entre deux quantiles publiés ; hors de
 * [D1, D9], on dit seulement « moins de 10 % » ou « plus de 90 % » : rien n'est publié au-delà.
 */
export function rangRevenu(revenu: number): { centile: number | null; sous: boolean; au: boolean } {
  const q = P.revenus.drees.quantiles;
  const pts: Array<[number, number]> = [[10, q.d1], [25, q.q1], [50, q.mediane], [75, q.q3], [90, q.d9]];
  if (revenu < q.d1) return { centile: null, sous: true, au: false };
  if (revenu > q.d9) return { centile: null, sous: false, au: true };
  for (let k = 1; k < pts.length; k++) {
    const [p0, x0] = pts[k - 1], [p1, x1] = pts[k];
    if (revenu <= x1) return { centile: Math.round(p0 + ((revenu - x0) / (x1 - x0)) * (p1 - p0)), sous: false, au: false };
  }
  return { centile: 90, sous: false, au: false };
}
