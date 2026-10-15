import { cotisationsCarcdsf } from '../engine/carcdsf';
import { T, eur, type L } from './_kit';
/** Cotisations CARCDSF 2026 d'un chirurgien-dentiste. */
export default (l: L) => ({
  title: T(l, 'Vos cotisations CARCDSF 2026', 'Your 2026 CARCDSF contributions'),
  cta: T(l, 'Estimer votre bénéfice', 'Estimate your profit'),
  inputs: [{ id: 'r', label: T(l, 'Revenu professionnel 2025', '2025 professional income'), def: 100000, unit: '€', max: 5_000_000 }],
  run: ({ r }: Record<string, number>) => {
    const c = cotisationsCarcdsf(r);
    return {
      head: [T(l, 'Total annuel', 'Annual total'), eur(c.total, l)],
      rows: [
        [T(l, 'Retraite de base', 'Basic pension'), eur(c.rbl, l)],
        [T(l, 'Retraite complémentaire', 'Supplementary pension'), eur(c.rc, l)],
        [T(l, 'Prestation complémentaire de vieillesse (votre part)', 'PCV supplementary benefit (your share)'), eur(c.pcv, l)],
        [T(l, 'Invalidité-décès et indemnités journalières', 'Invalidity, death and daily benefits'), eur(c.rid, l)],
      ] as [string, string][],
      note: T(l, 'Barème CARCDSF 2026, praticien conventionné. Hors cotisations Urssaf (maladie, allocations familiales, CSG-CRDS).', '2026 CARCDSF scale, practitioner under the agreement. Excludes Urssaf contributions (health, family, CSG-CRDS).'),
    };
  },
});
