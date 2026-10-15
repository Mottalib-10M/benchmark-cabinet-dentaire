/**
 * Jeu de données Assurance Maladie (data.ameli.fr, SNDS, licence ODbL), construit par
 * `scripts/data/build-ameli.py`. Un indicateur couvert par le secret statistique vaut null.
 */
import raw from '../../data/ameli.json';

export type Spec = 'omni' | 'odf' | 'stomato';
export const SPECS: Spec[] = ['omni', 'odf', 'stomato'];

export interface Stat {
  /** Praticiens libéraux actifs au 31 décembre (tous). */
  eff: number | null;
  /** Même effectif cinq ans plus tôt. */
  eff5: number | null;
  /** Praticiens pour 100 000 habitants. */
  dens: number | null;
  /** Praticiens « actifs à part entière » sur lesquels la moyenne est calculée (total ÷ moyenne). */
  ape: number | null;
  /** Honoraires sans dépassement, moyenne par praticien APE. */
  hsd: number | null;
  /** Dépassements, moyenne par praticien APE. */
  dep: number | null;
  /** Honoraires totaux moyens (hsd + dep). */
  tot: number | null;
  femmes: number | null;
  /** Part des 60 ans et plus. */
  p60: number | null;
  /** Part des moins de 35 ans. */
  m35: number | null;
  /** Part des praticiens en exercice mixte (libéral + salarié). */
  mixte: number | null;
  /** Patients uniques moyens dans l'année (file active). */
  patients: number | null;
  /** Honoraires totaux moyens par année. */
  hist: Record<string, number>;
}
export interface Zone { name: string; region?: string; p: Partial<Record<Spec | 'ensemble', Stat>> }
interface Raw { fr: Zone; regions: Record<string, Zone>; departements: Record<string, Zone>; meta: { year: number; retrieved_at: string; source: string; datasets: Record<string, string>; secret: string } }

export const AMELI = raw as unknown as Raw;
export const DATA_YEAR = AMELI.meta.year;
export const FR = AMELI.fr;
export const DEPS = AMELI.departements;
export const REGS = AMELI.regions;

/** Codes de département triés dans l'ordre usuel (01…95, 2A, 2B, puis outre-mer). */
export const DEP_CODES = Object.keys(DEPS).sort((a, b) => {
  const n = (c: string) => (c === '2A' ? 20.1 : c === '2B' ? 20.2 : Number(c));
  return n(a) - n(b);
});

export function stat(level: 'fr' | 'reg' | 'dep', code: string | null, spec: Spec | 'ensemble'): Stat | null {
  const z = level === 'fr' ? FR : level === 'reg' ? (code ? REGS[code] : undefined) : code ? DEPS[code] : undefined;
  return z?.p[spec] ?? null;
}
export const depName = (code: string) => DEPS[code]?.name ?? code;
export const regionOf = (code: string) => DEPS[code]?.region ?? null;
export const regName = (code: string | null) => (code ? REGS[code]?.name ?? code : '');
