import { distribution } from '../engine/selarl';
import { P } from '../engine/params';
import { T, eur, pct, type L } from './_kit';
/** IS et dividendes d'une SELARL : ce qui reste du bénéfice distribué. */
export default (l: L) => ({
  title: T(l, 'Bénéfice de la SELARL distribué en dividendes', 'SELARL profit paid out as dividends'),
  cta: T(l, 'Comparer tout le cabinet', 'Benchmark the whole practice'),
  inputs: [
    { id: 'b', label: T(l, 'Bénéfice après votre rémunération', 'Profit after your pay'), def: 60000, unit: '€', max: 5_000_000 },
    { id: 'k', label: T(l, 'Capital et comptes courants', 'Capital and shareholder loans'), def: 10000, unit: '€', max: 5_000_000 },
  ],
  run: ({ b, k }: Record<string, number>) => {
    const d = distribution(b, k);
    return {
      head: [T(l, 'Dividendes après impôts', 'Dividends after tax'), eur(d.netAvantCotisations, l)],
      rows: [
        [T(l, 'Impôt sur les sociétés', 'Corporation tax'), `− ${eur(d.is, l)}`],
        [T(l, `Impôt sur le revenu (${pct(P.fiscal_2026.pfu_ir, l)})`, `Income tax (${pct(P.fiscal_2026.pfu_ir, l)})`), `− ${eur(d.ir, l)}`],
        [T(l, `Prélèvements sociaux (${pct(P.fiscal_2026.prelevements_sociaux, l)})`, `Social levies (${pct(P.fiscal_2026.prelevements_sociaux, l)})`), `− ${eur(d.ps, l)}`],
        [T(l, 'Part soumise aux cotisations sociales', 'Part liable to social contributions'), eur(d.horsPs, l)],
      ] as [string, string][],
      note: T(l, 'La part au-delà de 10 % du capital et des comptes courants supporte les cotisations des indépendants, non calculées ici.', 'The part above 10% of capital and shareholder loans bears self-employed contributions, not calculated here.'),
    };
  },
});
