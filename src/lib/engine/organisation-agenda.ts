/**
 * Agenda du cabinet : coût des rendez-vous manqués et délai d'attente d'un nouveau patient.
 * Fonctions pures, testées dans tests/organisation-agenda.test.ts. Les hypothèses (durée d'un
 * rendez-vous, part récupérable) viennent de params-2026.json > diagnostic : ce sont des choix de
 * Dentimètre, publiés sur la page Méthode, pas des statistiques.
 */
import { P } from './params';

const H = P.diagnostic;

export interface LapinsInput {
  /** Patients absents sans prévenir, par jour travaillé. */
  absJour: number;
  joursSemaine: number;
  semaines: number;
  /** Chiffre d'affaires annuel, en euros. */
  ca: number;
  /** Heures au fauteuil par jour. */
  heuresJour: number;
  /** Durée moyenne d'un rendez-vous, en minutes. */
  dureeMin?: number;
}

export interface LapinsOut {
  rdvParAn: number;
  heuresAn: number;
  caHoraire: number | null;
  valeurRdv: number | null;
  perdu: number;
  recuperable: number;
  /** Part des rendez-vous de la journée qui ne sont pas honorés (null si la journée est vide). */
  taux: number | null;
}

/** Coût annuel des rendez-vous manqués : créneaux perdus × valeur d'une demi-heure de fauteuil. */
export function coutLapins(i: LapinsInput): LapinsOut {
  const duree = i.dureeMin && i.dureeMin > 0 ? i.dureeMin : H.duree_rdv_min;
  const j = Math.max(0, i.joursSemaine), s = Math.max(0, i.semaines), h = Math.max(0, i.heuresJour), a = Math.max(0, i.absJour);
  const heuresAn = j * h * s;
  const rdvParAn = a * j * s;
  const caHoraire = heuresAn > 0 ? Math.max(0, i.ca) / heuresAn : null;
  const valeurRdv = caHoraire != null ? (caHoraire * duree) / 60 : null;
  const perdu = valeurRdv != null ? rdvParAn * valeurRdv : 0;
  const parJour = h > 0 ? (h * 60) / duree : 0;
  return { rdvParAn, heuresAn, caHoraire, valeurRdv, perdu, recuperable: perdu * H.part_recuperable_lapins, taux: parJour > 0 ? Math.min(1, a / parJour) : null };
}

export interface FileInput {
  /** Nouveaux patients qui demandent un rendez-vous, par semaine. */
  demandes: number;
  /** Créneaux réservés aux nouveaux patients, par semaine. */
  creneaux: number;
  /** Nouveaux patients déjà en attente d'un premier rendez-vous. */
  file: number;
}

export interface FileOut {
  /** Délai estimé du premier rendez-vous, en jours calendaires (loi de Little : file ÷ débit). */
  delaiJours: number | null;
  /** Variation de la file par semaine (positive : elle s'allonge). */
  variation: number;
  /** Semaines pour vider la file si le débit dépasse la demande (null sinon). */
  semainesResorption: number | null;
  /** Créneaux hebdomadaires qu'il faudrait pour tenir le délai cible avec la file actuelle. */
  creneauxPourCible: (cibleJours: number) => number;
}

/** Délai d'attente d'un nouveau patient d'après la file et le nombre de créneaux qui lui sont ouverts. */
export function delaiFile(i: FileInput): FileOut {
  const c = Math.max(0, i.creneaux), d = Math.max(0, i.demandes), f = Math.max(0, i.file);
  const delaiJours = c > 0 ? (f / c) * 7 : null;
  const variation = d - c;
  const semainesResorption = c > d ? f / (c - d) : f === 0 ? 0 : null;
  return { delaiJours, variation, semainesResorption, creneauxPourCible: (t) => (t > 0 ? Math.max(d, (f * 7) / t) : Infinity) };
}

/** Délai médian publié par la DREES pour un rendez-vous chez le chirurgien-dentiste (jours). */
export const DELAI_MEDIAN = P.delais_rdv.dentiste_median_jours;
