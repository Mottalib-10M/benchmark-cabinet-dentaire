/**
 * Parties générées d'une page département, calculées depuis le jeu de données Ameli : titre et
 * description calibrés (RECETTE §11), chapeau, bloc citable (§21) et FAQ. Les phrases sont
 * choisies par la donnée (écart à la moyenne, densité, âge, orthodontie publiée ou non), mais ces
 * blocs restent un gabarit : ils sont marqués `data-chrome` dans la page (RECETTE §6.4) et le texte
 * propre au département vit dans `src/content/departements/<code>.ts`.
 */
import { YEAR } from '../data/site-config';
import { DEPS, FR, REGS, DATA_YEAR, type Stat } from './engine/data';
import { depRank, depShare, growth } from './engine/benchmark';
import { dansDep, deDep, dansReg, regLabel } from './dep-fr';
import { formatMoney, formatNumber, formatPercent } from './format';
import type { FAQItem } from './seo';

type L = 'fr' | 'en';
const eur = (x: number, l: L) => formatMoney(x, 0, l);
const pct = (x: number, l: L, d = 0) => formatPercent(x, d, l);
const num = (x: number, l: L, d = 0) => formatNumber(x, d, l);

/** Premier candidat dont la longueur tombe dans [min, max] ; sinon erreur au build. */
export function fit(cands: string[], min: number, max: number, what: string): string {
  const ok = cands.find((c) => c.length >= min && c.length <= max);
  if (!ok) throw new Error(`${what} : aucun candidat dans ${min}-${max} (${cands.map((c) => c.length).join(', ')})`);
  return ok;
}

export interface DepGen { title: string; description: string; h1: string; intro: string; resume: string; faqs: FAQItem[] }

const ecartMot = (a: number, b: number, l: L) => {
  const r = a / b - 1;
  if (Math.abs(r) < 0.02) return l === 'fr' ? 'au niveau de la moyenne nationale' : 'in line with the national average';
  return l === 'fr' ? `${pct(Math.abs(r), l)} ${r > 0 ? 'au-dessus' : 'en dessous'} de la moyenne nationale` : `${pct(Math.abs(r), l)} ${r > 0 ? 'above' : 'below'} the national average`;
};

