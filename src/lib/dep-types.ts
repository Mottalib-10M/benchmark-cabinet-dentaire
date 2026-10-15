/**
 * Texte rédigé d'une page département : UN fichier `src/content/departements/<code>.ts` par page.
 * Le reste de la page (titre, chiffres clés, tableau, FAQ générée, simulateur) se calcule depuis
 * le jeu de données Ameli. Les nombres du texte s'écrivent par les outils `h`, jamais à la main :
 * ils suivent le jeu de données à chaque mise à jour annuelle.
 */
import type { Stat } from './engine/data';

export interface DepHelpers {
  lang: 'fr' | 'en';
  /** Statistiques du département, de sa région et de la France, par spécialité. */
  D: { omni: Stat; odf?: Stat; stomato?: Stat; ensemble: Stat };
  R: { omni?: Stat; odf?: Stat; stomato?: Stat; ensemble?: Stat };
  F: { omni: Stat; odf: Stat; stomato: Stat; ensemble: Stat };
  /** Nom de la région. */
  region: string;
  /** Rang (1 = moyenne la plus haute) parmi les départements publiés. */
  rang: (spec: 'omni' | 'odf' | 'stomato') => { rank: number; total: number } | null;
  eur: (n: number | null | undefined) => string;
  num: (n: number | null | undefined, decimals?: number) => string;
  /** Fraction → pourcentage (0,192 → « 19 % » ; decimals = 0 par défaut). */
  pct: (x: number | null | undefined, decimals?: number) => string;
  /** Écart relatif a/b − 1, signé, en pourcentage (« +12 % », « −8 % »). */
  ecart: (a: number | null | undefined, b: number | null | undefined) => string;
  /** Lien interne vers une page du site par son identifiant (guides, spécialités, dep-xx). */
  a: (id: string, text: string) => string;
}

export interface DepText {
  /** 2 ou 3 sections rédigées (`<h2>` + paragraphes), 380 mots au moins, propres au département. */
  body: (h: DepHelpers) => string;
}
export interface DepDef { code: string; fr: DepText; en: DepText }
export const defineDep = (d: DepDef): DepDef => d;
