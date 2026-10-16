import { depsBelow, classement, depRank } from '../engine/benchmark';
import { FR, DEPS, DEP_CODES, depName, type Spec } from '../engine/data';
import { T, eur, num, type L } from './_kit';
/**
 * Où tomberait un montant d'honoraires dans le classement des moyennes départementales, et ce que
 * publie le département choisi : les 101 départements, y compris ceux sans page propre (RECETTE §3).
 */
const SP: Spec[] = ['omni', 'odf', 'stomato'];
const PARIS = DEP_CODES.indexOf('75');
export default (l: L) => ({
  title: T(l, 'Vos honoraires dans le classement des départements', 'Your fees in the ranking of départements'),
  cta: T(l, 'Comparer tout le cabinet', 'Benchmark the whole practice'),
  inputs: [
    { id: 's', label: T(l, 'Spécialité', 'Specialty'), def: 0, options: [T(l, 'Omnipraticien', 'General dentist'), T(l, 'Orthodontiste', 'Orthodontist'), T(l, 'Stomatologue', 'Stomatologist')].map((x, i) => ({ value: String(i), label: x })) },
    { id: 'd', label: T(l, 'Votre département', 'Your département'), def: PARIS, options: DEP_CODES.map((c, i) => ({ value: String(i), label: `${c} · ${depName(c)}` })) },
    { id: 'h', label: T(l, 'Vos honoraires annuels', 'Your annual fees'), def: 320000, unit: '€', max: 10_000_000 },
  ],
  run: ({ s, d, h }: Record<string, number>) => {
    const spec = SP[Math.min(2, Math.max(0, Math.round(s)))];
    const code = DEP_CODES[Math.min(DEP_CODES.length - 1, Math.max(0, Math.round(d)))];
    const b = depsBelow(spec, h); const c = classement(spec);
    const moy = DEPS[code]?.p[spec]?.tot; const r = depRank(spec, code);
    return {
      head: [T(l, 'Départements dont la moyenne est sous la vôtre', 'Départements whose average is below yours'), `${num(b.below, l)} / ${num(b.total, l)}`],
      rows: [
        [T(l, `Moyenne ${depName(code)}`, `${depName(code)} average`), moy ? eur(moy, l) : T(l, 'non publiée', 'not published')],
        [T(l, `Rang ${depName(code)}`, `${depName(code)} rank`), r ? `${num(r.rank, l)} / ${num(r.total, l)}` : '–'],
        [T(l, 'Moyenne France', 'France average'), eur(FR.p[spec]!.tot!, l)],
        [T(l, `Plus haute : ${depName(c[0].code)}`, `Highest: ${depName(c[0].code)}`), eur(c[0].tot, l)],
        [T(l, `Plus basse : ${depName(c[c.length - 1].code)}`, `Lowest: ${depName(c[c.length - 1].code)}`), eur(c[c.length - 1].tot, l)],
      ] as [string, string][],
      note: T(l, 'Comparaison entre moyennes départementales 2025, pas un percentile de praticiens. « Non publiée » : secret statistique (moins de 5 praticiens).', 'A comparison between 2025 département averages, not a percentile of practitioners. “Not published”: statistical confidentiality (fewer than 5 practitioners).'),
    };
  },
});
