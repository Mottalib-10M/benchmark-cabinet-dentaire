import { route, type Locale } from './routes';
import { PAGES, pageById } from '../lib/guides';
import { depPageById } from '../lib/departements';
import type { Group } from '../lib/guide-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<Locale, Record<string, string>> = {
  fr: { home: 'Diagnostic du cabinet', method: 'Méthode et sources', about: 'À propos', widget: 'Intégrer le simulateur', contact: 'Contact', editorial: 'Charte éditoriale', privacy: 'Confidentialité', terms: 'Mentions légales', cookies: 'Cookies' },
  en: { home: 'Practice check-up', method: 'Method and sources', about: 'About', widget: 'Embed the calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' },
};
const GROUP_LABEL: Record<Locale, Record<Group, string>> = {
  fr: { organisation: 'Organisation et performance', specialites: 'Spécialités', gestion: 'Gestion du cabinet', territoires: 'Départements' },
  en: { organisation: 'Organisation and performance', specialites: 'Specialties', gestion: 'Running a practice', territoires: 'Départements' },
};
export const label = (id: string, lang: Locale) => CORE[lang][id] ?? pageById(id)?.[lang].nav ?? depPageById(id)?.nav[lang] ?? id;
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id, lang) });
const inGroup = (g: Group, lang: Locale) => PAGES.filter((p) => p.group === g).map((p) => link(p.id, lang));
export function navCategories(lang: Locale): NavCategory[] {
  return (['organisation', 'specialites', 'gestion', 'territoires'] as Group[]).map((g) => ({ label: GROUP_LABEL[lang][g], links: inGroup(g, lang) })).filter((c) => c.links.length);
}
export const navDirect = (lang: Locale): NavLink[] => [link('method', lang)];
export const footerColumns = (lang: Locale): NavCategory[] => [...navCategories(lang), { label: lang === 'fr' ? 'Le site' : 'Site', links: ['home', 'method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) }];
export const popularLinks = (_lang: Locale): NavLink[] => [];
