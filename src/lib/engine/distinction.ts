/**
 * « Ce qui vous distingue » : constats chiffrés, jamais des conseils. Chaque point compare une saisie
 * à une référence publique et dit l'écart ; aucun point n'est produit quand la référence manque ou
 * quand l'écart reste dans la marge (SEUILS). Testé dans `distinction.test.ts`.
 */
import type { Gap } from './benchmark';
import type { CabinetOut } from './cabinet';
import type { Spec } from './data';
import { formatMoney, formatPercent, formatNumber } from '../format';

export interface Point { code: string; kind: 'fort' | 'surveiller' | 'neutre'; text: { fr: string; en: string } }
export interface DistInput {
  spec: Spec; gDep: Gap | null; gFr: Gap | null; cab: CabinetOut;
  tauxRef: number; refPersonnel: number | null;
  patients: number; refPatients: number | null; parPatient: number | null; refParPatient: number | null;
  /** Part des dépassements saisie (0 = non renseignée) et part publiée pour le département. */
  depPart: number; refDepPart: number | null;
  hn: number;
}
/** Marges sous lesquelles un écart n'est pas commenté. */
export const SEUILS = { honoraires: 0.1, tauxCharges: 0.05, personnel: 0.04, patients: 0.15, parPatient: 0.15, depPart: 0.08 };

const p = (x: number, l: 'fr' | 'en', d = 0) => formatPercent(x, d, l);
const e = (x: number, l: 'fr' | 'en') => formatMoney(x, 0, l);
const n = (x: number, l: 'fr' | 'en') => formatNumber(x, 0, l);
const pts = (x: number, l: 'fr' | 'en') => (l === 'fr' ? `${formatNumber(Math.abs(x) * 100, 0, 'fr')} points` : `${formatNumber(Math.abs(x) * 100, 0, 'en')} points`);

