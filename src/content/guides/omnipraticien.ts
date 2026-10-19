import { YEAR } from '../../data/site-config';
import { defineGuide } from '../../lib/guide-types';
import { classement, depShare, growth, effGrowth, depsBelow } from '../../lib/engine/benchmark';
import { FR, DEPS, DATA_YEAR, depName } from '../../lib/engine/data';
import { reference, UNASA_YEAR } from '../../lib/engine/references';
import { P } from '../../lib/engine/params';
import { dansDep } from '../../lib/dep-fr';
import { formatMoney, formatNumber, formatPercent } from '../../lib/format';
import unasa from '../../data/unasa.json';

type L = 'fr' | 'en';
const Y = DATA_YEAR;
const o = FR.p.omni!;
const all = FR.p.ensemble!;
const odf = FR.p.odf!;
const c = classement('omni');
const hi = c[0], hi2 = c[1], lo = c[c.length - 1], lo2 = c[c.length - 2];
const g10 = growth(o, 2015, Y)!;
const g1 = growth(o, Y - 1, Y)!;
const g2021 = growth(o, 2020, 2021)!;
const gEff = effGrowth(o)!;
const part = depShare(o)!;
const KR = P.revenus.carcdsf_2024;
const CNS = P.depense;
const DP = CNS.depassements_cabinets_2024;
const RP = P.specialites_rpps;
const ref = reference('omni');
const quartMeans = [1, 2, 3, 4].map((q) => Number((unasa as unknown as Record<string, { lignes: Record<string, number[]> }>)[`851EAA_${UNASA_YEAR}`].lignes['Montant net des recettes'][q]));
const quarts = quartMeans.map((m) => reference('omni', m));
const e = (x: number, l: L) => formatMoney(x, 0, l);
const n = (x: number, l: L) => formatNumber(x, 0, l);
const p = (x: number, l: L, d = 1) => formatPercent(x, d, l);
const nb = (code: string) => DEPS[code].p.omni!;
const sousMoy = depsBelow('omni', o.tot!);
const retro = Number((unasa as unknown as Record<string, { lignes: Record<string, number[]> }>)[`851EAA_${UNASA_YEAR}`].lignes['Honoraires rétrocédés'][0]);

const tableQuarts = (h: Parameters<Parameters<typeof defineGuide>[0]['fr']['body']>[0]) => {
  const fr = h.lang === 'fr';
  const head = fr
    ? ['Quart de recettes', 'Recettes nettes moyennes', 'Personnel', 'Achats', 'Loyer', 'Cotisations perso. et CSG', 'Bénéfice', 'Bénéfice moyen']
    : ['Receipts quarter', 'Average net receipts', 'Staff', 'Purchases', 'Rent', 'Own contributions and CSG', 'Profit', 'Average profit'];
  const lab = fr ? ['1er quart', '2e quart', '3e quart', '4e quart'] : ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'];
  const row = (name: string, r: ReturnType<typeof reference>) => [name, h.eur(r.recettes), h.pct(r.personnel), h.pct(r.achats), h.pct(r.loyer), h.pct(r.cotisPerso), h.pct(1 - r.taux), h.eur(r.benefice)];
  return h.table(head, [...quarts.map((r, i) => row(lab[i], r)), row(fr ? 'Ensemble' : 'All practices', ref)],
    fr ? `Comptes ${UNASA_YEAR} de ${h.num(ref.echantillon)} cabinets de chirurgiens-dentistes adhérents UNASA (code 851EAA), en part des recettes nettes.` : `${UNASA_YEAR} accounts of ${h.num(ref.echantillon)} dental practices filed with UNASA approved management bodies (code 851EAA), as a share of net receipts.`,
    ['l', 'r', 'r', 'r', 'r', 'r', 'r', 'r']);
};
const ANS = [2015, 2017, 2019, 2020, 2021, 2023, 2024, Y];
const tableHist = (h: Parameters<Parameters<typeof defineGuide>[0]['fr']['body']>[0]) => {
  const fr = h.lang === 'fr';
  return h.table(fr ? ['Année', 'Omnipraticiens (hors ODF)', 'Tous chirurgiens-dentistes'] : ['Year', 'General dentists (excl. orthodontists)', 'All dentists'],
    ANS.map((a) => [String(a), h.eur(o.hist[String(a)]), h.eur(all.hist[String(a)])]),
    fr ? 'Honoraires totaux moyens par praticien actif à part entière, euros courants.' : 'Average total fees per full-time active practitioner, current euros.', ['l', 'r', 'r']);
};

