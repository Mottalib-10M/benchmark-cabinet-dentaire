/**
 * Suivi mensuel du cabinet et devis : fonctions pures des mini-simulateurs « tableau de bord » et
 * « devis acceptés ». Les entrées sont les chiffres du cabinet ; aucune n'est une statistique publique.
 */
import { FR } from './data';
import { refHoraire } from './diagnostic';

export interface MoisCabinet {
  /** Chiffre d'affaires du mois, en euros. */
  ca: number;
  /** Heures passées au fauteuil dans le mois. */
  heures: number;
  /** Rendez-vous inscrits à l'agenda dans le mois. */
  prevus: number;
  /** Rendez-vous non honorés sans prévenir. */
  manques: number;
  /** Premiers rendez-vous de nouveaux patients. */
  nouveaux: number;
}

export interface Tableau {
  caHoraire: number | null;
  honores: number;
  tauxAbsence: number | null;
  caParRdv: number | null;
  partNouveaux: number | null;
}

export function tableauBord(m: MoisCabinet): Tableau {
  const ca = Math.max(0, m.ca), h = Math.max(0, m.heures), p = Math.max(0, m.prevus);
  const manques = Math.min(p, Math.max(0, m.manques));
  const honores = p - manques;
  return {
    caHoraire: h > 0 ? ca / h : null,
    honores,
    tauxAbsence: p > 0 ? manques / p : null,
    caParRdv: honores > 0 ? ca / honores : null,
    partNouveaux: honores > 0 ? Math.min(1, Math.max(0, m.nouveaux) / honores) : null,
  };
}

/** Repère horaire national : honoraires moyens Ameli d'un omnipraticien / heures de travail publiées (ORS 2015). */
export const repereHoraireNational = (): number | null => {
  const v = FR.p.omni?.tot;
  return v ? refHoraire({ value: v, level: 'fr' }) : null;
};

export interface Devis {
  /** Devis de prothèse ou d'orthodontie remis par mois. */
  parMois: number;
  /** Part des devis signés, de 0 à 1. */
  taux: number;
  /** Montant moyen d'un devis, en euros. */
  montant: number;
  /** Mois d'activité dans l'année. */
  mois: number;
}

export interface DevisOut { signesAn: number; productionAn: number; gainParPoints: number; productionPlus: number }

/** Production signée sur l'année et effet d'une hausse du taux d'acceptation de `points` (0,10 = 10 points). */
export function devisAnnuel(d: Devis, points = 0.1): DevisOut {
  const n = Math.max(0, d.parMois) * Math.max(0, d.mois);
  const t = Math.min(1, Math.max(0, d.taux));
  const m = Math.max(0, d.montant);
  const tPlus = Math.min(1, t + points);
  const productionAn = n * t * m;
  const productionPlus = n * tPlus * m;
  return { signesAn: n * t, productionAn, productionPlus, gainParPoints: productionPlus - productionAn };
}