export function distinctions(i: DistInput): Point[] {
  const out: Point[] = [];
  const g = i.gDep ?? i.gFr;
  const zone = i.gDep ? { fr: 'du département', en: 'in your département' } : { fr: 'nationale', en: 'nationally' };
  if (g && Math.abs(g.ratio) >= SEUILS.honoraires) {
    out.push(g.above
      ? { code: 'hono-haut', kind: 'fort', text: { fr: `Vos honoraires comparables dépassent de ${p(g.ratio, 'fr')} la moyenne ${zone.fr} (${e(g.ref, 'fr')}).`, en: `Your comparable fees are ${p(g.ratio, 'en')} above the average ${zone.en} (${e(g.ref, 'en')}).` } }
      : { code: 'hono-bas', kind: 'surveiller', text: { fr: `Vos honoraires comparables sont inférieurs de ${p(-g.ratio, 'fr')} à la moyenne ${zone.fr} (${e(g.ref, 'fr')}). La moyenne porte sur des praticiens actifs toute l’année : à temps partiel, l’écart est attendu.`, en: `Your comparable fees are ${p(-g.ratio, 'en')} below the average ${zone.en} (${e(g.ref, 'en')}). That average covers practitioners active all year: part-time work explains a gap.` } });
  }
  const tc = i.cab.tauxCharges;
  if (tc != null && !i.cab.chargesEstimees && Math.abs(tc - i.tauxRef) >= SEUILS.tauxCharges) {
    const d = tc - i.tauxRef;
    out.push(d < 0
      ? { code: 'charges-bas', kind: 'fort', text: { fr: `Votre taux de charges (${p(tc, 'fr', 1)}) est inférieur de ${pts(d, 'fr')} à la référence de la profession (${p(i.tauxRef, 'fr', 1)}).`, en: `Your cost ratio (${p(tc, 'en', 1)}) is ${pts(d, 'en')} below the profession’s benchmark (${p(i.tauxRef, 'en', 1)}).` } }
      : { code: 'charges-haut', kind: 'surveiller', text: { fr: `Votre taux de charges (${p(tc, 'fr', 1)}) dépasse de ${pts(d, 'fr')} la référence de la profession (${p(i.tauxRef, 'fr', 1)}).`, en: `Your cost ratio (${p(tc, 'en', 1)}) is ${pts(d, 'en')} above the profession’s benchmark (${p(i.tauxRef, 'en', 1)}).` } });
  }
  if (i.cab.partPersonnel != null && i.refPersonnel != null && Math.abs(i.cab.partPersonnel - i.refPersonnel) >= SEUILS.personnel) {
    const d = i.cab.partPersonnel - i.refPersonnel;
    out.push({ code: d > 0 ? 'personnel-haut' : 'personnel-bas', kind: 'neutre', text: { fr: `Le personnel pèse ${p(i.cab.partPersonnel, 'fr', 1)} de vos honoraires, contre ${p(i.refPersonnel, 'fr', 1)} en référence : ${d > 0 ? 'une équipe plus étoffée, qui se juge à ce qu’elle permet de produire' : 'une équipe plus légère que la moyenne'}.`, en: `Staff costs take ${p(i.cab.partPersonnel, 'en', 1)} of your fees, against a ${p(i.refPersonnel, 'en', 1)} benchmark: ${d > 0 ? 'a larger team, to be judged by what it lets you produce' : 'a leaner team than average'}.` } });
  }
  if (i.patients > 0 && i.refPatients && Math.abs(i.patients / i.refPatients - 1) >= SEUILS.patients) {
    const r = i.patients / i.refPatients - 1;
    out.push({ code: r > 0 ? 'patients-haut' : 'patients-bas', kind: 'neutre', text: { fr: `Vous voyez ${n(i.patients, 'fr')} patients différents, ${p(Math.abs(r), 'fr')} ${r > 0 ? 'de plus' : 'de moins'} que la moyenne publiée (${n(i.refPatients, 'fr')}).`, en: `You see ${n(i.patients, 'en')} different patients, ${p(Math.abs(r), 'en')} ${r > 0 ? 'more' : 'fewer'} than the published average (${n(i.refPatients, 'en')}).` } });
  }
  if (i.parPatient != null && i.refParPatient && Math.abs(i.parPatient / i.refParPatient - 1) >= SEUILS.parPatient) {
    const r = i.parPatient / i.refParPatient - 1;
    out.push({ code: r > 0 ? 'panier-haut' : 'panier-bas', kind: r > 0 ? 'fort' : 'neutre', text: { fr: `Honoraires par patient : ${e(i.parPatient, 'fr')}, contre ${e(i.refParPatient, 'fr')} en moyenne dans le département (${r > 0 ? '+' : '−'}${p(Math.abs(r), 'fr')}).`, en: `Fees per patient: ${e(i.parPatient, 'en')}, against ${e(i.refParPatient, 'en')} on average in the département (${r > 0 ? '+' : '−'}${p(Math.abs(r), 'en')}).` } });
  }
  if (i.depPart > 0 && i.refDepPart != null && Math.abs(i.depPart - i.refDepPart) >= SEUILS.depPart) {
    const d = i.depPart - i.refDepPart;
    out.push({ code: d > 0 ? 'dep-haut' : 'dep-bas', kind: 'neutre', text: { fr: `Les dépassements font ${p(i.depPart, 'fr')} de vos honoraires, contre ${p(i.refDepPart, 'fr')} pour les confrères : activité ${d > 0 ? 'plus tournée vers la prothèse et les actes à honoraires libres' : 'plus proche des soins au tarif de convention'}.`, en: `Extra fees make up ${p(i.depPart, 'en')} of your fees, against ${p(i.refDepPart, 'en')} for peers: a mix ${d > 0 ? 'weighted towards prosthetics and freely priced work' : 'closer to care at agreed tariffs'}.` } });
  }
  if (i.hn >= 0.25) {
    out.push({ code: 'hn-fort', kind: 'neutre', text: { fr: `Avec ${p(i.hn, 'fr')} d’actes non remboursables, une large part de votre activité échappe aux statistiques de l’Assurance Maladie : la comparaison ne porte que sur le reste.`, en: `With ${p(i.hn, 'en')} non-reimbursable work, much of your activity is outside health insurance statistics: the comparison covers only the rest.` } });
  }
  return out;
}
