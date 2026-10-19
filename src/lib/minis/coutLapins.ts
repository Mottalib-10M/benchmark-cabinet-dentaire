import { coutLapins } from '../engine/organisation-agenda';
import { P } from '../engine/params';
import { T, eur, num, pct, type L } from './_kit';
const D = P.defauts.omni;
const H = P.diagnostic;
/** Coût annuel des rendez-vous manqués et part qu'un rappel et une liste d'attente peuvent récupérer. */
export default (l: L) => ({
  title: T(l, 'Ce que coûtent vos rendez-vous manqués', 'What your missed appointments cost'),
  cta: T(l, 'Faire le diagnostic complet du cabinet', 'Run the full practice check-up'),
  inputs: [
    { id: 'a', label: T(l, 'Patients absents sans prévenir, par jour', 'No-shows per day'), def: 1, max: 20, decimals: 1 },
    { id: 'r', label: T(l, 'Chiffre d’affaires de l’année', 'Turnover for the year'), def: D.recettes, unit: '€', max: 5_000_000 },
    { id: 'h', label: T(l, 'Heures au fauteuil par jour', 'Chairside hours a day'), def: D.heuresJour, max: 14, decimals: 1 },
    { id: 'j', label: T(l, 'Jours travaillés par semaine', 'Days worked a week'), def: D.joursSemaine, max: 7, decimals: 1 },
    { id: 'w', label: T(l, 'Semaines travaillées par an', 'Weeks worked a year'), def: D.semaines, max: 52 },
  ],
  run: ({ a, r, h, j, w }: Record<string, number>) => {
    const c = coutLapins({ absJour: a, joursSemaine: j, semaines: w, ca: r, heuresJour: h });
    return {
      head: [T(l, 'Production qui ne se fait pas', 'Work that never happens'), `${eur(c.perdu, l)} ${T(l, '/ an', '/ year')}`],
      rows: [
        [T(l, 'Rendez-vous manqués par an', 'Missed appointments a year'), num(c.rdvParAn, l)],
        [T(l, `Valeur d’un créneau de ${H.duree_rdv_min} min`, `Value of a ${H.duree_rdv_min}-minute slot`), c.valeurRdv != null ? eur(c.valeurRdv, l) : '–'],
        [T(l, 'Part des rendez-vous de la journée', 'Share of the day’s appointments'), c.taux != null ? pct(c.taux, l) : '–'],
        [T(l, `Repère Doctolib, chirurgiens-dentistes (${P.rdv_non_honores.annee})`, `Doctolib benchmark, dentists (${P.rdv_non_honores.annee})`), pct(P.rdv_non_honores.dentistes_pas_venu, l)],
        [T(l, `Récupérable (hypothèse Dentimètre : ${pct(H.part_recuperable_lapins, l, 0)})`, `Recoverable (Dentimètre assumption: ${pct(H.part_recuperable_lapins, l, 0)})`), eur(c.recuperable, l)],
      ] as [string, string][],
      note: T(l,
        `Créneau de ${H.duree_rdv_min} minutes valorisé à votre chiffre d’affaires horaire. La part récupérable est une hypothèse prudente de Dentimètre, pas une statistique. Le repère vient des agendas des utilisateurs de Doctolib (juin 2024) : aucune statistique officielle ne mesure les absences chez le dentiste.`,
        `Each ${H.duree_rdv_min}-minute slot is valued at your turnover per hour. The recoverable share is a cautious Dentimètre assumption, not a statistic. The benchmark comes from Doctolib users’ diaries (June 2024): no official statistic measures no-shows at the dentist.`),
    };
  },
});
