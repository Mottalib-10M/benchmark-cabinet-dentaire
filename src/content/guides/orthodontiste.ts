import { YEAR } from '../../data/site-config';
import { defineGuide, type Helpers } from '../../lib/guide-types';
import { classement, depShare, growth, effGrowth, depRank } from '../../lib/engine/benchmark';
import { FR, DEPS, DEP_CODES, DATA_YEAR, depName } from '../../lib/engine/data';
import { reference, UNASA_YEAR } from '../../lib/engine/references';
import { P } from '../../lib/engine/params';
import { dansDep } from '../../lib/dep-fr';
import { formatMoney, formatNumber, formatPercent } from '../../lib/format';
import unasa from '../../data/unasa.json';

type L = 'fr' | 'en';
const Y = DATA_YEAR;
const d = FR.p.odf!;
const o = FR.p.omni!;
const c = classement('odf');
const hi = c[0], lo = c[c.length - 1];
const secret = DEP_CODES.length - c.length;
const g10 = growth(d, 2015, Y)!;
const g1 = growth(d, Y - 1, Y)!;
const g19 = growth(d, 2019, Y)!;
const gEff = effGrowth(d)!;
const part = depShare(d)!;
const partOmni = depShare(o)!;
const ratio = d.tot! / o.tot!;
const D = P.revenus.drees;
const CNS = P.depense;
const RP = P.specialites_rpps;
const ref = reference('odf');
const refOmni = reference('omni');
type T = { echantillon: number; lignes: Record<string, number[]> };
const U = unasa as unknown as Record<string, T>;
const prev = U[`851EAB_${UNASA_YEAR - 1}`];
const pv = (row: string) => Number(prev.lignes[row][0]);
const prevRef = {
  echantillon: prev.echantillon, recettes: pv('Montant net des recettes'), benefice: pv('Bénéfice comptable'),
  personnel: pv('Charges de personnel') / 100, achats: pv('Achats') / 100, loyer: pv('Loyers et charges locatives') / 100,
  cotisPerso: (pv('Charges sociales personnelles') + pv('CSG déductible')) / 100, marge: pv('Bénéfice (%)') / 100,
};
const e = (x: number, l: L) => formatMoney(x, 0, l);
const n = (x: number, l: L) => formatNumber(x, 0, l);
const p = (x: number, l: L, k = 1) => formatPercent(x, k, l);
const nbD = (code: string) => DEPS[code].p.odf!;
const pa = DEPS['75'].p.odf!;
const paRank = depRank('odf', '75')!;
const tableCote = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const r = (lab: string, f: (s: typeof d) => string) => [lab, f(d), f(o)];
  return h.table(fr ? ['', 'Orthodontistes', 'Omnipraticiens'] : ['', 'Orthodontists', 'General dentists'], [
    r(fr ? 'Honoraires totaux moyens' : 'Average total fees', (s) => h.eur(s.tot!)),
    r(fr ? 'dont sans dépassement' : 'of which at regulated rate', (s) => h.eur(s.hsd!)),
    r(fr ? 'dont dépassements' : 'of which extra-billing', (s) => h.eur(s.dep!)),
    r(fr ? 'Libéraux' : 'In private practice', (s) => h.num(s.eff!)),
    r(fr ? 'Pour 100 000 habitants' : 'Per 100,000 residents', (s) => h.num(s.dens!, 1)),
    r(fr ? 'Patients différents dans l’année' : 'Different patients in the year', (s) => h.num(s.patients!)),
    r(fr ? 'Évolution des honoraires depuis 2015' : 'Fee growth since 2015', (s) => h.pct(growth(s, 2015, Y)!)),
  ], fr ? `France entière, ${Y}, Assurance Maladie.` : `France, ${Y}, Assurance Maladie.`, ['l', 'r', 'r']);
};

