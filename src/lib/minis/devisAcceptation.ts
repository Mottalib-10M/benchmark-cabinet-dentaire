import { devisAnnuel } from '../engine/organisation-suivi';
import { T, eur, num, type L } from './_kit';
/** Production signée par les devis de prothèse et effet de 10 points d'acceptation en plus. */
export default (l: L) => ({
  title: T(l, 'Ce que rapportent vos devis signés', 'What your signed quotes bring in'),
  cta: T(l, 'Faire le diagnostic complet', 'Run the full check-up'),
  inputs: [
    { id: 'd', label: T(l, 'Devis remis par mois (vos chiffres)', 'Quotes given per month (your figures)'), def: 20, max: 500 },
    { id: 't', label: T(l, 'Part des devis signés', 'Share of quotes signed'), def: 50, unit: '%', max: 100 },
    { id: 'm', label: T(l, 'Montant moyen d’un devis', 'Average quote value'), def: 1500, unit: '€', max: 100_000 },
    { id: 'a', label: T(l, 'Mois travaillés par an', 'Months worked per year'), def: 11, max: 12 },
  ],
  run: ({ d, t, m, a }: Record<string, number>) => {
    const r = devisAnnuel({ parMois: d, taux: t / 100, montant: m, mois: a });
    return {
      head: [T(l, 'Production signée sur l’année', 'Work signed over the year'), eur(r.productionAn, l)],
      rows: [
        [T(l, 'Devis signés dans l’année', 'Quotes signed in the year'), num(r.signesAn, l)],
        [T(l, 'Avec 10 points d’acceptation en plus', 'With 10 more points of acceptance'), eur(r.productionPlus, l)],
        [T(l, 'Écart sur l’année', 'Difference over the year'), `+ ${eur(r.gainParPoints, l)}`],
      ] as [string, string][],
      note: T(l, 'Aucune statistique publique ne donne de taux d’acceptation des devis dentaires : le calcul part de vos propres chiffres, à relever dans votre logiciel.', 'No public statistic gives an acceptance rate for dental quotes: the calculation uses your own figures, taken from your practice software.'),
    };
  },
});
