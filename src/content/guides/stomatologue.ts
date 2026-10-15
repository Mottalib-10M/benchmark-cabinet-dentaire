import { defineGuide, type Helpers } from '../../lib/guide-types';
import { classement, depShare, growth, effGrowth } from '../../lib/engine/benchmark';
import { FR, DEPS, DEP_CODES, DATA_YEAR, depName } from '../../lib/engine/data';
import { reference, UNASA_YEAR } from '../../lib/engine/references';
import { P } from '../../lib/engine/params';
import { dansDep } from '../../lib/dep-fr';
import { formatMoney, formatNumber, formatPercent } from '../../lib/format';

type L = 'fr' | 'en';
const Y = DATA_YEAR;
const s = FR.p.stomato!;
const o = FR.p.omni!;
const all = FR.p.ensemble!;
const c = classement('stomato');
const hi = c[0], lo = c[c.length - 1];
const secret = DEP_CODES.length - c.length;
const g10 = growth(s, 2015, Y)!;
const g19 = growth(s, 2019, Y)!;
const g1 = growth(s, Y - 1, Y)!;
const gEff = effGrowth(s)!;
const part = depShare(s)!;
const RP = P.specialites_rpps;
const CNS = P.depense;
const ref = reference('stomato');
const e = (x: number, l: L) => formatMoney(x, 0, l);
const n = (x: number, l: L) => formatNumber(x, 0, l);
const p = (x: number, l: L, k = 1) => formatPercent(x, k, l);
const st = (code: string) => DEPS[code].p.stomato!;
const effPublie = c.reduce((t, x) => t + (st(x.code).eff ?? 0), 0);
const effs = c.map((x) => st(x.code).eff!);
const effMin = Math.min(...effs), effMax = Math.max(...effs);
const gros = [...c].sort((a, b) => st(b.code).eff! - st(a.code).eff!);
const g0 = gros[0], g1d = gros[1];

