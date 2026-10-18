/**
 * Diagnostic d'un cabinet dentaire en quatre étapes : indicateurs, notes par axe, gains possibles et
 * priorités. Fonctions pures, testées dans `diagnostic.test.ts`.
 *
 * Deux sortes de nombres, jamais mélangées :
 *  - les REPÈRES viennent de sources publiques datées : honoraires moyens Assurance Maladie (ameli.json),
 *    comptes UNASA (unasa.json), délais DREES et coût salarial de la convention collective
 *    (params-2026.json). Un repère sans source n'existe pas : la valeur vaut null et l'écran le dit ;
 *  - les HYPOTHÈSES de calcul (durée d'un rendez-vous, part récupérable d'un créneau perdu…) sont des
 *    choix de Dentimètre, regroupés dans params-2026.json > diagnostic et publiés sur la page Méthode.
 * Les notes sont des lectures de ces écarts sur une échelle de 0 à 100 où 50 = le repère.
 */
import { DEP_CODES, DEPS, regionOf, stat, type Spec } from './data';
import { reference, type Ref } from './references';
import { brutMinimal, coutEmployeur } from './employeur';
import { P } from './params';

export type Exercice = 'omni' | 'odf' | 'implanto';
export const EXERCICES: Exercice[] = ['omni', 'odf', 'implanto'];
export type Lapins = 'jamais' | 'un' | 'deux' | 'trois';
export const LAPINS: Lapins[] = ['jamais', 'un', 'deux', 'trois'];
export type Delai = 'semaine' | 'deux' | 'mois' | 'plus';
export const DELAIS: Delai[] = ['semaine', 'deux', 'mois', 'plus'];
/** Les activités de l'assistant dentaire listées à l'article R4393-8 du Code de la santé publique (regroupées). */
export const ACTES = ['fauteuil', 'sterilisation', 'education', 'accueil', 'dossier'] as const;
export type Acte = (typeof ACTES)[number];

export interface DiagInput {
  exercice: Exercice;
  dep: string;
  /** Chiffre d'affaires personnel de l'année, en euros. */
  ca: number;
  fauteuils: number;
  jours: number;
  heures: number;
  semaines: number;
  /** Assistantes et secrétaire, en équivalent temps plein. */
  etp: number;
  /** Loyer mensuel, charges locatives comprises ; 0 si propriétaire des murs. */
  loyer: number;
  lapins: Lapins | null;
  delai: Delai | null;
  actes: Acte[];
}

const H = P.diagnostic;

/** Spécialité de comparaison : l'omnipraticien orienté implantologie se compare aux omnipraticiens. */
export const specOf = (e: Exercice): Spec => (e === 'odf' ? 'odf' : 'omni');

/** Départements dont la moyenne est publiée pour la spécialité. */
export const depsCompares = (s: Spec = 'omni') => DEP_CODES.filter((c) => !!DEPS[c].p[s]?.tot).length;

export interface RefCA { value: number; level: 'dep' | 'reg' | 'fr' }
/** Moyenne Ameli de la spécialité : département, sinon région, sinon France (secret statistique). */
export function refCA(s: Spec, dep: string): RefCA | null {
  const d = stat('dep', dep, s)?.tot;
  if (d) return { value: d, level: 'dep' };
  const r = stat('reg', regionOf(dep), s)?.tot;
  if (r) return { value: r, level: 'reg' };
  const f = stat('fr', null, s)?.tot;
  return f ? { value: f, level: 'fr' } : null;
}

/** Heures passées au fauteuil dans l'année. */
export const heuresAn = (i: Pick<DiagInput, 'jours' | 'heures' | 'semaines'>) => Math.max(0, i.jours) * Math.max(0, i.heures) * Math.max(0, i.semaines);
export const joursAn = (i: Pick<DiagInput, 'jours' | 'semaines'>) => Math.max(0, i.jours) * Math.max(0, i.semaines);

/** Coût employeur annuel d'un temps plein au minimum conventionnel d'assistant dentaire (IDCC 1619). */
export const coutEtpMinimal = () => coutEmployeur(brutMinimal('assistant_dentaire')).coutAnnuel;

/** Repère horaire : honoraires moyens divisés par le temps de travail publié (null si aucun n'est publié). */
export function refHoraire(ref: RefCA | null): number | null {
  const t = P.temps_travail;
  if (!ref || !t || !t.heures_an) return null;
  return ref.value / t.heures_an;
}

/** Délai médian publié pour un premier rendez-vous chez un chirurgien-dentiste (jours). */
export const delaiMedianPublie = (): number | null => P.delais_rdv?.dentiste_median_jours ?? null;

