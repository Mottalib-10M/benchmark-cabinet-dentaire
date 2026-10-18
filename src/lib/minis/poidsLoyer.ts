import { reference, UNASA_YEAR } from '../engine/references';
import { P } from '../engine/params';
import { T, eur, pct, type L } from './_kit';
/** Poids du loyer dans le chiffre d'affaires, face au quart de recettes UNASA le plus proche. */
export default (l: L) => ({
  title: T(l, 'Le poids de votre loyer', 'The weight of your rent'),
  cta: T(l, 'Faire le diagnostic complet', 'Run the full check-up'),
  inputs: [
    { id: 'loyer', label: T(l, 'Loyer par mois, charges comprises', 'Rent per month, service charges included'), def: 2500, unit: '€', max: 50_000 },
    { id: 'ca', label: T(l, 'Chiffre d’affaires de l’année', 'Turnover for the year'), def: P.defauts.omni.recettes, unit: '€', max: 5_000_000 },
  ],
  run: ({ loyer, ca }: Record<string, number>) => {
    const U = reference('omni', ca > 0 ? ca : undefined);
    const part = ca > 0 ? (loyer * 12) / ca : null;
    const ecart = part != null ? (part - U.loyer) * ca : null;
    return {
      head: [T(l, 'Part du chiffre d’affaires', 'Share of turnover'), part != null ? pct(part, l) : '–'],
      rows: [
        [T(l, 'Loyer sur l’année', 'Rent over the year'), eur(loyer * 12, l)],
        [T(l, `Repère UNASA ${UNASA_YEAR}, cabinets de votre taille`, `UNASA ${UNASA_YEAR} benchmark, practices of your size`), pct(U.loyer, l)],
        [T(l, 'Écart avec le repère, par an', 'Gap with the benchmark, per year'), ecart != null ? `${ecart >= 0 ? '+' : '−'}${eur(Math.abs(ecart), l)}` : '–'],
      ] as [string, string][],
      note: T(l, `Repère : poste « loyer et charges locatives » des comptes UNASA ${UNASA_YEAR}, dans le quart de recettes le plus proche du vôtre. Propriétaire des murs : votre loyer vaut 0, mais l’emprunt ou le loyer versé à votre SCI joue le même rôle.`, `Benchmark: the rent and service charges line of the UNASA ${UNASA_YEAR} accounts, in the receipts quarter closest to yours. If you own the premises your rent is 0, but the loan or the rent paid to your property company plays the same part.`),
    };
  },
});