const tableDeps = (h: Helpers) => {
  const fr = h.lang === 'fr';
  return h.table(fr ? ['Rang', 'Département', 'Stomatologues libéraux', 'Honoraires moyens', 'dont dépassements'] : ['Rank', 'Département', 'Stomatologists in private practice', 'Average fees', 'of which extra-billing'],
    c.map((x, i) => [String(i + 1), depName(x.code), h.num(st(x.code).eff!), h.eur(x.tot), st(x.code).dep != null ? h.eur(st(x.code).dep!) : '–']),
    fr ? `Les ${h.num(c.length)} départements où l'Assurance Maladie publie une moyenne ${Y} pour les stomatologues ; ailleurs, secret statistique.` : `The ${h.num(c.length)} départements where Assurance Maladie publishes a ${Y} stomatologist average; elsewhere, statistical confidentiality.`,
    ['r', 'l', 'r', 'r', 'r']);
};
const ANS = [2015, 2017, 2019, 2020, 2021, 2022, 2023, 2024, Y];
const tableHist = (h: Helpers) => {
  const fr = h.lang === 'fr';
  return h.table(fr ? ['Année', 'Stomatologues', 'Omnipraticiens', 'Écart'] : ['Year', 'Stomatologists', 'General dentists', 'Gap'],
    ANS.map((a) => [String(a), h.eur(s.hist[String(a)]), h.eur(o.hist[String(a)]), h.pct(s.hist[String(a)] / o.hist[String(a)] - 1, 0)]),
    fr ? 'Honoraires totaux moyens par praticien actif à part entière, euros courants.' : 'Average total fees per full-time active practitioner, current euros.', ['l', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'stomatologue',
  group: 'specialites',
  order: 30,
  tool: 'benchmark',
  spec: 'stomato',
  related: ['omnipraticien', 'orthodontiste', 'classement-departements', 'taux-de-charges', 'selarl-ou-bnc'],
  sources: ['ameliHonoraires', 'ameliEffectifs', 'ameliExercice', 'ameliPatientele', 'rpps', 'dreesCns', 'unasa'],
  fr: {
    slug: 'honoraires-stomatologue-chirurgie-orale',
    nav: 'Stomatologue',
    card: `Honoraires moyens ${Y} des stomatologues, effectifs en baisse, et ce que l'on sait de la chirurgie orale.`,
    title: `Honoraires stomatologue ${Y} : chiffres et chirurgie orale`,
    description: `Un stomatologue libéral a facturé ${e(s.tot!, 'fr')} d'honoraires en moyenne en ${Y} (Ameli), pour ${n(s.eff!, 'fr')} praticiens libéraux : effectifs, départements et limites.`,
    h1: 'Honoraires du stomatologue et de la chirurgie orale',
    intro: `Des médecins spécialistes de la bouche, une catégorie à part dans les données de l'Assurance Maladie.`,
    resume: `Les stomatologues sont des médecins, pas des chirurgiens-dentistes : l'Assurance Maladie les classe parmi les médecins spécialistes, à part des « chirurgiens-dentistes ». En ${Y}, un stomatologue libéral a facturé en moyenne ${e(s.tot!, 'fr')} d'honoraires, dont ${e(s.dep!, 'fr')} de dépassements (${p(part, 'fr')}). La moyenne a gagné ${p(g10, 'fr')} depuis 2015, alors que l'effectif fond : ${n(s.eff!, 'fr')} libéraux, ${p(-gEff, 'fr')} en cinq ans, et ${p(s.p60!, 'fr')} ont 60 ans ou plus. ${n(c.length, 'fr')} départements seulement ont une moyenne publiée. La chirurgie orale (${n(RP.chirurgie_orale, 'fr')} chirurgiens-dentistes qualifiés au RPPS) et la médecine bucco-dentaire (${n(RP.medecine_bucco_dentaire, 'fr')}) n'ont pas de statistique séparée : l'Assurance Maladie les compte parmi les chirurgiens-dentistes hors ODF. Aucune statistique de cabinets n'existe pour les stomatologues ; le simulateur prend la référence UNASA des chirurgiens-dentistes, et le signale.`,
    faqs: [
      { q: 'Un stomatologue est-il médecin ou dentiste ?', a: `Médecin. Le stomatologue a suivi des études de médecine puis une spécialité de la bouche et des mâchoires. Dans l'open data de l'Assurance Maladie, il figure parmi les médecins spécialistes, sous « Stomatologues » : ${n(s.eff!, 'fr')} libéraux en ${Y}. Il n'entre donc pas dans les ${n(all.eff!, 'fr')} chirurgiens-dentistes libéraux, omnipraticiens et orthodontistes réunis.` },
      { q: 'Quels sont les honoraires moyens d’un stomatologue libéral ?', a: `${e(s.tot!, 'fr')} en ${Y}, par stomatologue actif à part entière : ${e(s.hsd!, 'fr')} au tarif de convention et ${e(s.dep!, 'fr')} de dépassements. La moyenne porte sur ${n(s.ape!, 'fr')} praticiens. C'est un montant facturé, avant charges du cabinet et cotisations personnelles ; aucun chiffre public ne donne le revenu net des stomatologues dans les données utilisées ici.` },
      { q: 'Pourquoi le nombre de stomatologues baisse-t-il ?', a: `L'Assurance Maladie en compte ${n(s.eff!, 'fr')} en ${Y} contre ${n(s.eff5!, 'fr')} cinq ans plus tôt, soit ${p(gEff, 'fr')}. La pyramide des âges l'annonce : ${p(s.p60!, 'fr')} ont 60 ans ou plus, ${p(s.m35!, 'fr')} moins de 35 ans. Les fichiers comptent les praticiens sans donner les raisons ; ils montrent seulement que, sur cinq ans, les sorties de l'exercice libéral l'emportent sur les entrées.` },
      { q: 'Les chirurgiens oraux ont-ils leurs propres statistiques d’honoraires ?', a: `Non. Le RPPS recense ${n(RP.chirurgie_orale, 'fr')} chirurgiens-dentistes qualifiés en chirurgie orale et ${n(RP.medecine_bucco_dentaire, 'fr')} en médecine bucco-dentaire. L'Assurance Maladie ne les isole pas : leurs honoraires sont fondus dans la moyenne des chirurgiens-dentistes hors ODF, ${e(o.tot!, 'fr')} en ${Y}. Aucun chiffre public ne permet de dire si leur activité facture plus ou moins.` },
      { q: 'Quel taux de charges retenir pour un cabinet de stomatologie ?', a: `Il n'existe pas de statistique publique de cabinets de stomatologues. Le simulateur applique faute de mieux la référence des chirurgiens-dentistes adhérents UNASA en ${UNASA_YEAR}, soit ${p(ref.taux, 'fr')} de charges, cotisations personnelles comprises, sur ${n(ref.echantillon, 'fr')} cabinets. C'est une approximation, signalée comme telle : rien ne dit qu'un cabinet de stomatologie a la structure de coûts d'un cabinet dentaire.` },
      { q: 'Dans quels départements exercent le plus de stomatologues ?', a: `${depName(g0.code)} arrive en tête avec ${n(st(g0.code).eff!, 'fr')} stomatologues libéraux en ${Y}, devant ${depName(g1d.code)} (${n(st(g1d.code).eff!, 'fr')}). À eux deux, ils réunissent ${p((st(g0.code).eff! + st(g1d.code).eff!) / s.eff!, 'fr', 0)} de l'effectif national. Dans ${n(secret, 'fr')} départements, moins de cinq praticiens exercent et l'Assurance Maladie ne publie aucune moyenne d'honoraires : la spécialité se concentre dans les grandes agglomérations.` },
      { q: 'Les implants posés par un stomatologue sont-ils dans ces honoraires ?', a: `Non. L'implantologie est hors nomenclature : la pose d'implant n'est pas un acte remboursé, et elle échappe aux statistiques de l'Assurance Maladie, quel que soit le praticien. La DREES le rappelle dans la fiche consacrée aux soins dentaires des comptes de la santé ${CNS.annee}. Le simulateur demande la part de ces actes pour la retirer de vos recettes avant de comparer.` },
    ],
    body: (h) => `
<h2>Une spécialité médicale, rangée à part</h2>
<p>Dans les fichiers de l'${h.src('ameliHonoraires', 'Assurance Maladie')}, trois catégories se partagent la bouche. Les chirurgiens-dentistes hors ODF, ${h.num(o.eff!)} libéraux ; les orthodontistes (ODF), qualifiés en orthopédie dento-faciale ; et les stomatologues, ${h.num(s.eff!)}, qui sont des médecins et figurent dans la liste des spécialités médicales. Les deux premières forment l'ensemble « chirurgiens-dentistes » (${h.num(all.eff!)} libéraux), la troisième n'en fait pas partie.</p>
<p>Ce découpage a une conséquence que beaucoup ignorent. Les deux spécialités ordinales de chirurgiens-dentistes les plus proches de la stomatologie, la chirurgie orale (${h.num(RP.chirurgie_orale)} praticiens inscrits au ${h.src('rpps', 'RPPS')}) et la médecine bucco-dentaire (${h.num(RP.medecine_bucco_dentaire)}), ne disposent d'aucune ligne propre. Leurs honoraires se mêlent à ceux des omnipraticiens, dans une moyenne nationale de ${h.eur(o.tot!)}. Un chirurgien-dentiste titulaire de l'une de ces qualifications se compare donc, dans le simulateur, à la moyenne des omnipraticiens ; le réglage « stomatologue » vise les médecins.</p>
<h2>${h.eur(s.tot!)} d'honoraires moyens, une moyenne en forte hausse</h2>
<p>Un stomatologue libéral actif à part entière a facturé ${h.eur(s.tot!)} en ${Y}, dont ${h.eur(s.hsd!)} sans dépassement et ${h.eur(s.dep!)} de dépassements, soit ${h.pct(part)}. La moyenne est calculée sur ${h.num(s.ape!)} praticiens. Elle se place loin au-dessus des omnipraticiens et en dessous des orthodontistes.</p>
${tableHist(h)}
<p>La progression est la plus forte des trois spécialités : ${h.pct(g10)} depuis 2015, ${h.pct(g19)} depuis 2019 et encore ${h.pct(g1)} sur la dernière année. Elle se lit avec prudence. La moyenne porte sur un effectif qui se réduit d'année en année ; si les praticiens qui partent facturaient moins que ceux qui restent, la moyenne monte sans que l'activité de chacun change. Les données publiées ne permettent pas de séparer cet effet de composition d'une vraie hausse de l'activité.</p>
<h2>Une profession qui vieillit et se raréfie</h2>
<ul>
<li>${h.num(s.eff!)} stomatologues libéraux en ${Y}, contre ${h.num(s.eff5!)} cinq ans plus tôt ;</li>
<li>${h.num(s.dens!, 2)} praticien pour 100 000 habitants, quand l'omnipratique en compte ${h.num(o.dens!)} ;</li>
<li>${h.pct(s.p60!)} ont 60 ans ou plus, ${h.pct(s.m35!)} moins de 35 ans ;</li>
<li>${h.pct(s.femmes!)} de femmes, la part la plus faible des trois spécialités ;</li>
<li>${h.pct(s.mixte!)} en exercice mixte, libéral et salarié ;</li>
<li>${h.num(s.patients!)} patients différents dans l'année en moyenne (${h.src('ameliPatientele', 'patientèle Ameli')}).</li>
</ul>
<p>La part d'exercice mixte frappe : près d'un stomatologue sur trois combine libéral et salariat, contre ${h.pct(o.mixte!)} des omnipraticiens. Comparer un cabinet de stomatologie à la moyenne suppose donc de vérifier que l'activité libérale occupe bien toute l'année.</p>
<h2>${h.num(c.length)} départements publiés sur ${h.num(DEP_CODES.length)}</h2>
<p>Sous cinq praticiens, l'Assurance Maladie ne publie pas de moyenne. Avec moins d'un stomatologue pour 100 000 habitants, la règle efface ${h.num(secret)} départements ; les ${h.num(c.length)} restants réunissent ${h.num(effPublie)} des ${h.num(s.eff!)} stomatologues libéraux. ${depName(hi.code)} arrive en tête avec ${h.eur(hi.tot)} pour ${h.num(st(hi.code).eff!)} praticiens, ${depName(lo.code)} ferme la liste avec ${h.eur(lo.tot)} pour ${h.num(st(lo.code).eff!)}. Selon le département, la moyenne repose sur ${h.num(effMin)} à ${h.num(effMax)} praticiens : dans les plus petits, un seul cabinet atypique la déplace.</p>
${tableDeps(h)}
<p>Si votre département n'apparaît pas, le simulateur compare à la moyenne de votre région, quand elle existe, et à celle de la France.</p>
<h2>Comptes de cabinet : aucune référence propre</h2>
<p>Ni l'UNASA ni aucune autre source publique ne diffuse les comptes des cabinets de stomatologie. Le simulateur emprunte la référence des chirurgiens-dentistes : ${h.pct(ref.taux)} de charges, cotisations personnelles comprises, et ${h.eur(ref.benefice)} de bénéfice moyen dans les comptes ${UNASA_YEAR} de ${h.num(ref.echantillon)} cabinets (${h.src('unasa', 'UNASA, code 851EAA')}). Il affiche cette référence comme une approximation. Le revenu ne se positionne pas non plus : la distribution DREES utilisée sur ce site porte sur les chirurgiens-dentistes, pas sur les médecins stomatologues. Le guide sur le ${h.a('taux-de-charges', 'taux de charges')} détaille les postes, et ${h.a('selarl-ou-bnc', 'SELARL ou BNC')} le choix de la structure, sujet à valider avec un expert-comptable.</p>`,
  },
  en: {
    slug: 'stomatologist-oral-surgeon-fees',
    nav: 'Stomatologist',
    card: `${Y} average fees of stomatologists in France, a shrinking headcount, and what is known about oral surgery.`,
    title: `Stomatologist fees France ${Y}: data and oral surgery`,
    description: `French stomatologists in private practice billed ${e(s.tot!, 'en')} in fees on average in ${Y}, with ${n(s.eff!, 'en')} practitioners left: headcount, départements and data gaps.`,
    h1: 'Stomatologist and oral surgeon fees in France',
    intro: `Physicians specialised in the mouth and jaws, filed apart from dentists in Assurance Maladie data.`,
    resume: `In France a stomatologist (stomatologue) is a medical doctor, not a dental surgeon, and Assurance Maladie lists the specialty among physicians rather than with dentists. A stomatologist in private practice billed ${e(s.tot!, 'en')} in fees on average in ${Y}, ${e(s.dep!, 'en')} of it extra-billing above the regulated rate (${p(part, 'en')}). That average is up ${p(g10, 'en')} since 2015 while the workforce shrinks: ${n(s.eff!, 'en')} practitioners, ${p(-gEff, 'en')} in five years, ${p(s.p60!, 'en')} aged 60 or over. Only ${n(c.length, 'en')} départements have a published figure. Dental surgeons qualified in oral surgery (${n(RP.chirurgie_orale, 'en')} in the RPPS register) or oral medicine (${n(RP.medecine_bucco_dentaire, 'en')}) get no separate statistic, as they are counted with general dentists. No public practice accounts exist for stomatologists either, so the calculator borrows the UNASA dentist benchmark and labels it as a proxy.`,
    faqs: [
      { q: 'Is a stomatologist in France a doctor or a dentist?', a: `A doctor. Stomatologists qualify in medicine, then specialise in the mouth and jaws. Assurance Maladie open data lists them among medical specialists under “Stomatologues”, ${n(s.eff!, 'en')} in private practice in ${Y}. They are not part of the ${n(all.eff!, 'en')} dental surgeons in private practice, which covers general dentists and orthodontists only.` },
      { q: 'What do French stomatologists bill on average?', a: `${e(s.tot!, 'en')} in ${Y} per full-time active stomatologist: ${e(s.hsd!, 'en')} at the regulated rate plus ${e(s.dep!, 'en')} of extra-billing, averaged over ${n(s.ape!, 'en')} practitioners. This is billing before practice costs and personal social contributions. None of the sources used on this site gives the net income of stomatologists.` },
      { q: 'Why are there fewer and fewer stomatologists?', a: `Assurance Maladie counts ${n(s.eff!, 'en')} in ${Y} against ${n(s.eff5!, 'en')} five years earlier, a change of ${p(gEff, 'en')}. The age pyramid points the same way: ${p(s.p60!, 'en')} are 60 or over and ${p(s.m35!, 'en')} under 35. The files count people and give no reasons; they only show more practitioners leaving private practice than joining it over five years.` },
      { q: 'Do oral surgeons have their own fee statistics in France?', a: `No. The RPPS register lists ${n(RP.chirurgie_orale, 'en')} dental surgeons qualified in oral surgery and ${n(RP.medecine_bucco_dentaire, 'en')} in oral medicine, but Assurance Maladie does not separate them. Their fees sit inside the average for dentists excluding orthodontists, ${e(o.tot!, 'en')} in ${Y}. No public figure says whether they bill more or less than general dentists.` },
      { q: 'What cost ratio should a stomatology practice compare with?', a: `There is no public dataset of stomatology practice accounts. Lacking one, the calculator applies the ${UNASA_YEAR} benchmark of dental practices reporting to UNASA: ${p(ref.taux, 'en')} of receipts in costs, own contributions included, across ${n(ref.echantillon, 'en')} practices. It is flagged as an approximation, since nothing shows that a stomatology practice shares a dental practice’s cost structure.` },
      { q: 'Where do most French stomatologists practise?', a: `${depName(g0.code)} has the most, ${n(st(g0.code).eff!, 'en')} in private practice in ${Y}, ahead of ${depName(g1d.code)} with ${n(st(g1d.code).eff!, 'en')}. Together these two hold ${p((st(g0.code).eff! + st(g1d.code).eff!) / s.eff!, 'en', 0)} of the national headcount. In ${n(secret, 'en')} départements fewer than five practise, and Assurance Maladie publishes no fee average there, so the specialty is concentrated in large urban areas.` },
      { q: 'Are implants placed by a stomatologist included in these fees?', a: `No. Implant placement is outside the national fee schedule: it is not reimbursed, so it never reaches Assurance Maladie statistics, whoever performs it. DREES notes this in the dental care sheet of its ${CNS.annee} health accounts. The calculator asks what share of receipts such work represents and removes it before comparing.` },
    ],
    body: (h) => `
<h2>A medical specialty, filed separately</h2>
<p>${h.src('ameliHonoraires', 'Assurance Maladie')} splits oral care into three groups. Dental surgeons excluding orthodontics, ${h.num(o.eff!)} in private practice; orthodontists (ODF, dentofacial orthopaedics); and stomatologists, ${h.num(s.eff!)} of them, who are physicians and appear in the list of medical specialties. The first two make up “chirurgiens-dentistes”, ${h.num(all.eff!)} in private practice. Stomatologists sit outside that total.</p>
<p>A consequence that often surprises: the two dental council specialties closest to stomatology have no line of their own. Oral surgery (chirurgie orale, ${h.num(RP.chirurgie_orale)} dental surgeons in the ${h.src('rpps', 'RPPS register')}) and oral medicine (médecine bucco-dentaire, ${h.num(RP.medecine_bucco_dentaire)}) are folded into the general dentist average of ${h.eur(o.tot!)}. If you are a dental surgeon with one of those qualifications, compare yourself as a general dentist; the stomatologist setting is meant for physicians.</p>
<h2>${h.eur(s.tot!)} in average fees, and climbing fast</h2>
<p>A full-time active stomatologist in private practice billed ${h.eur(s.tot!)} in ${Y}: ${h.eur(s.hsd!)} at the regulated rate and ${h.eur(s.dep!)} of extra-billing, or ${h.pct(part)}. The figure rests on ${h.num(s.ape!)} practitioners, well above general dentists and below orthodontists.</p>
${tableHist(h)}
<p>Growth is the steepest of the three groups: ${h.pct(g10)} since 2015, ${h.pct(g19)} since 2019, and ${h.pct(g1)} again last year. Read it carefully. The average is computed on a workforce that gets smaller each year, and if those leaving billed less than those staying, the average rises with no change in anyone’s activity. Published data cannot tell that composition effect apart from real growth.</p>
<h2>An ageing, thinning profession</h2>
<ul>
<li>headcount: ${h.num(s.eff!)} in ${Y}, down from ${h.num(s.eff5!)} five years earlier;</li>
<li>density: ${h.num(s.dens!, 2)} per 100,000 residents, against ${h.num(o.dens!)} for general dentists;</li>
<li>age: ${h.pct(s.p60!)} aged 60 or more, ${h.pct(s.m35!)} under 35;</li>
<li>women: ${h.pct(s.femmes!)}, the lowest share of the three groups;</li>
<li>mixed private and salaried work: ${h.pct(s.mixte!)};</li>
<li>patients seen in the year: ${h.num(s.patients!)} on average (${h.src('ameliPatientele', 'Assurance Maladie patient data')}).</li>
</ul>
<p>Mixed practice stands out. Nearly one stomatologist in three also holds a salaried post, compared with ${h.pct(o.mixte!)} of general dentists. Before comparing a practice with the average, check that private work filled the whole year.</p>
<h2>${h.num(c.length)} of ${h.num(DEP_CODES.length)} départements published</h2>
<p>With fewer than five practitioners, no average is released. At under one stomatologist per 100,000 people, that rule blanks out ${h.num(secret)} départements; the ${h.num(c.length)} that remain hold ${h.num(effPublie)} of the ${h.num(s.eff!)} stomatologists in private practice. ${depName(hi.code)} leads with ${h.eur(hi.tot)} across ${h.num(st(hi.code).eff!)} practitioners, and ${depName(lo.code)} comes last at ${h.eur(lo.tot)} across ${h.num(st(lo.code).eff!)}. Each average rests on ${h.num(effMin)} to ${h.num(effMax)} practitioners, so in the smallest ones a single unusual practice moves it.</p>
${tableDeps(h)}
<p>If your département is missing, the calculator compares you with your region, where a figure exists, and with France.</p>
<h2>No practice accounts of their own</h2>
<p>Neither UNASA nor any other public source releases stomatology practice accounts. The calculator borrows the dental benchmark instead: ${h.pct(ref.taux)} of receipts in costs, own contributions included, and ${h.eur(ref.benefice)} of average profit in the ${UNASA_YEAR} accounts of ${h.num(ref.echantillon)} practices (${h.src('unasa', 'UNASA, code 851EAA')}), shown as a proxy. Income is not ranked either, because the DREES distribution used on this site covers dental surgeons, not physicians. The ${h.a('taux-de-charges', 'cost ratio guide')} breaks down each expense line, and ${h.a('selarl-ou-bnc', 'SELARL or BNC')} covers the choice of legal structure, a decision to check with a chartered accountant (expert-comptable).</p>`,
  },
});