export interface Indicateurs {
  spec: Spec;
  ref: RefCA | null;
  U: Ref;
  caHoraire: number | null;
  refHoraire: number | null;
  caFauteuil: number | null;
  partLoyer: number | null;
  personnelEstime: number;
  partPersonnel: number | null;
  benefice: number;
  refBenefice: number;
  lapinsJour: number | null;
  /** Part des créneaux perdus (rendez-vous manqués / créneaux de la journée). */
  tauxLapins: number | null;
  delaiJours: number | null;
  nActes: number;
}

export function indicateurs(i: DiagInput): Indicateurs {
  const spec = specOf(i.exercice);
  const ref = refCA(spec, i.dep);
  const ca = Math.max(0, i.ca);
  const U = reference(spec, ca > 0 ? ca : undefined);
  const h = heuresAn(i);
  const personnelEstime = Math.max(0, i.etp) * coutEtpMinimal();
  const loyerAn = Math.max(0, i.loyer) * 12;
  // Bénéfice : comptes UNASA du même quart de recettes, où le loyer et le personnel de la référence
  // sont remplacés par ceux du cabinet (le reste des charges suit la référence).
  const benefice = ca * (1 - U.taux) + (U.loyer * ca - loyerAn) + (U.personnel * ca - personnelEstime);
  const lapinsJour = i.lapins ? H.lapins_par_jour[i.lapins] : null;
  const creneaux = i.heures > 0 ? (i.heures * 60) / H.duree_rdv_min : 0;
  return {
    spec, ref, U,
    caHoraire: h > 0 ? ca / h : null,
    refHoraire: refHoraire(ref),
    caFauteuil: i.fauteuils > 0 ? ca / i.fauteuils : null,
    partLoyer: ca > 0 ? loyerAn / ca : null,
    personnelEstime,
    partPersonnel: ca > 0 ? personnelEstime / ca : null,
    benefice,
    refBenefice: U.benefice,
    lapinsJour,
    tauxLapins: lapinsJour != null && creneaux > 0 ? Math.min(1, lapinsJour / creneaux) : null,
    delaiJours: i.delai ? H.delai_jours[i.delai] : null,
    nActes: i.actes.length,
  };
}

/** Note bornée de 5 à 95 : ni 0 ni 100, l'outil ne voit pas tout. */
const borne = (x: number) => Math.round(Math.max(5, Math.min(95, x)));

export type AxeId = 'production' | 'rendement' | 'charges' | 'equipe' | 'organisation';
export const AXES: AxeId[] = ['production', 'rendement', 'charges', 'equipe', 'organisation'];
/** Étape qui débloque chaque axe. */
export const AXE_ETAPE: Record<AxeId, number> = { production: 2, rendement: 2, charges: 3, equipe: 3, organisation: 4 };

/**
 * Notes par axe (null = pas de repère publié pour cet axe). `valide` = nombre d'étapes terminées :
 * l'axe Équipe ne compte la délégation qu'une fois l'étape 4 remplie.
 */
export function notes(i: DiagInput, x: Indicateurs, valide = 4): Record<AxeId, number | null> {
  const production = x.ref && i.ca > 0 ? borne(50 + (i.ca / x.ref.value - 1) * 100) : null;
  // Le repère horaire compte tout le temps de travail (administratif compris) et vos heures sont des heures
  // au fauteuil : un écart favorable est en partie mécanique, il ne compte donc qu'à moitié.
  const rh = x.caHoraire != null && x.refHoraire ? x.caHoraire / x.refHoraire - 1 : null;
  const rendement = rh != null ? borne(50 + rh * (rh > 0 ? H.part_ecart_horaire_favorable : 1) * 100) : null;
  const charges = x.partLoyer != null ? borne(50 + (x.U.loyer - x.partLoyer) * 100 * H.points_par_point_loyer) : null;
  let equipe: number | null = null;
  if (x.partPersonnel != null && x.U.personnel > 0) {
    const r = x.partPersonnel / x.U.personnel;
    const ecart = r <= 0 ? H.penalite_equipe_max : Math.min(H.penalite_equipe_max, Math.abs(Math.log(r)) * H.penalite_equipe_max);
    const deleg = valide >= 4 ? (x.nActes - 2) * H.points_par_acte : 0;
    equipe = borne(50 - ecart + deleg);
  }
  let organisation: number | null = null;
  if (x.tauxLapins != null && i.delai) {
    organisation = borne(90 - x.tauxLapins * 100 * H.points_par_point_lapins - H.penalite_delai[i.delai]);
  }
  return { production, rendement, charges, equipe, organisation };
}

/** Note globale : moyenne des axes débloqués qui ont un repère. */
export function noteGlobale(n: Record<AxeId, number | null>, valide: number): number | null {
  const v = AXES.filter((a) => valide >= AXE_ETAPE[a]).map((a) => n[a]).filter((s): s is number => s != null);
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
}

