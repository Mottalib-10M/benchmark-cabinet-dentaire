import { cabinet } from '../engine/cabinet';
import { FR } from '../engine/data';
import { T, eur, num, type L } from './_kit';
const vide = { personnel: 0, prothesiste: 0, fournitures: 0, loyer: 0, autres: 0 };
/** Honoraires par fauteuil, par jour et par fauteuil-jour. */
export default (l: L) => ({
  title: T(l, 'Ce que rapporte chaque fauteuil', 'What each chair brings in'),
  cta: T(l, 'Comparer tout le cabinet', 'Benchmark the whole practice'),
  inputs: [
    { id: 'r', label: T(l, 'Honoraires de l’année', 'Fees for the year'), def: 300000, unit: '€', max: 10_000_000 },
    { id: 'f', label: T(l, 'Fauteuils utilisés', 'Chairs in use'), def: 2, max: 30 },
    { id: 'j', label: T(l, 'Jours travaillés par semaine', 'Days worked per week'), def: 4.5, max: 7, decimals: 1 },
    { id: 'w', label: T(l, 'Semaines travaillées par an', 'Weeks worked per year'), def: 45, max: 52 },
  ],
  run: ({ r, f, j, w }: Record<string, number>) => {
    const c = cabinet({ recettes: r, fauteuils: f, salaries: 0, joursSemaine: j, semaines: w, charges: vide, cotisationsPerso: 0 }, 0);
    const fj = c.parFauteuil != null && c.joursAn > 0 ? c.parFauteuil / c.joursAn : null;
    return {
      head: [T(l, 'Honoraires par fauteuil', 'Fees per chair'), c.parFauteuil != null ? eur(c.parFauteuil, l) : '–'],
      rows: [
        [T(l, 'Par jour travaillé', 'Per day worked'), c.parJour != null ? eur(c.parJour, l) : '–'],
        [T(l, 'Par fauteuil et par jour', 'Per chair per day'), fj != null ? eur(fj, l) : '–'],
        [T(l, 'Jours travaillés dans l’année', 'Days worked in the year'), num(c.joursAn, l)],
        [T(l, 'Moyenne France par omnipraticien', 'France average per general dentist'), eur(FR.p.omni!.tot!, l)],
      ] as [string, string][],
      note: T(l, 'Aucune statistique publique ne donne de moyenne par fauteuil : la comparaison officielle se fait par praticien.', 'No public statistic gives a per-chair average: the official comparison is per practitioner.'),
    };
  },
});
