import { P } from '../engine/params';
import { coutEmployeur, brutMinimal } from '../engine/employeur';
import { T, eur, num, type L } from './_kit';
const S = P.salaires_2026;
const EMPLOIS = ['assistant_dentaire', 'aide_dentaire', 'secretaire_technique', 'receptionniste'] as const;
/** Coût employeur d'un salarié de cabinet au minimum conventionnel 2026 ou au salaire saisi. */
export default (l: L) => ({
  title: T(l, 'Coût d’un salarié pour le cabinet', 'What an employee costs the practice'),
  cta: T(l, 'Mesurer le poids du personnel', 'Measure staff costs against fees'),
  inputs: [
    { id: 'e', label: T(l, 'Emploi (grille 2026)', 'Job (2026 pay scale)'), def: 0, options: [T(l, 'Assistant(e) dentaire', 'Dental nurse (assistant dentaire)'), T(l, 'Aide dentaire', 'Dental aide'), T(l, 'Secrétaire technique', 'Practice secretary'), T(l, 'Réceptionniste', 'Receptionist')].map((x, i) => ({ value: String(i), label: x })) },
    { id: 'h', label: T(l, 'Heures par mois', 'Hours per month'), def: 151.67, max: 200, decimals: 2 },
    { id: 'p', label: T(l, 'Supplément au-dessus du minimum', 'Pay above the minimum'), def: 0, unit: T(l, '€/mois', '€/month'), max: 2000 },
  ],
  run: ({ e, h, p }: Record<string, number>) => {
    const emploi = EMPLOIS[Math.min(3, Math.max(0, Math.round(e)))];
    const heures = Math.max(0, h);
    const mini = brutMinimal(emploi, heures);
    const c = coutEmployeur(mini + Math.max(0, p), heures);
    return {
      head: [T(l, 'Coût mensuel pour le cabinet', 'Monthly cost to the practice'), eur(c.cout, l)],
      rows: [
        [T(l, `Brut (minimum ${num(Math.max(S.horaire[emploi], S.smic_horaire), l, 2)} €/h)`, `Gross (minimum €${num(Math.max(S.horaire[emploi], S.smic_horaire), l, 2)}/h)`), eur(c.brut, l)],
        [T(l, 'Cotisations patronales', 'Employer contributions'), `+ ${eur(c.cotisations, l)}`],
        [T(l, 'Réduction générale (RGDU)', 'General relief (RGDU)'), `− ${eur(c.rgdu, l)}`],
        [T(l, 'Coût annuel', 'Annual cost'), eur(c.coutAnnuel, l)],
      ] as [string, string][],
      note: T(l, 'Accidents du travail : part mutualisée seulement. Hors prévoyance, mutuelle de branche, primes et mentions complémentaires.', 'Workplace accidents: pooled share only. Excludes sector insurance schemes, bonuses and extra qualification allowances.'),
    };
  },
});
