import { tempsDelegue, caHoraireRepere } from '../engine/organisation-equipe';
import { P } from '../engine/params';
import { T, eur, num, pct, type L } from './_kit';
const ref = caHoraireRepere();
/** Heures de fauteuil rendues par la délégation à l'assistant dentaire, et leur valeur. */
export default (l: L) => ({
  title: T(l, 'Ce que vous rend la délégation', 'What delegation gives back'),
  cta: T(l, 'Faire le diagnostic du cabinet', 'Run the practice check-up'),
  inputs: [
    { id: 't', label: T(l, 'Tâches que vous faites encore vous-même', 'Tasks you still do yourself'), def: 2, max: 5 },
    { id: 'm', label: T(l, 'Minutes par tâche et par jour', 'Minutes per task per day'), def: 15, unit: 'min', max: 240 },
    { id: 'j', label: T(l, 'Jours travaillés par semaine', 'Days worked per week'), def: 4, max: 7, decimals: 1 },
    { id: 's', label: T(l, 'Semaines travaillées par an', 'Weeks worked per year'), def: 45, max: 52 },
    { id: 'c', label: T(l, 'Votre chiffre d’affaires par heure', 'Your turnover per hour'), def: ref ? Math.round(ref / 10) * 10 : 150, unit: '€', max: 2000 },
  ],
  run: ({ t, m, j, s, c }: Record<string, number>) => {
    const d = tempsDelegue({ taches: t, minutes: m, jours: j, semaines: s, caHoraire: c });
    return {
      head: [T(l, 'Heures de fauteuil libérées par an', 'Chair hours freed per year'), `${num(d.heuresAn, l)} h`],
      rows: [
        [T(l, `Production possible (hypothèse : ${pct(d.part, l, 0)} du temps)`, `Possible output (assumption: ${pct(d.part, l, 0)} of the time)`), eur(d.production, l)],
        [T(l, 'Coût d’un mi-temps d’assistant au minimum 2026', 'Cost of a half-time assistant at the 2026 minimum'), eur(d.coutMiTemps, l)],
        [T(l, 'Écart', 'Difference'), `${d.solde >= 0 ? '+' : '−'} ${eur(Math.abs(d.solde), l)}`],
      ] as [string, string][],
      note: T(l,
        `La part du temps libéré qui redevient de la production est une hypothèse de Dentimètre, pas une statistique. Le chiffre par heure proposé divise la moyenne Ameli d’un omnipraticien par ${num(P.temps_travail.heures_an, l)} heures de travail (ORS Pays de la Loire, ${P.temps_travail.annee_enquete}).`,
        `The share of freed time that turns back into treatment is a Dentimètre assumption, not a statistic. The suggested hourly figure divides the Ameli average for a general dentist by ${num(P.temps_travail.heures_an, l)} working hours (ORS Pays de la Loire, ${P.temps_travail.annee_enquete}).`),
    };
  },
});
