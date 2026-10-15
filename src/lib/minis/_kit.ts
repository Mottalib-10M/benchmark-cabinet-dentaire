/** Petits outils communs aux mini-simulateurs (fichier ignoré par le registre : préfixe « _ »). */
import { formatMoney, formatPercent, formatNumber } from '../format';
export type L = 'fr' | 'en';
export const T = <A>(l: L, fr: A, en: A) => (l === 'en' ? en : fr);
export const eur = (x: number, l: L, d = 0) => formatMoney(x, d, l);
export const pct = (x: number, l: L, d = 1) => formatPercent(x, d, l);
export const num = (x: number, l: L, d = 0) => formatNumber(x, d, l);
const MOIS = { fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'], en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] };
/** « mars 2027 » / « March 2027 » à partir d'une date ISO. */
export const moisAnnee = (iso: string, l: L) => { const [y, m] = iso.split('-').map(Number); return `${MOIS[l][m - 1]} ${y}`; };
export const moisOptions = (l: L) => MOIS[l].map((m, i) => ({ value: String(i + 1), label: m }));