export type PrioId = 'lapins' | 'production' | 'delegation' | 'loyer' | 'delai' | 'equipe' | 'fauteuil' | 'cap';
export interface Priorite { id: PrioId; gain: number | null; etape: number; data: Record<string, number> }

/**
 * Pistes chiffrées. Chaque gain applique une part prudente (params > diagnostic) à un écart calculé sur
 * les réponses : c'est un ordre de grandeur, pas une promesse. Le total est plafonné à une part du
 * chiffre d'affaires. Les pistes sans base chiffrable sortent avec gain = null.
 */
export function priorites(i: DiagInput, x: Indicateurs, valide = 4): Priorite[] {
  const out: Priorite[] = [];
  const ok = (e: number) => valide >= e;
  const ja = joursAn(i);
  if (ok(4) && x.lapinsJour != null && x.lapinsJour >= 1 && x.caHoraire != null) {
    const perdu = x.lapinsJour * ja * (H.duree_rdv_min / 60) * x.caHoraire;
    out.push({ id: 'lapins', gain: perdu * H.part_recuperable_lapins, etape: 4, data: { perdu, parAn: x.lapinsJour * ja } });
  }
  if (ok(2) && x.ref && i.ca > 0 && i.ca < x.ref.value * (1 - H.seuil_production) && i.jours >= H.jours_temps_plein) {
    const ecart = x.ref.value * (1 - H.seuil_production) - i.ca;
    out.push({ id: 'production', gain: ecart * H.part_recuperable_production, etape: 2, data: { ecart, ref: x.ref.value } });
  }
  if (ok(4) && i.etp >= 0.5 && x.caHoraire != null) {
    const manquants = ACTES.length - x.nActes;
    if (manquants >= 2) {
      const heures = manquants * H.heures_par_tache_semaine * i.semaines;
      out.push({ id: 'delegation', gain: heures * x.caHoraire * H.part_convertie_temps, etape: 4, data: { manquants, heures } });
    }
  }
  if (ok(3) && x.partLoyer != null && x.partLoyer > x.U.loyer * (1 + H.seuil_loyer)) {
    const ecart = (x.partLoyer - x.U.loyer) * i.ca;
    out.push({ id: 'loyer', gain: ecart * H.part_recuperable_loyer, etape: 3, data: { ecart } });
  }
  if (ok(3) && i.etp < 0.5) out.push({ id: 'equipe', gain: null, etape: 3, data: {} });
  if (ok(2) && i.fauteuils >= 3) out.push({ id: 'fauteuil', gain: null, etape: 2, data: { libres: i.fauteuils - 2 } });
  if (ok(4) && (i.delai === 'mois' || i.delai === 'plus')) out.push({ id: 'delai', gain: null, etape: 4, data: { jours: x.delaiJours ?? 0 } });
  // Plafond : la somme des gains ne dépasse jamais une part du chiffre d'affaires.
  const total = out.reduce((s, p) => s + (p.gain ?? 0), 0);
  const plafond = Math.max(0, i.ca) * H.plafond_gain_ca;
  if (total > plafond && total > 0) for (const p of out) if (p.gain != null) p.gain *= plafond / total;
  // Arrondi à la centaine : un ordre de grandeur, pas une précision à l'euro.
  for (const p of out) if (p.gain != null) p.gain = Math.round(p.gain / 100) * 100;
  out.sort((a, b) => (b.gain ?? -1) - (a.gain ?? -1));
  if (ok(4) && !out.length) out.push({ id: 'cap', gain: null, etape: 4, data: {} });
  return out;
}

export const gainTotal = (p: Priorite[]) => p.reduce((s, x) => s + (x.gain ?? 0), 0);

export type Verdict = 'bon' | 'moyen' | 'faible' | 'neutre';
/** Lecture d'un écart à un repère : ±tol autour du repère = « dans la moyenne ». */
export function verdict(x: number | null, rep: number | null, plusEstMieux = true, tol = 0.05): Verdict {
  if (x == null || rep == null || rep <= 0) return 'neutre';
  if (!plusEstMieux && x <= 0) return 'bon';
  const r = plusEstMieux ? x / rep : rep / x;
  return r >= 1 + tol ? 'bon' : r >= 1 - tol ? 'moyen' : 'faible';
}

/** Tout le diagnostic d'un coup, pour l'écran et pour le rapport joint à une demande d'échange. */
export function diagnostic(i: DiagInput, valide = 4) {
  const x = indicateurs(i);
  const n = notes(i, x, valide);
  return { x, notes: n, note: noteGlobale(n, valide), priorites: priorites(i, x, valide) };
}
