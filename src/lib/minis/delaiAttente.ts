import { delaiFile, DELAI_MEDIAN } from '../engine/organisation-agenda';
import { P } from '../engine/params';
import { T, num, type L } from './_kit';
/** Délai du premier rendez-vous d'un nouveau patient, par la loi de Little (file ÷ débit). */
export default (l: L) => ({
  title: T(l, 'Combien de temps attend un nouveau patient ?', 'How long does a new patient wait?'),
  cta: T(l, 'Faire le diagnostic complet du cabinet', 'Run the full practice check-up'),
  inputs: [
    { id: 'd', label: T(l, 'Nouveaux patients qui appellent, par semaine', 'New patients calling per week'), def: 6, max: 200 },
    { id: 'c', label: T(l, 'Créneaux ouverts aux nouveaux patients, par semaine', 'Slots open to new patients per week'), def: 5, max: 200 },
    { id: 'f', label: T(l, 'Nouveaux patients déjà en attente', 'New patients already waiting'), def: 15, max: 2000 },
  ],
  run: ({ d, c, f }: Record<string, number>) => {
    const r = delaiFile({ demandes: d, creneaux: c, file: f });
    const j = T(l, 'jours', 'days');
    const cible = r.creneauxPourCible(DELAI_MEDIAN);
    return {
      head: [T(l, 'Délai estimé du premier rendez-vous', 'Estimated wait for a first appointment'), r.delaiJours != null ? `${num(r.delaiJours, l)} ${j}` : T(l, 'aucun créneau', 'no slot')],
      rows: [
        [T(l, `Délai médian mesuré par la DREES (${P.delais_rdv.annee_enquete})`, `Median wait measured by DREES (${P.delais_rdv.annee_enquete})`), `${num(DELAI_MEDIAN, l)} ${j}`],
        [T(l, 'La file d’attente, chaque semaine', 'The queue, each week'), r.variation > 0 ? T(l, `s’allonge de ${num(r.variation, l)}`, `grows by ${num(r.variation, l)}`) : r.variation < 0 ? T(l, `raccourcit de ${num(-r.variation, l)}`, `shrinks by ${num(-r.variation, l)}`) : T(l, 'reste stable', 'stays the same')],
        [T(l, 'Semaines pour la résorber', 'Weeks to clear it'), r.semainesResorption != null ? num(r.semainesResorption, l, 1) : T(l, 'jamais à ce rythme', 'never at this pace')],
        [T(l, 'Créneaux par semaine pour revenir à la médiane', 'Weekly slots to get back to the median'), Number.isFinite(cible) ? num(Math.ceil(cible), l) : '–'],
      ] as [string, string][],
      note: T(l,
        'Loi de Little : le délai moyen égale la file d’attente divisée par le nombre de patients reçus par semaine. Un ordre de grandeur, qui suppose une demande régulière.',
        'Little’s law: the average wait equals the queue divided by the number of patients seen per week. A rough guide that assumes steady demand.'),
    };
  },
});
