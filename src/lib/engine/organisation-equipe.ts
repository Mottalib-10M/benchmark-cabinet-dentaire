/**
 * Équipe et collaboration : temps de fauteuil libéré par la délégation à l'assistant dentaire, et
 * redevance d'un collaborateur libéral. Fonctions pures, testées dans `tests/organisation-equipe.test.ts`.
 *
 * Repères publics : coût employeur au minimum de la convention collective (IDCC 1619, accord salaires
 * 2026) via `employeur.ts`, temps de travail publié (`P.temps_travail`). Hypothèse de Dentimètre,
 * publiée sur la page Méthode : la part du temps libéré qui redevient de la production
 * (`P.diagnostic.part_convertie_temps`). Aucun taux de redevance officiel n'existe : il est saisi.
 */
import { P } from './params';
import { FR } from './data';
import { brutMinimal, coutEmployeur } from './employeur';

const S = P.salaires_2026;

/** Cadre de la profession d'assistant dentaire, tel qu'écrit dans les textes (sources dans params > sources). */
export const CADRE_ASSISTANT = {
  /** Arrêté du 8 juin 2018, art. 10 : durée de la formation et volumes horaires. */
  formationMois: 18, formationTheorieH: 343, formationPratiqueH: 1535,
  /** Art. R4393-8 du Code de la santé publique : nombre d'activités listées. */
  activitesR4393_8: 7,
  /** Convention collective IDCC 1619, annexe I : formation continue en stérilisation. */
  sterilisationTousLesAns: 5, sterilisationHeures: 7,
  /** Arrêté du 8 juin 2018, art. 4 : âge minimal d'entrée en formation. */
  ageMinimal: 18,
} as const;

/** Coût employeur annuel d'un assistant dentaire au minimum conventionnel, pour une part de temps plein. */
export function coutAssistantAnnuel(partTempsPlein = 1): number {
  const h = S.heures_mois * Math.max(0, partTempsPlein);
  if (h <= 0) return 0;
  return coutEmployeur(brutMinimal('assistant_dentaire', h), h).coutAnnuel;
}

/** Chiffre d'affaires horaire de repère : moyenne Ameli d'un omnipraticien ÷ temps de travail publié. */
export function caHoraireRepere(): number | null {
  const t = P.temps_travail?.heures_an; const ca = FR.p.omni?.tot;
  return t && ca ? ca / t : null;
}

export interface Delegation { heuresAn: number; production: number; coutMiTemps: number; solde: number; part: number }
/**
 * Heures de fauteuil libérées quand le praticien cesse de faire lui-même `taches` tâches de `minutes`
 * minutes par jour, et leur valeur si une part `part` redevient de la production.
 */
export function tempsDelegue(i: { taches: number; minutes: number; jours: number; semaines: number; caHoraire: number }, part: number = P.diagnostic.part_convertie_temps): Delegation {
  const pos = (x: number) => Math.max(0, Number.isFinite(x) ? x : 0);
  const heuresAn = (pos(i.taches) * pos(i.minutes) / 60) * pos(i.jours) * pos(i.semaines);
  const production = heuresAn * pos(i.caHoraire) * part;
  const coutMiTemps = coutAssistantAnnuel(0.5);
  return { heuresAn, production, coutMiTemps, solde: production - coutMiTemps, part };
}

export interface Redevance { redevance: number; reste: number; couverture: number | null; solde: number }
/** Redevance d'un collaborateur libéral : `taux` (fraction) des honoraires qu'il encaisse, comparée aux charges du fauteuil. */
export function redevance(i: { honoraires: number; taux: number; chargesFauteuil: number }): Redevance {
  const h = Math.max(0, i.honoraires), t = Math.min(1, Math.max(0, i.taux)), c = Math.max(0, i.chargesFauteuil);
  const r = h * t;
  return { redevance: r, reste: h - r, couverture: c > 0 ? r / c : null, solde: r - c };
}

/** Taux qui couvre exactement les charges du fauteuil (null sans honoraires). */
export const tauxPointMort = (honoraires: number, chargesFauteuil: number): number | null => (honoraires > 0 ? Math.max(0, chargesFauteuil) / honoraires : null);