const tableComptes = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const head = fr ? ['', `Orthodontistes ${UNASA_YEAR - 1}`, `Orthodontistes ${UNASA_YEAR}`, `Chirurgiens-dentistes ${UNASA_YEAR}`] : ['', `Orthodontists ${UNASA_YEAR - 1}`, `Orthodontists ${UNASA_YEAR}`, `Dentists ${UNASA_YEAR}`];
  const rows = [
    [fr ? 'Cabinets dans l’échantillon' : 'Practices in sample', h.num(prevRef.echantillon), h.num(ref.echantillon), h.num(refOmni.echantillon)],
    [fr ? 'Recettes nettes moyennes' : 'Average net receipts', h.eur(prevRef.recettes), h.eur(ref.recettes), h.eur(refOmni.recettes)],
    [fr ? 'Personnel' : 'Staff', h.pct(prevRef.personnel), h.pct(ref.personnel), h.pct(refOmni.personnel)],
    [fr ? 'Achats' : 'Purchases', h.pct(prevRef.achats), h.pct(ref.achats), h.pct(refOmni.achats)],
    [fr ? 'Loyer et charges locatives' : 'Rent and service charges', h.pct(prevRef.loyer), h.pct(ref.loyer), h.pct(refOmni.loyer)],
    [fr ? 'Cotisations personnelles et CSG' : 'Own contributions and CSG', h.pct(prevRef.cotisPerso), h.pct(ref.cotisPerso), h.pct(refOmni.cotisPerso)],
    [fr ? 'Bénéfice en part des recettes' : 'Profit as share of receipts', h.pct(prevRef.marge), h.pct(1 - ref.taux), h.pct(1 - refOmni.taux)],
    [fr ? 'Bénéfice moyen' : 'Average profit', h.eur(prevRef.benefice), h.eur(ref.benefice), h.eur(refOmni.benefice)],
  ];
  return h.table(head, rows, fr ? 'Comptes des adhérents UNASA en BNC : orthodontistes (code 851EAB) et chirurgiens-dentistes (851EAA).' : 'Accounts of UNASA members taxed under BNC: orthodontists (code 851EAB) and dentists (851EAA).', ['l', 'r', 'r', 'r']);
};
const tableDeps = (h: Helpers) => {
  const fr = h.lang === 'fr';
  const pick = [...c.slice(0, 5), ...c.slice(-5)];
  return h.table(fr ? ['Département', 'Orthodontistes libéraux', 'Pour 100 000 hab.', 'Honoraires moyens'] : ['Département', 'Orthodontists in private practice', 'Per 100,000', 'Average fees'],
    pick.map((x) => [depName(x.code), h.num(nbD(x.code).eff!), h.num(nbD(x.code).dens!, 1), h.eur(x.tot)]),
    fr ? `Les cinq moyennes les plus hautes et les cinq plus basses en ${Y}, parmi les ${h.num(c.length)} départements publiés.` : `The five highest and five lowest ${Y} averages among the ${h.num(c.length)} départements published.`, ['l', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'orthodontiste',
  group: 'specialites',
  order: 20,
  tool: 'benchmark',
  spec: 'odf',
  related: ['omnipraticien', 'classement-departements', 'salaire-assistante-dentaire', 'selarl-ou-bnc', 'revenu-dentiste'],
  sources: ['ameliHonoraires', 'ameliEffectifs', 'ameliPatientele', 'unasa', 'dreesCns', 'rpps', 'dreesRevenus'],
  fr: {
    slug: 'honoraires-orthodontiste',
    nav: 'Orthodontiste',
    card: `Honoraires moyens ${Y} des orthodontistes, poids des dépassements, départements et comptes de cabinets.`,
    title: `Honoraires orthodontiste ${YEAR} : moyennes Ameli et cabinets`,
    description: `Un orthodontiste libéral a facturé ${e(d.tot!, 'fr')} d'honoraires en moyenne en ${Y}, dont ${p(part, 'fr', 0)} de dépassements : écarts entre départements, évolution, comptes UNASA.`,
    h1: 'Honoraires de l’orthodontiste libéral',
    intro: `Les chiffres ${Y} de l'Assurance Maladie pour l'orthodontie dento-faciale (ODF), et leurs limites.`,
    resume: `En ${Y}, un orthodontiste libéral, spécialiste qualifié en orthopédie dento-faciale (ODF), a facturé en moyenne ${e(d.tot!, 'fr')} d'honoraires, ${n(ratio * 100, 'fr')} % de la moyenne d'un omnipraticien. Les dépassements en font ${p(part, 'fr')}, soit ${e(d.dep!, 'fr')}, contre ${e(d.hsd!, 'fr')} au tarif de convention : c'est l'inverse de l'omnipratique, où le tarif de base domine. La spécialité compte ${n(d.eff!, 'fr')} libéraux, ${n(d.dens!, 'fr')} pour 100 000 habitants, un effectif en recul de ${p(-gEff, 'fr')} en cinq ans. La moyenne a progressé de ${p(g10, 'fr')} depuis 2015. ${n(secret, 'fr')} départements n'ont aucun chiffre publié, faute d'au moins cinq praticiens. Côté gestion, l'UNASA ne suit que ${n(ref.echantillon, 'fr')} cabinets d'orthodontistes en ${UNASA_YEAR} : une référence fragile, à lire avec prudence. L'orthodontie de l'adulte non remboursée n'entre pas dans ces moyennes.`,
    faqs: [
      { q: 'Combien facture un orthodontiste en moyenne par an ?', a: `${e(d.tot!, 'fr')} d'honoraires en ${Y} par orthodontiste actif à part entière, d'après l'Assurance Maladie, dont ${e(d.dep!, 'fr')} de dépassements. C'est un montant facturé avant toute charge : personnel, loyer, matériel, cotisations. Dans les comptes ${UNASA_YEAR} des cabinets suivis par l'UNASA, le bénéfice moyen représente ${p(1 - ref.taux, 'fr')} des recettes, sur un échantillon de ${n(ref.echantillon, 'fr')} cabinets seulement.` },
      { q: 'Pourquoi les dépassements sont-ils si élevés en orthodontie ?', a: `En ${Y}, ils font ${p(part, 'fr')} des honoraires des orthodontistes, contre ${p(partOmni, 'fr')} chez les omnipraticiens. Autrement dit, l'essentiel de ce que facture un orthodontiste se situe au-delà du tarif de base de la Sécurité sociale. La DREES estime que l'orthodontie pèse ${p(CNS.structure.orthodontie, 'fr', 0)} de la dépense de soins dentaires en ${CNS.annee}. Les traitements d'adultes, hors nomenclature, ne sont pas comptés.` },
      { q: 'Combien y a-t-il d’orthodontistes en France ?', a: `L'Assurance Maladie compte ${n(d.eff!, 'fr')} orthodontistes libéraux en ${Y}, contre ${n(d.eff5!, 'fr')} cinq ans plus tôt. L'annuaire RPPS recense ${n(RP.odf, 'fr')} chirurgiens-dentistes qualifiés en orthopédie dento-faciale, tous modes d'exercice confondus : les deux chiffres n'ont pas le même périmètre. Rapporté à la population, cela fait ${n(d.dens!, 'fr')} orthodontistes libéraux pour 100 000 habitants.` },
      { q: 'Existe-t-il une statistique de revenu propre aux orthodontistes ?', a: `Non. La DREES publie le revenu des chirurgiens-dentistes libéraux sans isoler l'orthodontie : ${e(D.moyen, 'fr')} en moyenne en ${D.annee}, toutes spécialités dentaires confondues. Le seul repère propre à la spécialité vient des comptes UNASA, ${e(ref.benefice, 'fr')} de bénéfice moyen en ${UNASA_YEAR}, mais sur ${n(ref.echantillon, 'fr')} cabinets, un échantillon trop petit pour être représentatif.` },
      { q: 'Dans quels départements ne trouve-t-on pas de moyenne pour l’orthodontie ?', a: `Dans ${n(secret, 'fr')} départements sur ${n(DEP_CODES.length, 'fr')}, l'Assurance Maladie ne publie rien : moins de cinq orthodontistes y exercent en libéral, et le secret statistique s'applique. Ce sont surtout des départements ruraux, avec plusieurs départements d'outre-mer. Le simulateur compare alors votre cabinet à la moyenne de la région et à celle de la France.` },
      { q: 'Les orthodontistes parisiens facturent-ils plus que la moyenne ?', a: `Non, nettement moins. Paris affiche ${e(pa.tot!, 'fr')} d'honoraires moyens par orthodontiste en ${Y}, ${paRank.rank}e rang sur ${n(paRank.total, 'fr')} départements publiés, pour une moyenne nationale de ${e(d.tot!, 'fr')}. La capitale compte ${formatNumber(pa.dens!, 1, 'fr')} orthodontistes libéraux pour 100 000 habitants, contre ${formatNumber(d.dens!, 1, 'fr')} en France, et ${p(pa.mixte!, 'fr', 0)} y combinent libéral et salariat.` },
      { q: 'Un orthodontiste voit-il plus de patients qu’un dentiste généraliste ?', a: `Oui, en nombre de personnes. La patientèle moyenne d'un orthodontiste libéral atteint ${n(d.patients!, 'fr')} patients différents en ${Y}, contre ${n(o.patients!, 'fr')} pour un omnipraticien, selon l'Assurance Maladie. Un traitement d'orthodontie s'étale sur plusieurs semestres : le même patient revient souvent, et il n'est compté qu'une fois par année.` },
    ],
    body: (h) => `
<h2>${h.pct(part, 0)} de dépassements</h2>
<p>Sur ${h.eur(d.tot!)} d'honoraires moyens en ${Y}, ${h.eur(d.hsd!)} relèvent du tarif de convention et ${h.eur(d.dep!)} des dépassements. Le rapport est inversé par rapport à l'omnipratique, où les dépassements ne font que ${h.pct(partOmni)} du total. Tout ce qui est facturé au-delà du tarif de base de la Sécurité sociale entre dans les dépassements, et c'est là que se joue la plus grande part du chiffre de la spécialité.</p>
<p>Ce partage a une conséquence directe sur la comparaison : un cabinet d'orthodontie dont les patients sont surtout des adultes peut afficher des recettes élevées et des honoraires Ameli modestes. Les traitements d'adultes non remboursés sont hors nomenclature, et aucune statistique publique ne les mesure praticien par praticien (${h.src('dreesCns', 'DREES, comptes de la santé ' + CNS.annee + ', fiche 09')}). Le simulateur les retire de vos recettes si vous indiquez leur part.</p>
<h2>Une spécialité qui ne grossit pas</h2>
<p>Les orthodontistes libéraux sont ${h.num(d.eff!)} en ${Y}, contre ${h.num(d.eff5!)} cinq ans plus tôt. Dans le même temps, l'omnipratique a gagné ${h.pct(effGrowth(o)!)}. La profession est plus âgée et plus féminine que l'ensemble des chirurgiens-dentistes :</p>
<ul>
<li>${h.pct(d.femmes!)} de femmes, contre ${h.pct(o.femmes!)} chez les omnipraticiens ;</li>
<li>${h.pct(d.m35!)} de moins de 35 ans, ${h.pct(d.p60!)} de 60 ans et plus ;</li>
<li>${h.pct(d.mixte!)} en exercice mixte, libéral et salarié, ${h.num(d.mixte! / o.mixte!, 1)} fois la part observée en omnipratique ;</li>
<li>${h.num(d.dens!, 1)} orthodontistes libéraux pour 100 000 habitants.</li>
</ul>
<p>L'écart d'âge avec l'omnipratique est net : ${h.pct(o.m35!)} des omnipraticiens ont moins de 35 ans, contre ${h.pct(d.m35!)} des orthodontistes. Les données de l'Assurance Maladie ne donnent pas l'âge moyen d'installation, seulement ces parts.</p>
<h2>De 2015 à ${Y} : une hausse régulière</h2>
<p>La moyenne est passée de ${h.eur(d.hist['2015'])} en 2015 à ${h.eur(d.tot!)} en ${Y}, soit ${h.pct(g10)} en euros courants. La courbe est plus régulière que celle des omnipraticiens : un seul recul, en 2020 (${h.eur(d.hist['2020'])}), et une reprise sans à-coup marqué en 2021 (${h.eur(d.hist['2021'])}). Depuis 2019, la hausse atteint ${h.pct(g19)} ; sur la dernière année, ${h.pct(g1)}. La moyenne monte donc pendant que l'effectif libéral recule légèrement : la même dépense se partage entre un peu moins de praticiens.</p>
<h2>Orthodontiste et omnipraticien, côte à côte</h2>
${tableCote(h)}
<p>Le multiple de ${h.num(ratio, 1)} entre les deux moyennes ne se lit pas comme un écart de revenu. Un cabinet d'orthodontie emploie plus de personnel et reçoit plus de patients, et rien dans les publications de l'Assurance Maladie ne permet de passer des honoraires au bénéfice pour une spécialité donnée. Pour ce passage, seuls les comptes UNASA plus bas donnent un ordre de grandeur, avec leurs limites.</p>
<h2>Des moyennes départementales très dispersées</h2>
${tableDeps(h)}
<p>${depName(hi.code)} arrive en tête avec ${h.eur(hi.tot)}, ${depName(lo.code)} ferme la marche avec ${h.eur(lo.tot)}. Ces chiffres reposent souvent sur une poignée de praticiens : ${h.num(nbD(hi.code).eff!)} ${dansDep(hi.code)}, ${h.num(nbD(lo.code).eff!)} ${dansDep(lo.code)}. Sur un si petit nombre, un départ en retraite ou une installation suffit à faire bouger la moyenne d'une année à l'autre, d'où l'écart de ${h.num(hi.tot / lo.tot, 1)} à 1 entre les extrêmes. ${h.num(secret)} départements n'ont aucune moyenne publiée. Le ${h.a('classement-departements', 'classement complet')} montre ces trous.</p>
<h2>Les comptes des cabinets : une référence à manier avec soin</h2>
<p>L'${h.src('unasa', 'UNASA')} publie les comptes des orthodontistes adhérents de ses organismes de gestion sous le code 851EAB. En ${UNASA_YEAR}, l'échantillon compte ${h.num(ref.echantillon)} cabinets, contre ${h.num(prevRef.echantillon)} l'année précédente. Environ ${h.num(Math.round(ref.echantillon / 4))} cabinets par quart de recettes ne font pas une référence : le simulateur n'utilise donc que la moyenne d'ensemble, et la signale comme fragile.</p>
${tableComptes(h)}
<p>Deux traits ressortent malgré la petite taille de l'échantillon. Le personnel pèse plus lourd qu'en omnipratique, ${h.pct(ref.personnel)} des recettes contre ${h.pct(refOmni.personnel)} : le poste des assistantes compte davantage (voir le ${h.a('salaire-assistante-dentaire', 'coût d’une assistante dentaire')}). Les achats pèsent moins, ${h.pct(ref.achats)} contre ${h.pct(refOmni.achats)}. Pour les cabinets en société, la comparaison ne vaut pas : ces chiffres portent sur des praticiens en BNC, et le guide ${h.a('selarl-ou-bnc', 'SELARL ou BNC')} détaille l'autre cas.</p>`,
  },
  en: {
    slug: 'orthodontist-fees',
    nav: 'Orthodontist',
    card: `${Y} average fees of orthodontists in France, extra-billing, départements and practice accounts.`,
    title: `Orthodontist fees in France ${YEAR}: averages and practices`,
    description: `Orthodontists in French private practice billed ${e(d.tot!, 'en')} on average in ${Y}, ${p(part, 'en', 0)} of it extra-billing: ten-year trend, départements, UNASA practice accounts.`,
    h1: 'Orthodontist fees in French private practice',
    intro: `Assurance Maladie ${Y} figures for dentofacial orthopaedics (ODF), with what they leave out.`,
    resume: `Orthodontists in private practice in France billed ${e(d.tot!, 'en')} in fees on average in ${Y}, about ${formatNumber(ratio, 1, 'en')} times what a general dentist bills. In France orthodontics is a dental specialty, ODF (orthopédie dento-faciale), held by dental surgeons who completed a qualifying residency. Extra-billing above the social security rate makes up ${p(part, 'en')} of the total, ${e(d.dep!, 'en')} against ${e(d.hsd!, 'en')} at the regulated rate. There are ${n(d.eff!, 'en')} private orthodontists, ${n(d.dens!, 'en')} per 100,000 residents, and the headcount is down ${p(-gEff, 'en')} over five years. Average fees rose ${p(g10, 'en')} since 2015. No figure is published for ${n(secret, 'en')} départements with fewer than five orthodontists. Practice accounts are thin: UNASA covers only ${n(ref.echantillon, 'en')} orthodontic practices for ${UNASA_YEAR}, so treat that benchmark as indicative. Non-reimbursed adult treatment is not in any of these averages.`,
    faqs: [
      { q: 'How much does an orthodontist in France bill per year?', a: `${e(d.tot!, 'en')} in ${Y}, per full-time active orthodontist, according to Assurance Maladie, of which ${e(d.dep!, 'en')} is extra-billing. That is gross billing before staff, rent, equipment and social contributions. In ${UNASA_YEAR} practice accounts reported to UNASA, average profit was ${p(1 - ref.taux, 'en')} of receipts, but the sample holds only ${n(ref.echantillon, 'en')} practices.` },
      { q: 'Why is extra-billing so high in French orthodontics?', a: `It accounts for ${p(part, 'en')} of orthodontists’ fees in ${Y}, against ${p(partOmni, 'en')} for general dentists. Put simply, most of what an orthodontist charges sits above the social security base rate. DREES puts orthodontics at ${p(CNS.structure.orthodontie, 'en', 0)} of ${CNS.annee} dental spending, excluding adult treatment outside the fee schedule.` },
      { q: 'How many orthodontists practise in France?', a: `Assurance Maladie counts ${n(d.eff!, 'en')} orthodontists in private practice in ${Y}, against ${n(d.eff5!, 'en')} five years earlier. The RPPS national register lists ${n(RP.odf, 'en')} dental surgeons qualified in ODF across every type of practice, so the two counts cover different scopes. That gives ${n(d.dens!, 'en')} private orthodontists per 100,000 residents.` },
      { q: 'Is there official income data for orthodontists alone?', a: `No. DREES reports the income of private dental surgeons without splitting out orthodontists: ${e(D.moyen, 'en')} on average in ${D.annee}, all dental specialties together. The only specialty-level figure is UNASA’s average profit of ${e(ref.benefice, 'en')} for ${UNASA_YEAR}, drawn from ${n(ref.echantillon, 'en')} practices, a sample too small to stand for the profession.` },
      { q: 'Why do some départements show no orthodontist figures?', a: `In ${n(secret, 'en')} of ${n(DEP_CODES.length, 'en')} départements, Assurance Maladie publishes nothing because fewer than five orthodontists work there in private practice and statistical confidentiality applies. Most are rural, along with several overseas départements. For those, the calculator compares your practice with the regional and national averages instead.` },
      { q: 'Do orthodontists in Paris bill more than average?', a: `No, much less. Paris shows ${e(pa.tot!, 'en')} in average fees per orthodontist in ${Y}, ranked ${paRank.rank} of ${n(paRank.total, 'en')} départements with a published figure, against ${e(d.tot!, 'en')} nationally. The capital has ${formatNumber(pa.dens!, 1, 'en')} private orthodontists per 100,000 residents, compared with ${formatNumber(d.dens!, 1, 'en')} for France, and ${p(pa.mixte!, 'en', 0)} of them also hold a salaried post.` },
      { q: 'Do orthodontists see more patients than general dentists?', a: `More people, yes. An orthodontist in private practice saw ${n(d.patients!, 'en')} different patients on average in ${Y}, against ${n(o.patients!, 'en')} for a general dentist, according to Assurance Maladie. Treatment runs over several six-month periods and patients come back often, but each one counts only once in a year.` },
    ],
    body: (h) => `
<h2>Extra-billing: ${h.pct(part, 0)} of fees</h2>
<p>Of ${h.eur(d.tot!)} in average ${Y} fees, ${h.eur(d.hsd!)} is billed at the regulated rate and ${h.eur(d.dep!)} as extra-billing (dépassements). General dentistry runs the other way round, with extra-billing at only ${h.pct(partOmni)} of fees. Whatever is charged above the social security base rate counts as extra-billing, and that is where most of the specialty’s billing lies.</p>
<p>This matters when you compare yourself. A practice treating mostly adults can post high receipts and modest Assurance Maladie fees, since adult orthodontics outside the fee schedule is never recorded and no public per-practitioner figure exists for it (${h.src('dreesCns', 'DREES health accounts ' + CNS.annee + ', sheet 09')}). Tell the calculator what share of receipts that work represents and it is removed before the comparison.</p>
<h2>A specialty that is not growing</h2>
<p>France had ${h.num(d.eff!)} private orthodontists in ${Y}, against ${h.num(d.eff5!)} five years before, while general practice grew ${h.pct(effGrowth(o)!)}. The specialty is older and more female than dentistry overall:</p>
<ul>
<li>women: ${h.pct(d.femmes!)}, against ${h.pct(o.femmes!)} among general dentists;</li>
<li>under 35: ${h.pct(d.m35!)}; 60 and over: ${h.pct(d.p60!)};</li>
<li>mixed private and salaried work: ${h.pct(d.mixte!)}, ${h.num(d.mixte! / o.mixte!, 1)} times the general dentist rate;</li>
<li>density: ${h.num(d.dens!, 1)} private orthodontists per 100,000 people.</li>
</ul>
<p>The age gap with general practice is stark: ${h.pct(o.m35!)} of general dentists are under 35, against ${h.pct(d.m35!)} of orthodontists. Assurance Maladie publishes these shares, not an average age at which orthodontists open their practice.</p>
<h2>Steady growth since 2015</h2>
<p>The average went from ${h.eur(d.hist['2015'])} in 2015 to ${h.eur(d.tot!)} in ${Y}, up ${h.pct(g10)} in current euros. The curve is smoother than for general dentists. It fell once, in 2020 (${h.eur(d.hist['2020'])}), and recovered in 2021 (${h.eur(d.hist['2021'])}) without the sharp jump seen elsewhere. Since 2019 the rise is ${h.pct(g19)}, and ${h.pct(g1)} in the latest year. So the average climbs while the private headcount edges down.</p>
<h2>Orthodontists and general dentists side by side</h2>
${tableCote(h)}
<p>The ${h.num(ratio, 1)} multiple between the two averages is a billing gap, not an earnings gap. Orthodontic practices run larger teams and see more patients, and nothing Assurance Maladie publishes turns fees into profit for a given specialty. Only the UNASA accounts further down give an order of magnitude for that step, with real limits.</p>
<h2>Wide gaps between départements</h2>
${tableDeps(h)}
<p>${depName(hi.code)} leads at ${h.eur(hi.tot)} and ${depName(lo.code)} trails at ${h.eur(lo.tot)}. Both rest on a handful of people: ${h.num(nbD(hi.code).eff!)} orthodontists in the first, ${h.num(nbD(lo.code).eff!)} in the second. With numbers that small, one retirement or one new practice can swing the figure from one year to the next, which helps explain a ${h.num(hi.tot / lo.tot, 1)} to 1 spread between the extremes. ${h.num(secret)} départements have no published average at all, gaps you can see in the ${h.a('classement-departements', 'full ranking')}.</p>
<h2>Practice accounts: handle with care</h2>
<p>${h.src('unasa', 'UNASA')}, the federation of approved management bodies, publishes accounts for member orthodontists under code 851EAB. The ${UNASA_YEAR} sample is ${h.num(ref.echantillon)} practices, down from ${h.num(prevRef.echantillon)} the year before. Roughly ${h.num(Math.round(ref.echantillon / 4))} practices per receipts quarter is no benchmark, so the calculator only uses the overall average and flags it as fragile.</p>
${tableComptes(h)}
<p>Two features hold despite the small sample. Payroll takes ${h.pct(ref.personnel)} of receipts against ${h.pct(refOmni.personnel)} in general practice, so assistants are a bigger line (see the ${h.a('salaire-assistante-dentaire', 'cost of a dental assistant')}). Purchases take less, ${h.pct(ref.achats)} against ${h.pct(refOmni.achats)}. These are sole practitioners under BNC (bénéfices non commerciaux); if you practise through a company, the ${h.a('selarl-ou-bnc', 'SELARL versus BNC guide')} covers that case.</p>`,
  },
});
