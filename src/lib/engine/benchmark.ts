/**
 * Comparaison des honoraires d'un cabinet avec les moyennes officielles (RECETTE §17).
 * Fonctions pures, testées dans `benchmark.test.ts`.
 *
 * Ce que la source permet, et rien de plus : l'Assurance Maladie publie des MOYENNES par
 * praticien actif à part entière, par spécialité et par territoire, pas de distribution.
 * On ne calcule donc pas de percentile : on situe la saisie par rapport aux moyennes
 * (écart en euros et en %), et on compte les départements dont la moyenne est inférieure
 * à la saisie (une comparaison entre moyennes départementales, présentée comme telle).
 */
import { DEP_CODES, DEPS, FR, regionOf, stat, type Spec, type Stat } from './data';

export interface Gap { ref: number; value: number; diff: number; ratio: number; above: boolean }

/** Écart entre une valeur et une référence. null si la référence est couverte par le secret. */
export function gap(value: number, ref: number | null | undefined): Gap | null {
  if (!ref || ref <= 0) return null;
  return { ref, value, diff: value - ref, ratio: value / ref - 1, above: value >= ref };
}

/**
 * Honoraires comparables à ceux de l'Assurance Maladie : la part des recettes qui n'est pas
 * facturée dans le système d'information de l'Assurance Maladie (actes hors nomenclature non
 * remboursables) est retirée, sinon on comparerait deux périmètres différents.
 */
export function comparable(recettes: number, partHorsNomenclature: number): number {
  const p = Math.min(Math.max(partHorsNomenclature, 0), 1);
  return Math.max(recettes, 0) * (1 - p);
}

export interface Refs { dep: Stat | null; reg: Stat | null; fr: Stat | null; region: string | null }
export function refs(spec: Spec, dep: string): Refs {
  const region = regionOf(dep);
  return { dep: stat('dep', dep, spec), reg: stat('reg', region, spec), fr: stat('fr', null, spec), region };
}

/** Nombre de départements (avec une moyenne publiée) dont la moyenne est inférieure à `value`. */
export function depsBelow(spec: Spec, value: number): { below: number; total: number } {
  let below = 0, total = 0;
  for (const c of DEP_CODES) {
    const t = DEPS[c].p[spec]?.tot;
    if (!t) continue;
    total++;
    if (t < value) below++;
  }
  return { below, total };
}

/** Rang (1 = moyenne la plus élevée) d'un département parmi ceux qui ont une moyenne publiée. */
export function depRank(spec: Spec, dep: string): { rank: number; total: number } | null {
  const own = DEPS[dep]?.p[spec]?.tot;
  if (!own) return null;
  const all = DEP_CODES.map((c) => DEPS[c].p[spec]?.tot).filter((x): x is number => !!x);
  return { rank: all.filter((x) => x > own).length + 1, total: all.length };
}

/** Part des dépassements dans les honoraires totaux (prothèse, ODF, actes à entente directe). */
export const depShare = (s: Stat | null) => (s?.tot && s.dep != null ? s.dep / s.tot : null);

/** Évolution des honoraires moyens entre deux années, en fraction. */
export function growth(s: Stat | null, from: number, to: number): number | null {
  const a = s?.hist[String(from)], b = s?.hist[String(to)];
  return a && b ? b / a - 1 : null;
}

/** Évolution des effectifs sur cinq ans, en fraction. */
export const effGrowth = (s: Stat | null) => (s?.eff && s.eff5 ? s.eff / s.eff5 - 1 : null);

export { FR };

/** Coefficient de corrélation de Pearson. */
export function pearson(xs: number[], ys: number[]): number {
  const n = xs.length; const mx = xs.reduce((a, b) => a + b, 0) / n; const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  return sxy / Math.sqrt(sxx * syy);
}
/** Départements de métropole (hors outre-mer), où densité et honoraires se comparent sur le même marché. */
export const METRO = DEP_CODES.filter((c) => c.length === 2);
/** Corrélation densité ↔ honoraires moyens d'une spécialité, sur la métropole. */
export function densiteHonoraires(spec: Spec): { r: number; n: number } {
  const pts = METRO.map((c) => DEPS[c].p[spec]).filter((s): s is Stat => !!s?.tot && !!s.dens);
  return { r: pearson(pts.map((s) => s.dens!), pts.map((s) => s.tot!)), n: pts.length };
}
/** Départements triés par honoraires moyens décroissants (moyenne publiée seulement). */
export function classement(spec: Spec): Array<{ code: string; tot: number }> {
  return DEP_CODES.map((c) => ({ code: c, tot: DEPS[c].p[spec]?.tot ?? 0 })).filter((x) => x.tot > 0).sort((a, b) => b.tot - a.tot);
}
