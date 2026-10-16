/**
 * Pages « département » : une page par département qui compte au moins SEUIL chirurgiens-dentistes
 * libéraux (Assurance Maladie, dernière année publiée). Sous ce seuil, le département reste dans le
 * simulateur, mais il ne reçoit pas de page : la moyenne y repose sur peu de praticiens, l'orthodontie
 * et la stomatologie y sont souvent couvertes par le secret statistique (moins de 5 praticiens), et la
 * page serait surtout vide. Le texte rédigé de chaque page vit dans `src/content/departements/<code>.ts`.
 */
import { DEPS, DEP_CODES } from './engine/data';

/**
 * Seuil de publication d'une page : 510 praticiens donne 27 départements (54 pages en fr + en), dans
 * la limite de 100 pages du site (RECETTE §3, règle absolue du 2026-10-16). Les 33 départements de 190
 * à 509 praticiens qui avaient une page jusqu'au 2026-10-16 restent dans le classement des 101
 * départements (deux tableaux) et dans le simulateur ; leurs anciennes adresses redirigent vers leur
 * ligne du classement (404.astro, ANCIENNES_PAGES).
 */
export const SEUIL = 510;
/** Seuil en vigueur jusqu'au 2026-10-16 (60 départements) : sert seulement aux redirections. */
const SEUIL_AVANT_2026_10_16 = 190;

const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['’]/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export interface DepPage { id: string; code: string; name: string; slug: { fr: string; en: string }; nav: { fr: string; en: string } }

const depPage = (code: string): DepPage => {
  const name = DEPS[code].name;
  const s = slugify(name);
  return { id: `dep-${code.toLowerCase()}`, code, name, slug: { fr: `dentistes-${s}`, en: `dentists-${s}` }, nav: { fr: name, en: name } };
};
const eff = (c: string) => DEPS[c].p.ensemble?.eff ?? 0;

export const DEP_PAGES: DepPage[] = DEP_CODES.filter((c) => eff(c) >= SEUIL).map(depPage);

/** Pages retirées le 2026-10-16 : leur adresse redirige vers la ligne du département dans le classement. */
export const ANCIENNES_PAGES: DepPage[] = DEP_CODES.filter((c) => eff(c) >= SEUIL_AVANT_2026_10_16 && eff(c) < SEUIL).map(depPage);

/** Ancre de la ligne d'un département dans le tableau du classement. */
export const ancreDep = (code: string) => `d-${code.toLowerCase()}`;

export const depPageById = (id: string) => DEP_PAGES.find((d) => d.id === id);
export const depPageByCode = (code: string) => DEP_PAGES.find((d) => d.code === code);
