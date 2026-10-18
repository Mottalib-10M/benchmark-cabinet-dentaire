import { heuresAn, refHoraire } from '../engine/diagnostic';
import { FR, DATA_YEAR } from '../engine/data';
import { P } from '../engine/params';
import { T, eur, num, type L } from './_kit';
/** Valeur d'une heure, d'un créneau et d'une demi-journée d'agenda (moteur : lib/engine/diagnostic). */
export default (l: L) => ({
  title: T(l, 'Ce que vaut une heure de votre agenda', 'What one hour of your diary is worth'),
  cta: T(l, 'Faire le diagnostic complet', 'Run the full check-up'),
  inputs: [
    { id: 'ca', label: T(l, 'Chiffre d’affaires de l’année', 'Turnover for the year'), def: P.defauts.omni.recettes, unit: '€', max: 5_000_000 },
    { id: 'j', label: T(l, 'Jours par semaine', 'Days a week'), def: P.defauts.omni.joursSemaine, max: 6, decimals: 1 },
    { id: 'h', label: T(l, 'Heures au fauteuil par jour', 'Chairside hours a day'), def: P.defauts.omni.heuresJour, max: 12, decimals: 1 },
    { id: 's', label: T(l, 'Semaines travaillées par an', 'Weeks worked a year'), def: P.defauts.omni.semaines, max: 52 },
  ],
  run: ({ ca, j, h, s }: Record<string, number>) => {
    const heures = heuresAn({ jours: j, heures: h, semaines: s });
    const parHeure = heures > 0 ? ca / heures : null;
    const creneau = parHeure != null ? (parHeure * P.diagnostic.duree_rdv_min) / 60 : null;
    const ref = refHoraire({ value: FR.p.omni!.tot!, level: 'fr' });
    const tt = P.temps_travail;
    return {
      head: [T(l, 'Chiffre d’affaires par heure au fauteuil', 'Turnover per chairside hour'), parHeure != null ? eur(parHeure, l) : '–'],
      rows: [
        [T(l, `Un créneau de ${P.diagnostic.duree_rdv_min} minutes`, `One ${P.diagnostic.duree_rdv_min}-minute slot`), creneau != null ? eur(creneau, l) : '–'],
        [T(l, 'Une demi-journée laissée vide', 'One half-day left empty'), parHeure != null ? eur((parHeure * h) / 2, l) : '–'],
        [T(l, 'Heures au fauteuil dans l’année', 'Chairside hours in the year'), num(heures, l)],
        [T(l, `Repère : honoraires moyens France ${DATA_YEAR} ÷ ${num(tt.heures_an, l)} h de travail`, `Benchmark: France average fees ${DATA_YEAR} ÷ ${num(tt.heures_an, l)} working hours`), ref != null ? eur(ref, l) : '–'],
      ] as [string, string][],
      note: T(l, `Le créneau de ${P.diagnostic.duree_rdv_min} minutes est une hypothèse de Dentimètre. Le temps de travail publié (omnipraticiens des Pays de la Loire, ${tt.annee_enquete}) compte aussi l’administratif : il n’est pas comparable heure pour heure au temps passé au fauteuil.`, `The ${P.diagnostic.duree_rdv_min}-minute slot is a Dentimètre assumption. The published working time (general dentists in Pays de la Loire, ${tt.annee_enquete}) includes admin, so it does not compare hour for hour with chairside time.`),
    };
  },
});