export default defineGuide({
  id: 'omnipraticien',
  group: 'specialites',
  order: 10,
  tool: 'benchmark',
  spec: 'omni',
  related: ['classement-departements', 'taux-de-charges', 'revenu-dentiste', 'ca-par-fauteuil', 'orthodontiste'],
  sources: ['ameliHonoraires', 'ameliEffectifs', 'ameliPatientele', 'ameliExercice', 'unasa', 'carcdsfRevenus2024', 'dreesCns2025', 'dreesCns'],
  fr: {
    slug: 'honoraires-chirurgien-dentiste',
    nav: 'Omnipraticien',
    card: `Honoraires moyens ${Y} des chirurgiens-dentistes omnipraticiens, évolution depuis 2015 et comptes des cabinets.`,
    title: `Honoraires chirurgien-dentiste ${YEAR} : moyenne et écarts`,
    description: `Un omnipraticien a facturé ${e(o.tot!, 'fr')} d'honoraires en moyenne en ${Y} (Ameli) : part des dépassements, écarts entre départements, évolution et comptes UNASA.`,
    h1: 'Honoraires du chirurgien-dentiste omnipraticien',
    intro: `Les moyennes ${Y} de l'Assurance Maladie, l'historique depuis 2015 et le simulateur réglé sur l'omnipratique.`,
    resume: `En ${Y}, un chirurgien-dentiste omnipraticien libéral a facturé en moyenne ${e(o.tot!, 'fr')} d'honoraires, dont ${e(o.hsd!, 'fr')} au tarif de la Sécurité sociale et ${e(o.dep!, 'fr')} de dépassements, soit ${p(part, 'fr')} du total, d'après l'open data de l'Assurance Maladie. La moyenne est calculée sur ${n(o.ape!, 'fr')} praticiens actifs à part entière, parmi ${n(o.eff!, 'fr')} omnipraticiens libéraux (${p(gEff, 'fr')} en cinq ans). Elle a progressé de ${p(g10, 'fr')} depuis 2015, mais de ${p(g1, 'fr')} seulement sur la dernière année. L'écart entre territoires est large : ${e(hi.tot, 'fr')} ${dansDep(hi.code)}, ${e(lo.tot, 'fr')} ${dansDep(lo.code)}. Ce sont des honoraires, pas un revenu : dans les comptes ${UNASA_YEAR} de ${n(ref.echantillon, 'fr')} cabinets suivis par l'UNASA, le bénéfice représente ${p(1 - ref.taux, 'fr')} des recettes. Les actes hors nomenclature (implants, parodontie) ne figurent pas dans ces moyennes.`,
    faqs: [
      { q: `Quel est le chiffre d'affaires moyen d'un dentiste généraliste en ${Y} ?`, a: `L'Assurance Maladie ne publie pas de chiffre d'affaires, mais des honoraires moyens : ${e(o.tot!, 'fr')} par omnipraticien actif à part entière en ${Y}. Ce montant ne compte que les actes enregistrés par l'Assurance Maladie. Les cabinets suivis par l'UNASA affichent ${e(ref.recettes, 'fr')} de recettes nettes moyennes en ${UNASA_YEAR}, un chiffre comptable qui inclut tout ce qui est encaissé, actes hors nomenclature compris.` },
      { q: 'Que recouvrent les dépassements d’un omnipraticien ?', a: `Ils pèsent ${e(o.dep!, 'fr')} sur ${e(o.tot!, 'fr')} en ${Y}, soit ${p(part, 'fr')}. Ce sont les montants facturés au-delà du tarif de base, surtout sur les prothèses à honoraires maîtrisés ou libres. Au niveau national, la DREES comptait ${p(DP.part, 'fr')} de dépassements dans les honoraires des dentistes en cabinet libéral en ${DP.annee} ; en ${CNS.annee}, les prothèses représentent ${p(CNS.structure_honoraires.protheses, 'fr', 0)} des honoraires de soins dentaires, et les dépassements ${p(CNS.part_depassements_protheses, 'fr', 0)} de la dépense de prothèses.` },
      { q: 'Pourquoi les honoraires des dentistes ont-ils bondi en 2021 ?', a: `La moyenne des omnipraticiens est passée de ${e(o.hist['2020'], 'fr')} en 2020 à ${e(o.hist['2021'], 'fr')} en 2021, soit ${p(g2021, 'fr')} en un an. L'année 2020 avait marqué un recul par rapport à 2019 (${e(o.hist['2019'], 'fr')}). Les fichiers de l'Assurance Maladie donnent les montants, pas les causes : on ne peut pas y lire la part de rattrapage et la part de changement de tarifs.` },
      { q: 'Combien de patients voit un chirurgien-dentiste par an ?', a: `En ${Y}, la patientèle moyenne d'un omnipraticien libéral compte ${n(o.patients!, 'fr')} patients différents dans l'année, selon l'Assurance Maladie. Chez les orthodontistes, elle atteint ${n(odf.patients!, 'fr')}. Ce chiffre compte des personnes, pas des rendez-vous : un patient en traitement prothétique revient plusieurs fois et reste compté une seule fois.` },
      { q: 'Un dentiste salarié en centre de santé est-il compté dans ces moyennes ?', a: `Non. Les moyennes portent sur les praticiens libéraux. Ceux qui exercent aussi une activité salariée (exercice mixte) représentent ${p(o.mixte!, 'fr')} des omnipraticiens en ${Y}. Un dentiste uniquement salarié n'entre pas dans les statistiques d'honoraires libéraux. Les praticiens qui n'ont pas exercé toute l'année sont exclus du calcul de la moyenne, qui ne retient que les actifs à part entière.` },
      { q: 'Les honoraires des omnipraticiens augmentent-ils encore ?', a: `À peine. La moyenne est passée de ${e(o.hist[String(Y - 1)], 'fr')} en ${Y - 1} à ${e(o.tot!, 'fr')} en ${Y}, soit ${p(g1, 'fr')}, en euros courants. Sur la même période, les orthodontistes ont progressé de ${p(growth(odf, Y - 1, Y)!, 'fr')}. Depuis le pic de 2021, la moyenne des omnipraticiens n'a gagné que ${p(growth(o, 2021, Y)!, 'fr')} en ${n(Y - 2021, 'fr')} ans, alors que l'effectif libéral continuait de grossir.` },
      { q: 'Quelle est la différence entre omnipraticien et chirurgien-dentiste spécialiste ?', a: `L'Ordre reconnaît trois spécialités : orthodontie (${n(RP.odf, 'fr')} praticiens au RPPS), chirurgie orale (${n(RP.chirurgie_orale, 'fr')}) et médecine bucco-dentaire (${n(RP.medecine_bucco_dentaire, 'fr')}). L'Assurance Maladie isole seulement l'orthodontie ; les deux autres restent dans les « chirurgiens-dentistes hors ODF », la catégorie de cette page. Aucune statistique publique ne les sépare.` },
    ],
    body: (h) => `
<h2>Ce que contient la moyenne de ${h.eur(o.tot!)}</h2>
<p>La catégorie « chirurgiens-dentistes hors ODF » de l'Assurance Maladie regroupe ${h.num(o.eff!)} libéraux en ${Y}. La moyenne d'honoraires ne se calcule pourtant que sur ${h.num(o.ape!)} d'entre eux, les praticiens dits actifs à part entière : installés toute l'année et conventionnés, selon la définition de l'Assurance Maladie. Les débuts et fins de carrière, qui tireraient la moyenne vers le bas, sont donc écartés.</p>
<p>Sur ${h.eur(o.tot!)}, ${h.eur(o.hsd!)} correspondent aux honoraires sans dépassement, ceux du tarif de convention. Le reste, ${h.eur(o.dep!)}, vient des dépassements. Ce partage pèse sur la gestion : les dépassements suivent surtout la prothèse, qui appelle une facture de laboratoire. Un cabinet très prothétique affiche des honoraires élevés et un taux de charges élevé en même temps.</p>
<p>Le périmètre s'arrête aux actes connus de l'Assurance Maladie. L'implantologie, la parodontie non remboursable, le blanchiment ou les aligneurs pour adultes sont des actes hors nomenclature : ils n'apparaissent ni dans ces moyennes, ni dans aucune statistique publique par praticien (${h.src('dreesCns2025', 'DREES, comptes de la santé, fiche 14')}). Le simulateur demande donc leur part pour la retirer de vos recettes avant la comparaison.</p>
<h2>Dix ans d'honoraires, de 2015 à ${Y}</h2>
${tableHist(h)}
<p>En euros courants, la moyenne des omnipraticiens a gagné ${h.pct(g10)} en dix ans. La série a deux ruptures : un recul en 2020, puis une hausse de ${h.pct(g2021)} en 2021. Depuis, la pente s'est presque aplatie, avec ${h.pct(g1)} entre ${Y - 1} et ${Y}. Pendant ce temps, l'effectif libéral a grossi de ${h.pct(gEff)} en cinq ans (${h.num(o.eff5!)} puis ${h.num(o.eff!)}) : la demande se partage entre plus de cabinets.</p>
<p>Ces chiffres ne sont pas corrigés de l'inflation. Une moyenne quasi stable en euros courants veut dire, à charges égales, une marge qui se resserre ; le guide sur le ${h.a('taux-de-charges', 'taux de charges')} montre comment les postes ont bougé dans les comptes des cabinets.</p>
<h2>Qui sont les omnipraticiens libéraux</h2>
<ul>
<li>${h.pct(o.femmes!)} de femmes, une profession presque à parité ;</li>
<li>${h.pct(o.m35!)} de moins de 35 ans et ${h.pct(o.p60!)} de 60 ans et plus ;</li>
<li>${h.num(o.dens!)} omnipraticiens pour 100 000 habitants en moyenne nationale ;</li>
<li>${h.pct(o.mixte!)} en exercice mixte, libéral et salarié ;</li>
<li>${h.num(o.patients!)} patients différents par praticien dans l'année.</li>
</ul>
<p>La pyramide est jeune comparée aux orthodontistes (${h.pct(odf.m35!)} de moins de 35 ans) : près d'un omnipraticien sur trois a moins de 35 ans, quand les 60 ans et plus restent minoritaires.</p>
<h2>${depName(hi.code)} ou ${depName(lo.code)} : un même métier, deux moyennes</h2>
<p>Les ${h.num(c.length)} départements ont tous une moyenne publiée. Le plus haut est ${depName(hi.code)} avec ${h.eur(hi.tot)} pour ${h.num(nb(hi.code).eff!)} praticiens, suivi de ${depName(hi2.code)} (${h.eur(hi2.tot)}). En bas, ${depName(lo2.code)} (${h.eur(lo2.tot)}) et ${depName(lo.code)} (${h.eur(lo.tot)}), où l'on compte ${h.num(nb(lo.code).dens!)} omnipraticiens pour 100 000 habitants contre ${h.num(nb(hi.code).dens!)} en tête de classement. La densité explique l'essentiel de l'écart ; le ${h.a('classement-departements', 'classement des départements')} donne la liste entière.</p>
<h2>Mettre son propre chiffre en face de la moyenne</h2>
<p>Premier réflexe : retirer de vos recettes ce que l'Assurance Maladie ne voit pas. Un cabinet qui pose beaucoup d'implants peut paraître très au-dessus de la moyenne alors que sa part remboursable est ordinaire. Le simulateur fait ce retrait avant toute comparaison, à partir de la part que vous indiquez.</p>
<p>Deuxième réflexe : vérifier l'année. Une installation en cours d'année, un congé maternité ou un arrêt long donnent un total qui ne se compare pas à celui d'un praticien actif à part entière. Les collaborateurs ont un cas à part : ils reversent une redevance au titulaire, et les comptes UNASA font apparaître ${h.eur(retro)} d'honoraires rétrocédés en moyenne par cabinet en ${UNASA_YEAR}.</p>
<p>Dernier point, la moyenne nationale n'est pas un milieu de classement. Seuls ${h.num(sousMoy.below)} départements sur ${h.num(sousMoy.total)} ont une moyenne inférieure à ${h.eur(o.tot!)}, parce que les départements très peuplés et très dotés en dentistes, aux moyennes basses, pèsent lourd dans le calcul national. Se comparer à son département dit souvent plus que se comparer à la France.</p>
<h2>Des honoraires au bénéfice : les comptes des cabinets</h2>
<p>Les adhérents des organismes de gestion agréés déposent des comptes que l'${h.src('unasa', 'UNASA')} agrège par quart de recettes. Ce sont des cabinets en BNC (bénéfices non commerciaux), pas des sociétés. La marge ne suit pas la taille de façon régulière. Les petits cabinets dépensent peu en personnel, mais leurs cotisations personnelles pèsent plus lourd dans des recettes modestes ; le dernier quart dégage la marge la plus haute malgré des achats et des salaires plus lourds.</p>
${tableQuarts(h)}
<p>Le bénéfice comptable n'est pas encore un revenu disponible : l'impôt sur le revenu reste à payer. Côté revenus, la ${h.src('carcdsfRevenus2024', 'CARCDSF')} mesure un revenu professionnel de ${h.eur(KR.moyen)} en moyenne pour les chirurgiens-dentistes en ${KR.annee}, médiane ${h.eur(KR.mediane)}, avant impôt sur le revenu. Le détail est dans le guide ${h.a('revenu-dentiste', 'revenu des dentistes')}.</p>
<!--mini:revenuPosition-->`,
  },
  en: {
    slug: 'general-dentist-fees',
    nav: 'General dentist',
    card: `${Y} average fees of general dentists in France, trend since 2015 and practice accounts.`,
    title: `General dentist fees France ${YEAR}: averages and spread`,
    description: `French general dentists billed ${e(o.tot!, 'en')} in fees on average in ${Y} (Assurance Maladie): extra-billing share, départements, ten-year trend, practice accounts.`,
    h1: 'Fees of a general dentist in France',
    intro: `Assurance Maladie ${Y} averages, the series since 2015 and the calculator set for general practice.`,
    resume: `A general dentist in private practice in France billed ${e(o.tot!, 'en')} in fees on average in ${Y}: ${e(o.hsd!, 'en')} at the regulated social security rate and ${e(o.dep!, 'en')} of extra-billing (dépassements), which makes ${p(part, 'en')} of the total. The figure comes from Assurance Maladie open data and is averaged over ${n(o.ape!, 'en')} full-time active practitioners out of ${n(o.eff!, 'en')} general dentists, a headcount up ${p(gEff, 'en')} over five years. Fees rose ${p(g10, 'en')} since 2015 but only ${p(g1, 'en')} in the latest year. Location matters: ${e(hi.tot, 'en')} in ${depName(hi.code)} against ${e(lo.tot, 'en')} in ${depName(lo.code)}. Keep in mind that fees are not pay. In the ${UNASA_YEAR} accounts of ${n(ref.echantillon, 'en')} practices reported to UNASA, profit came to ${p(1 - ref.taux, 'en')} of receipts. Implants and private periodontal work are outside the data, so strip them from your own receipts before you compare.`,
    faqs: [
      { q: 'What is the average turnover of a general dentist in France?', a: `France publishes average fees rather than turnover: ${e(o.tot!, 'en')} per full-time active general dentist in ${Y}, counting only work recorded by Assurance Maladie. Accounting figures are wider. Practices reporting to UNASA show ${e(ref.recettes, 'en')} of average net receipts for ${UNASA_YEAR}, which includes everything cashed in, implants and other unlisted procedures included.` },
      { q: 'How much of a French dentist’s billing is extra-billing?', a: `In ${Y}, ${e(o.dep!, 'en')} out of ${e(o.tot!, 'en')}, or ${p(part, 'en')}. Extra-billing is what a dentist charges above the social security base rate, mostly on crowns, bridges and dentures. At national level, DREES put extra-billing at ${p(DP.part, 'en')} of private dentists’ fees in ${DP.annee}; in ${CNS.annee}, prosthetics made up ${p(CNS.structure_honoraires.protheses, 'en', 0)} of dental fees, and extra-billing ${p(CNS.part_depassements_protheses, 'en', 0)} of prosthetic spending.` },
      { q: 'Why did French dentists’ fees jump in 2021?', a: `The general dentist average went from ${e(o.hist['2020'], 'en')} in 2020 to ${e(o.hist['2021'], 'en')} in 2021, up ${p(g2021, 'en')}. 2020 itself had dipped below 2019 (${e(o.hist['2019'], 'en')}). Assurance Maladie files report amounts and nothing about causes, so they cannot tell catch-up activity apart from tariff changes.` },
      { q: 'How many patients does a French dentist treat in a year?', a: `A general dentist in private practice saw ${n(o.patients!, 'en')} different patients on average in ${Y}, according to Assurance Maladie; orthodontists reach ${n(odf.patients!, 'en')}. The count is of people, not appointments. A patient who comes back five times for a crown still counts once in the year.` },
      { q: 'Are salaried dentists in health centres part of these figures?', a: `No. Averages cover dentists in private practice (libéral). Those who also hold a salaried post, known as mixed practice, are ${p(o.mixte!, 'en')} of general dentists in ${Y}. A purely salaried dentist does not appear in private-fee statistics, and dentists who did not work the full year are left out of the average, which keeps full-time active practitioners only.` },
      { q: 'Are general dentist fees in France still going up?', a: `Barely. The average moved from ${e(o.hist[String(Y - 1)], 'en')} in ${Y - 1} to ${e(o.tot!, 'en')} in ${Y}, a change of ${p(g1, 'en')} in current euros, while orthodontists gained ${p(growth(odf, Y - 1, Y)!, 'en')}. Since the 2021 jump, general dentists have added only ${p(growth(o, 2021, Y)!, 'en')} over ${n(Y - 2021, 'en')} years, even as more of them set up in private practice.` },
      { q: 'Which dental specialties exist in France besides general practice?', a: `The dental council (Ordre) recognises three: orthodontics (${n(RP.odf, 'en')} practitioners in the RPPS register), oral surgery (${n(RP.chirurgie_orale, 'en')}) and oral medicine (${n(RP.medecine_bucco_dentaire, 'en')}). Assurance Maladie only separates orthodontists. Oral surgeons and oral medicine specialists stay inside “dentists excluding orthodontics”, the group on this page, and no public statistic splits them out.` },
    ],
    body: (h) => `
<h2>Behind the ${h.eur(o.tot!)} average</h2>
<p>Assurance Maladie files general dentists as “chirurgiens-dentistes hors ODF”, meaning every dentist except orthodontists: ${h.num(o.eff!)} of them in private practice in ${Y}. Only ${h.num(o.ape!)} feed the average. These “full-time active” practitioners worked the whole year under the national agreement (convention), as Assurance Maladie defines them, so the first and last years of a career, when billing is thin, drop out.</p>
<p>Of the ${h.eur(o.tot!)}, ${h.eur(o.hsd!)} is billed at the regulated rate and ${h.eur(o.dep!)} is extra-billing. That split shapes your cost base. Extra-billing comes mostly from prosthetic work, and every crown carries a lab invoice, so a prosthetics-heavy practice tends to show high fees and a high cost ratio at once.</p>
<p>Anything outside the national fee schedule (the nomenclature) is invisible here. Implants, non-reimbursed periodontal treatment, whitening and adult aligners never reach health insurance records, and no public per-dentist figure exists for them (${h.src('dreesCns2025', 'DREES health accounts, sheet 14')}). The calculator asks for that share and takes it out of your receipts before comparing.</p>
<h2>A decade of fees, 2015 to ${Y}</h2>
${tableHist(h)}
<p>In current euros, the general dentist average is up ${h.pct(g10)} over ten years. Two breaks stand out: a dip in 2020, then a ${h.pct(g2021)} jump in 2021. Growth has nearly stalled since, at ${h.pct(g1)} between ${Y - 1} and ${Y}. Over five years the private headcount grew ${h.pct(gEff)}, from ${h.num(o.eff5!)} to ${h.num(o.eff!)}, so patients are spread over more chairs.</p>
<p>None of this is adjusted for inflation. A flat average in nominal terms means a thinner margin if costs keep rising; the ${h.a('taux-de-charges', 'cost ratio guide')} tracks how each expense line moved in practice accounts.</p>
<h2>Profile of the profession</h2>
<ul>
<li>women: ${h.pct(o.femmes!)}, close to parity;</li>
<li>under 35: ${h.pct(o.m35!)}; aged 60 or more: ${h.pct(o.p60!)};</li>
<li>density: ${h.num(o.dens!)} general dentists per 100,000 residents nationwide;</li>
<li>mixed private and salaried practice: ${h.pct(o.mixte!)};</li>
<li>patients seen in the year: ${h.num(o.patients!)} per dentist.</li>
</ul>
<p>Compared with orthodontists, where only ${h.pct(odf.m35!)} are under 35, general practice is young. Almost one general dentist in three is under 35, while those aged 60 or more remain a minority.</p>
<h2>${depName(hi.code)} versus ${depName(lo.code)}</h2>
<p>All ${h.num(c.length)} départements publish an average. ${depName(hi.code)} leads with ${h.eur(hi.tot)} across ${h.num(nb(hi.code).eff!)} dentists, followed by ${depName(hi2.code)} at ${h.eur(hi2.tot)}. ${depName(lo2.code)} (${h.eur(lo2.tot)}) and ${depName(lo.code)} (${h.eur(lo.tot)}) close the list. ${depName(lo.code)} has ${h.num(nb(lo.code).dens!)} general dentists per 100,000 people, ${depName(hi.code)} ${h.num(nb(hi.code).dens!)}: scarcity, not skill, drives most of the gap. Every département is in the ${h.a('classement-departements', 'full ranking')}.</p>
<h2>Putting your own number next to the average</h2>
<p>Start by stripping out what Assurance Maladie cannot see. A practice that places many implants can look far above average while its reimbursable activity is quite ordinary. The calculator does that subtraction first, using the share you enter.</p>
<p>Then check the year itself. Opening mid-year, maternity leave or a long sick leave all produce a total that does not compare with a full-time active practitioner. Associates (collaborateurs) are a special case, since they pay a fee back to the practice owner: UNASA accounts show ${h.eur(retro)} of such retroceded fees per practice on average in ${UNASA_YEAR}.</p>
<p>Finally, the national figure is not a midpoint. Only ${h.num(sousMoy.below)} of ${h.num(sousMoy.total)} départements sit below ${h.eur(o.tot!)}, because populous, well-served départements with low averages carry a heavy weight in the national number. Your own département is usually the fairer yardstick.</p>
<h2>From fees to profit: what practice accounts show</h2>
<p>Practices that belong to an approved management body file accounts that ${h.src('unasa', 'UNASA')} aggregates by receipts quarter. These are sole practices taxed under BNC (bénéfices non commerciaux, the sole-practice profit regime), not companies. Margin does not rise neatly with size. Small practices spend little on staff, yet their own social contributions take a bigger bite out of modest receipts; the top quarter keeps the highest share despite heavier purchases and payroll.</p>
${tableQuarts(h)}
<p>Book profit still faces income tax. For actual pay, ${h.src('carcdsfRevenus2024', 'CARCDSF')}, the dentists’ pension fund, measured professional income of ${h.eur(KR.moyen)} on average for dentists in ${KR.annee}, with a median of ${h.eur(KR.mediane)}, before income tax. More in the ${h.a('revenu-dentiste', 'dentist income guide')}.</p>
<!--mini:revenuPosition-->`,
  },
});
