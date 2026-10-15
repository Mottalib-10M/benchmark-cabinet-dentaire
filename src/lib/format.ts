/** Formatage monétaire/numérique localisé (configuré par site via site-config). */
import { LOCALE_TAG, LOCALE_BY_LANG, CURRENCY } from '../data/site-config';

export type Lang = 'fr' | 'en';
const tagOf = (lang?: string) => (lang && LOCALE_BY_LANG[lang]) || LOCALE_TAG;

const cache = new Map<string, Intl.NumberFormat>();
function nf(opts: Intl.NumberFormatOptions, lang?: string): Intl.NumberFormat {
  const tag = tagOf(lang);
  const k = tag + JSON.stringify(opts);
  if (!cache.has(k)) cache.set(k, new Intl.NumberFormat(tag, opts));
  return cache.get(k)!;
}
export function formatMoney(value: number, decimals = 0, lang?: string): string {
  return nf({ style: 'currency', currency: CURRENCY, minimumFractionDigits: decimals, maximumFractionDigits: decimals }, lang).format(value);
}
export function formatNumber(value: number, decimals = 0, lang?: string): string {
  return nf({ minimumFractionDigits: decimals, maximumFractionDigits: decimals }, lang).format(value);
}
/** Nombre tiré des paramètres et inséré dans un texte : décimales utiles seulement (13,18 · 111,8 · 548),
 *  toujours au format de la locale. Jamais `{P.x}` ni `toFixed` dans une page (RECETTE §4, §17.4). */
export function formatDecimal(value: number, max = 2, lang?: string): string {
  return nf({ maximumFractionDigits: max }, lang).format(value);
}
export function formatPercent(value: number, decimals = 1, lang?: string): string {
  // Toutes langues : espace insécable avant % (RECETTE §7) ; Intl n'en met pas en anglais (« 3.5% »).
  return nf({ style: 'percent', minimumFractionDigits: decimals, maximumFractionDigits: decimals }, lang).format(value).replace(/(\d)\s?%/, '$1\u00a0%');
}
export function parseLocaleNumber(input: string): number {
  const cleaned = input.replace(/[^\d.,-]/g, '');
  // Détecte le séparateur décimal : le dernier des deux symboles
  const lastComma = cleaned.lastIndexOf(','), lastDot = cleaned.lastIndexOf('.');
  let s = cleaned;
  if (lastComma > lastDot) s = cleaned.replace(/\./g, '').replace(',', '.');
  // « 35.000 » en danois, néerlandais ou allemand : point séparateur de milliers, pas décimal.
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(cleaned)) s = cleaned.replace(/\./g, '');
  else s = cleaned.replace(/,/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

/** Date de mise à jour écrite dans la langue de la page (registre 2026-09-21) : « 27 September 2026 »,
 *  jamais le format machine. Fuseau UTC forcé, sinon la date recule d'un jour à l'ouest de Greenwich.
 *  Le format ISO reste dans l'attribut `datetime` de la balise <time>. */
export function displayDate(iso: string, langTag: string): string {
  const s = new Date(`${iso}T00:00:00Z`).toLocaleDateString(langTag, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  // Français : « 1er novembre », jamais « 1 novembre » (ordinal du premier jour du mois).
  return langTag.startsWith('fr') ? s.replace(/^1 /, '1er ') : s;
}

/** Ordinal écrit : « 1er », « 2e » en français ; « 1st », « 22nd », « 53rd », « 11th » en anglais. */
export function ordinal(n: number, lang: string): string {
  if (lang.startsWith('fr')) return n === 1 ? '1er' : `${n}e`;
  const t = n % 100, u = n % 10;
  return `${n}${t >= 11 && t <= 13 ? 'th' : u === 1 ? 'st' : u === 2 ? 'nd' : u === 3 ? 'rd' : 'th'}`;
}

/** Remet d'aplomb les ordinaux composés dans un texte (« 53th » → « 53rd », « 1e rang » → « 1er rang »),
 *  quand un rang tiré des données est collé à un suffixe fixe : la donnée change chaque année. */
export function fixOrdinals(html: string, lang: string): string {
  if (lang.startsWith('fr')) return html.replace(/(^|[^\d])1e(?=\s)/g, '$11er');
  return html.replace(/\b(\d+)(st|nd|rd|th)\b/g, (_m, d: string) => ordinal(Number(d), 'en'));
}
