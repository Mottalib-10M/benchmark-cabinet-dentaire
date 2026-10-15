import { rangRevenu } from '../engine/references';
import { P } from '../engine/params';
import { T, eur, type L } from './_kit';
import { ordinal } from '../format';
const D = P.revenus.drees;
/** Situer un revenu dans la distribution DREES 2021 des chirurgiens-dentistes libéraux. */
export default (l: L) => ({
  title: T(l, 'Votre revenu face à celui des confrères', 'Your income against your peers'),
  cta: T(l, 'Estimer votre bénéfice', 'Estimate your profit'),
  inputs: [{ id: 'r', label: T(l, 'Revenu annuel après charges et cotisations', 'Annual income after costs and contributions'), def: 100000, unit: '€', max: 5_000_000 }],
  run: ({ r }: Record<string, number>) => {
    const x = rangRevenu(r);
    const head = x.sous ? T(l, 'sous le 1er décile', 'below the bottom decile') : x.au ? T(l, 'au-delà du 9e décile', 'above the top decile') : T(l, `${ordinal(x.centile!, 'fr')} centile`, `${ordinal(x.centile!, 'en')} percentile`);
    return {
      head: [T(l, `Position parmi les dentistes libéraux (${D.annee})`, `Position among private dentists (${D.annee})`), head],
      rows: [
        [T(l, 'Médiane', 'Median'), eur(D.quantiles.mediane, l)],
        [T(l, 'Moyenne', 'Average'), eur(D.moyen, l)],
        [T(l, '1er et 9e décile', 'Bottom and top decile'), `${eur(D.quantiles.d1, l)} / ${eur(D.quantiles.d9, l)}`],
      ] as [string, string][],
      note: T(l, 'DREES, revenus 2021 en euros courants ; position interpolée entre les déciles et quartiles publiés.', 'DREES, 2021 income in current euros; position interpolated between published deciles and quartiles.'),
    };
  },
});
