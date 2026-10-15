import { reference, UNASA_YEAR } from '../engine/references';
import { T, eur, pct, num, type L } from './_kit';
/** Taux de charges d'un cabinet face aux comptes UNASA 2024 du même quart de recettes. */
export default (l: L) => {
  const r0 = reference('omni', 300000);
  return {
    title: T(l, 'Votre taux de charges face aux cabinets de même taille', 'Your cost ratio against practices of the same size'),
    cta: T(l, 'Comparer tout le cabinet', 'Benchmark the whole practice'),
    inputs: [
      { id: 'r', label: T(l, 'Recettes de l’année', 'Receipts for the year'), def: 300000, unit: '€', max: 10_000_000 },
      { id: 'c', label: T(l, 'Charges, vos cotisations personnelles comprises', 'Costs, your personal contributions included'), def: Math.round((300000 * r0.taux) / 1000) * 1000, unit: '€', max: 10_000_000 },
    ],
    run: ({ r, c }: Record<string, number>) => {
      const ref = reference('omni', r);
      const t = r > 0 ? c / r : 0;
      const d = t - ref.taux;
      return {
        head: [T(l, 'Votre taux de charges', 'Your cost ratio'), pct(t, l)],
        rows: [
          [T(l, `Référence ${ref.quartile}e quart de recettes (UNASA ${UNASA_YEAR})`, `Benchmark, receipts quarter ${ref.quartile} (UNASA ${UNASA_YEAR})`), pct(ref.taux, l)],
          [T(l, 'Écart', 'Gap'), `${d >= 0 ? '+' : '−'}${num(Math.abs(d) * 100, l, 1)} ${T(l, 'points', 'points')}`],
          [T(l, 'Bénéfice', 'Profit'), eur(r - c, l)],
          [T(l, 'Bénéfice moyen de ce quart', 'Average profit in this quarter'), eur(ref.benefice, l)],
        ] as [string, string][],
        note: T(l, `Quart choisi : celui dont la recette moyenne (${eur(ref.recettes, l)}) est la plus proche de la vôtre.`, `Quarter used: the one whose average receipts (${eur(ref.recettes, l)}) are closest to yours.`),
      };
    },
  };
};
