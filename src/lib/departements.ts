/**
 * Pages « département » : une page par département qui compte au moins SEUIL chirurgiens-dentistes
 * libéraux (Assurance Maladie, dernière année publiée). Sous ce seuil, le département reste dans le
 * simulateur, mais il ne reçoit pas de page : la moyenne y repose sur peu de praticiens, l'orthodontie
 * et la stomatologie y sont souvent couvertes par le secret statistique (moins de 5 praticiens), et la
 * page serait surtout vide. Le texte rédigé de chaque page vit dans `src/content/departements/<code>.ts`.
 */
import { DEPS, DEP_CODES } from './engine/data';

/** Seuil de publication d'une page : 190 praticiens donne 60 départements et 88 % des dentistes. */
export const SEUIL = 190;

const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['’]/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export interface DepPage { id: string; code: string; name: string; slug: { fr: string; en: string }; nav: { fr: string; en: string } }

export const DEP_PAGES: DepPage[] = DEP_CODES
  .filter((c) => (DEPS[c].p.ensemble?.eff ?? 0) >= SEUIL)
  .map((code) => {
    const name = DEPS[code].name;
    const s = slugify(name);
    return { id: `dep-${code.toLowerCase()}`, code, name, slug: { fr: `dentistes-${s}`, en: `dentists-${s}` }, nav: { fr: name, en: name } };
  });

export const depPageById = (id: string) => DEP_PAGES.find((d) => d.id === id);
export const depPageByCode = (code: string) => DEP_PAGES.find((d) => d.code === code);
