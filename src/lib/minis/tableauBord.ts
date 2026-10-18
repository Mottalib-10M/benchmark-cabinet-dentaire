import { tableauBord, repereHoraireNational } from '../engine/organisation-suivi';
import { P } from '../engine/params';
import { DATA_YEAR } from '../engine/data';
import { T, eur, pct, num, type L } from './_kit';
/** Le tableau de bord d'un mois : CA horaire, absences, CA par rendez-vous honoré. */
export default (l: L) => ({
  title: T(l, 'Votre tableau de bord du mois', 'Your monthly dashboard'),
  cta: T(l, 'Faire le diagnostic complet', 'Run the full check-up'),
  inputs: [
    { id: 'c', label: T(l, 'Chiffre d’affaires du mois', 'Turnover for the month'), def: 25000, unit: '€', max: 1_000_000 },
    { id: 'h', label: T(l, 'Heures au fauteuil dans le mois', 'Chairside hours in the month'), def: 120, max: 400 },
    { id: 'p', label: T(l, 'Rendez-vous inscrits à l’agenda', 'Appointments booked'), def: 300, max: 3000 },
    { id: 'm', label: T(l, 'Rendez-vous manqués sans prévenir', 'No-shows'), def: 12, max: 3000 },
    { id: 'n', label: T(l, 'Nouveaux patients reçus', 'New patients seen'), def: 25, max: 3000 },
  ],
  run: ({ c, h, p, m, n }: Record<string, number>) => {
    const t = tableauBord({ ca: c, heures: h, prevus: p, manques: m, nouveaux: n });
    const r = repereHoraireNational();
    const T0 = P.temps_travail;
    return {
      head: [T(l, 'Chiffre d’affaires par heure au fauteuil', 'Turnover per chairside hour'), t.caHoraire != null ? eur(t.caHoraire, l) : '–'],
      rows: [
        [T(l, 'Taux de rendez-vous manqués', 'No-show rate'), t.tauxAbsence != null ? pct(t.tauxAbsence, l) : '–'],
        [T(l, 'Chiffre d’affaires par rendez-vous honoré', 'Turnover per attended appointment'), t.caParRdv != null ? eur(t.caParRdv, l) : '–'],
        [T(l, 'Part de nouveaux patients', 'Share of new patients'), t.partNouveaux != null ? pct(t.partNouveaux, l) : '–'],
        [T(l, `Repère horaire (Ameli ${DATA_YEAR} ÷ ORS ${T0.annee_enquete})`, `Hourly benchmark (Ameli ${DATA_YEAR} ÷ ORS ${T0.annee_enquete})`), r != null ? eur(r, l) : '–'],
      ] as [string, string][],
      note: T(l,
        `Le repère divise les honoraires moyens d’un omnipraticien par ${num(T0.heures_an, l)} heures de travail par an, mesurées en ${T0.annee_enquete} dans les Pays de la Loire, temps administratif compris : il sous-estime ce que rapporte une heure de fauteuil. Aucune statistique publique ne donne de taux d’absence des patients chez le dentiste.`,
        `The benchmark divides a general dentist’s average fees by ${num(T0.heures_an, l)} working hours a year, measured in ${T0.annee_enquete} in Pays de la Loire with admin time included, so it understates what a chairside hour earns. No public statistic gives a no-show rate for dentists.`),
    };
  },
});
