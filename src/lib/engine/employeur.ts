/**
 * Coût employeur d'un salarié de cabinet dentaire en 2026 : salaire brut + cotisations patronales −
 * réduction générale dégressive unique (RGDU). Taux de l'Urssaf (params-2026.json > employeur_2026).
 * Hors taux AT-MP notifié et hors prévoyance et mutuelle de branche : le résultat est un plancher.
 * Testé dans `employeur.test.ts` sur l'exemple publié par l'Urssaf.
 */
import { P } from './params';
const E = P.employeur_2026;
const S = P.salaires_2026;

/** Somme des taux patronaux sur un salaire sous le plafond de la sécurité sociale. */
export const tauxPatronal = Object.values(E.taux).reduce((a, b) => a + b, 0);

/**
 * Coefficient RGDU (Urssaf) : Tmin + Tdelta × [½ × (seuil × Smic ÷ rémunération − 1)]^P, nul quand la
 * rémunération atteint seuil × Smic. Calcul annuel ramené au mois (rapport identique).
 */
export function coefRgdu(brutMensuel: number, opts: { cinquanteEtPlus?: boolean; heuresMois?: number } = {}): number {
  const R = E.rgdu;
  const tdelta = opts.cinquanteEtPlus ? R.tdelta_50_plus : R.tdelta_moins_50;
  // Smic de référence proratisé au temps de travail (temps partiel : la même proportion de Smic).
  const smic = S.smic_mensuel * ((opts.heuresMois ?? S.heures_mois) / S.heures_mois);
  if (brutMensuel <= 0) return 0;
  const x = 0.5 * ((R.seuil_smic * smic) / brutMensuel - 1);
  if (x <= 0) return 0;
  return Math.min(R.tmin + tdelta, R.tmin + tdelta * Math.pow(x, R.p));
}

export interface CoutEmployeur { brut: number; cotisations: number; rgdu: number; cout: number; coutAnnuel: number; coefRgdu: number }
export function coutEmployeur(brutMensuel: number, heuresMois: number = S.heures_mois): CoutEmployeur {
  const brut = Math.max(0, brutMensuel);
  const cotisations = brut * tauxPatronal;
  const c = coefRgdu(brut, { heuresMois });
  const rgdu = brut * c;
  const cout = brut + cotisations - rgdu;
  return { brut, cotisations, rgdu, cout, coutAnnuel: cout * 12, coefRgdu: c };
}

/** Salaire brut mensuel au minimum conventionnel, jamais sous le Smic horaire. */
export function brutMinimal(emploi: keyof typeof S.horaire, heuresMois: number = S.heures_mois): number {
  return Math.max(S.horaire[emploi], S.smic_horaire) * heuresMois;
}