export function depGen(code: string, l: L): DepGen {
  const z = DEPS[code]; const n = z.name; const Y = DATA_YEAR;
  const o = z.p.omni as Stat; const odf = z.p.odf;
  const reg = z.region ? REGS[z.region] : undefined; const regName = regLabel(reg?.name ?? '');
  const fo = FR.p.omni as Stat; const fodf = FR.p.odf as Stat;
  const r = depRank('omni', code)!;
  const odfOk = !!odf?.tot;
  const g = growth(o, 2019, Y);
  if (l === 'fr') {
    const title = fit([
      `Honoraires dentistes ${n} ${YEAR} : moyenne et orthodontistes`,
      `Honoraires dentistes ${n} ${YEAR} : moyennes et simulateur`,
      `Honoraires dentistes ${n} ${YEAR} : moyenne et simulateur`,
      `Honoraires dentistes ${n} ${YEAR} : moyennes, simulateur`,
      `Dentistes ${n} : honoraires moyens ${YEAR}, simulateur`,
      `Dentistes ${n} : honoraires ${YEAR} et simulateur`,
      `Dentistes ${n} ${YEAR} : honoraires moyens`,
    ], 50, 60, `titre ${code}`);
    const base = `En ${Y}, un chirurgien-dentiste omnipraticien ${dansDep(code)} a perçu ${eur(o.tot!, l)} d'honoraires en moyenne (France : ${eur(fo.tot!, l)}).`;
    const description = fit([
      ...[' Orthodontistes, densité, évolution sur dix ans et simulateur de cabinet gratuit.', ' Orthodontistes, densité, dix ans d’historique et simulateur gratuit.', ' Orthodontistes, densité, historique et simulateur de cabinet gratuit.', ' Orthodontistes, densité, historique et simulateur gratuit.', ' Orthodontistes, densité et simulateur de cabinet gratuit.', ' Orthodontistes, densité, âge et simulateur gratuit.', ' Orthodontistes, densité et simulateur gratuit.', ' Densité, âge des praticiens et simulateur gratuit.', ' Orthodontistes et simulateur gratuit.', ' Comparez votre cabinet gratuitement.', ' Densité et simulateur gratuit.', ' Orthodontistes et densité.', ' Comparez votre cabinet.', ' Simulateur gratuit.', ' Densité, historique.', ' Simulateur.'].map((x) => base + x),
      base,
], 150, 160, `description ${code}`);
    const h1 = `Honoraires des chirurgiens-dentistes ${dansDep(code)}`;
    const intro = `${num(o.eff!, l)} omnipraticiens libéraux${odf?.eff ? `, ${num(odf.eff, l)} orthodontistes` : ''} : leurs honoraires moyens ${Y}, et le vôtre en face.`;
    const s1 = `Les chirurgiens-dentistes omnipraticiens ${deDep(code)} ont perçu en ${Y} ${eur(o.tot!, l)} d'honoraires en moyenne par praticien actif à part entière, ${ecartMot(o.tot!, fo.tot!, l)} (${eur(fo.tot!, l)}), ce qui place le département au ${r.rank === 1 ? '1er' : `${r.rank}e`} rang sur ${r.total}.`;
    const s2 = `Sur ce montant, ${eur(o.dep!, l)} sont des dépassements, c'est-à-dire la part facturée au-delà des tarifs de convention, surtout en prothèse : ${pct(depShare(o)!, l)} des honoraires, contre ${pct(depShare(fo)!, l)} en France.`;
    const s3 = `Le département compte ${num(o.dens!, l)} omnipraticiens pour 100 000 habitants (France : ${num(fo.dens!, l)})${o.p60 != null ? ` et ${pct(o.p60, l)} d'entre eux ont 60 ans ou plus` : ''}.`;
    const s4 = odfOk ? `Les ${num(odf!.eff!, l)} orthodontistes qualifiés en orthopédie dento-faciale y ont perçu ${eur(odf!.tot!, l)} en moyenne, pour ${eur(fodf.tot!, l)} au niveau national.` : `L'Assurance Maladie ne publie pas de moyenne pour les orthodontistes du département ${odf?.eff ? `(${num(odf.eff, l)} praticiens)` : ''} : le secret statistique s'applique sous cinq praticiens actifs à part entière.`;
    const s5 = g != null ? `Entre 2019 et ${Y}, les honoraires moyens des omnipraticiens ont évolué de ${g >= 0 ? '+' : '−'}${pct(Math.abs(g), l, 1)}.` : '';
    const s6 = `Ces chiffres sont des moyennes de l'Assurance Maladie, pas un revenu : les charges du cabinet, de l'ordre de la moitié des recettes, restent à déduire, et les actes non remboursables comme les implants n'y figurent pas.`;
    const resume = [s1, s2, s3, s4, s5, s6].filter(Boolean).join(' ').replace(/\s+/g, ' ');
    const faqs: FAQItem[] = [
      { q: `Quels honoraires moyens pour un dentiste ${dansDep(code)} en ${Y} ?`, a: `${eur(o.tot!, l)} par omnipraticien actif à part entière en ${Y}, dont ${eur(o.hsd!, l)} au tarif de convention et ${eur(o.dep!, l)} de dépassements, selon l'open data de l'Assurance Maladie. La moyenne ${dansReg(z.region)} est de ${reg?.p.omni?.tot ? eur(reg.p.omni.tot, l) : 'non publiée'}, celle de la France de ${eur(fo.tot!, l)}. Ce sont des honoraires, avant charges et cotisations.` },
      odfOk
        ? { q: `Combien d'orthodontistes exercent ${dansDep(code)}, et pour quels honoraires ?`, a: `${num(odf!.eff!, l)} spécialistes en orthopédie dento-faciale exercent en libéral ${dansDep(code)} fin ${Y}. Leurs honoraires moyens atteignent ${eur(odf!.tot!, l)}, dont ${pct(depShare(odf!)!, l)} de dépassements, contre ${eur(fodf.tot!, l)} pour l'ensemble des orthodontistes de France. Les traitements d'orthodontie se facturent en grande partie au-delà de la base de remboursement, d'où ce poids des dépassements.` }
        : { q: `Pourquoi les honoraires des orthodontistes ${deDep(code)} ne sont-ils pas publiés ?`, a: `L'Assurance Maladie applique le secret statistique : aucun montant n'est diffusé quand moins de cinq praticiens actifs à part entière sont concernés${odf?.eff ? `, et le département compte ${num(odf.eff, l)} orthodontistes libéraux` : ''}. Le simulateur compare alors un orthodontiste à la moyenne ${dansReg(z.region)} et à la moyenne nationale, qui est de ${eur(fodf.tot!, l)} en ${Y}.` },
      { q: `Y a-t-il assez de chirurgiens-dentistes ${dansDep(code)} ?`, a: `Avec ${num(o.dens!, l)} omnipraticiens libéraux pour 100 000 habitants, le département se situe ${o.dens! >= fo.dens! ? 'au-dessus' : 'en dessous'} de la moyenne française de ${num(fo.dens!, l)}. ${o.p60 != null ? `${pct(o.p60, l)} des praticiens ont 60 ans ou plus (France : ${pct(fo.p60!, l)}), ` : ''}${o.eff5 ? `et l'effectif est passé de ${num(o.eff5, l)} à ${num(o.eff!, l)} en cinq ans.` : ''} Une densité basse va souvent avec des honoraires moyens plus élevés par praticien.` },
    ];
    return { title, description, h1, intro, resume, faqs };
  }
  const title = fit([
    `Dentist fees ${n} ${YEAR}: averages, orthodontists, benchmark`,
    `Dentist fees ${n} ${YEAR}: averages and orthodontists`,
    `Dentist fees ${n} ${YEAR}: averages and benchmark tool`,
    `Dentist fees ${n} ${YEAR}: averages, benchmark`,
    `Dentist fees in ${n} ${YEAR}: averages`,
    `Dentist fees ${n} ${YEAR}: averages`,
  ], 50, 60, `title ${code}`);
  const base = `In ${Y}, a general dentist in ${n} billed ${eur(o.tot!, l)} in fees on average (France: ${eur(fo.tot!, l)}).`;
  const description = fit([
    ...[' Orthodontists, density, ten years of history and a free practice benchmark tool.', ' Orthodontists, density, ten-year history and a free practice benchmark.', ' Orthodontists, density, history and a free practice benchmark.', ' Orthodontists, density, history and a free benchmark tool.', ' Orthodontists, density and a free practice benchmark.', ' Orthodontists, density, age and a free benchmark.', ' Orthodontists, density and a free benchmark.', ' Density, dentists’ ages and a free benchmark.', ' Orthodontists and a free benchmark.', ' Benchmark your practice for free.', ' Density and a free benchmark.', ' Orthodontists and density.', ' Benchmark your practice.', ' Free benchmark tool.', ' Density, history.', ' Free tool.'].map((x) => base + x),
    base,
], 150, 160, `description ${code}`);
  const h1 = `Dentists’ fees in ${n}`;
  const intro = `${num(o.eff!, l)} general dentists in private practice${odf?.eff ? `, ${num(odf.eff, l)} orthodontists` : ''}: their ${Y} average fees, and yours alongside.`;
  const s1 = `General dentists in ${n} (${regName}) billed ${eur(o.tot!, l)} in fees on average in ${Y} per full-time active practitioner, ${ecartMot(o.tot!, fo.tot!, l)} (${eur(fo.tot!, l)}), which ranks the département ${r.rank} out of ${r.total}.`;
  const s2 = `Of that amount, ${eur(o.dep!, l)} is extra fees (dépassements), the part charged above the national health insurance tariffs, mostly on crowns and other prosthetics: ${pct(depShare(o)!, l)} of fees, against ${pct(depShare(fo)!, l)} across France.`;
  const s3 = `There are ${num(o.dens!, l)} general dentists per 100,000 residents (France: ${num(fo.dens!, l)})${o.p60 != null ? `, and ${pct(o.p60, l)} of them are aged 60 or over` : ''}.`;
  const s4 = odfOk ? `The ${num(odf!.eff!, l)} orthodontists qualified in dentofacial orthopaedics (ODF) billed ${eur(odf!.tot!, l)} on average, against ${eur(fodf.tot!, l)} nationally.` : `Assurance Maladie publishes no orthodontist average for the département${odf?.eff ? ` (${num(odf.eff, l)} practitioners)` : ''}: statistical confidentiality applies below five full-time active practitioners.`;
  const s5 = g != null ? `Between 2019 and ${Y}, general dentists’ average fees moved by ${g >= 0 ? '+' : '−'}${pct(Math.abs(g), l, 1)}.` : '';
  const s6 = `These are health insurance averages, not take-home pay: practice costs, roughly half of receipts, still come off, and non-reimbursable work such as implants is not included.`;
  const resume = [s1, s2, s3, s4, s5, s6].filter(Boolean).join(' ').replace(/\s+/g, ' ');
  const faqs: FAQItem[] = [
    { q: `What do dentists in ${n} bill on average in ${Y}?`, a: `${eur(o.tot!, l)} per full-time active general dentist in ${Y}: ${eur(o.hsd!, l)} at agreed tariffs plus ${eur(o.dep!, l)} in extra fees, according to Assurance Maladie open data. The ${regName} average is ${reg?.p.omni?.tot ? eur(reg.p.omni.tot, l) : 'not published'} and the French average ${eur(fo.tot!, l)}. These are fees, before practice costs and social contributions.` },
    odfOk
      ? { q: `How many orthodontists practise in ${n}, and what do they bill?`, a: `${num(odf!.eff!, l)} orthodontic specialists (ODF) were in private practice in ${n} at the end of ${Y}. Their average fees reach ${eur(odf!.tot!, l)}, of which ${pct(depShare(odf!)!, l)} is extra fees, against ${eur(fodf.tot!, l)} for all orthodontists in France. Orthodontic treatment is largely billed above the reimbursement base, hence the weight of extra fees.` }
      : { q: `Why are orthodontists’ fees in ${n} not published?`, a: `Assurance Maladie applies statistical confidentiality: no amount is released when fewer than five full-time active practitioners are concerned${odf?.eff ? `, and the département has ${num(odf.eff, l)} orthodontists in private practice` : ''}. The calculator then compares an orthodontist with the ${regName} average and the national one, ${eur(fodf.tot!, l)} in ${Y}.` },
    { q: `Is ${n} short of dentists?`, a: `With ${num(o.dens!, l)} general dentists in private practice per 100,000 residents, the département sits ${o.dens! >= fo.dens! ? 'above' : 'below'} the French average of ${num(fo.dens!, l)}. ${o.p60 != null ? `${pct(o.p60, l)} of practitioners are 60 or older (France: ${pct(fo.p60!, l)})` : ''}${o.eff5 ? `, and headcount moved from ${num(o.eff5, l)} to ${num(o.eff!, l)} in five years.` : '.'} Low density often goes with higher average fees per practitioner.` },
  ];
  return { title, description, h1, intro, resume, faqs };
}
