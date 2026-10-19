import { defineGuide } from '../../lib/guide-types';
import { cotisationsCarcdsf } from '../../lib/engine/carcdsf';
import { reference, UNASA_YEAR } from '../../lib/engine/references';
import { P } from '../../lib/engine/params';
import { formatMoney, formatNumber, formatPercent, formatDecimal } from '../../lib/format';

type L = 'fr' | 'en';
const C = P.cotisations_2026;
const K = P.revenus.carcdsf;
const Q = P.revenus.drees.quantiles;
const DA = P.revenus.drees.annee;
const KR = P.revenus.carcdsf_2024;
const ref = reference('omni');
const pass = C.pass;
const plafond = 5 * pass;
const plancherRc = C.rc_plancher_pass * pass;
const plafondRc = C.rc_plafond_pass * pass;
const zero = cotisationsCarcdsf(0);
const moy = cotisationsCarcdsf(K.assiette_moyenne);
const med = cotisationsCarcdsf(KR.mediane);
const d1 = cotisationsCarcdsf(Q.d1);
const d9 = cotisationsCarcdsf(Q.d9);
const max = cotisationsCarcdsf(plafond);
const forfaits = C.rc_forfait + C.pcv_forfait + C.rid_forfait;
const persoUnasa = ref.cotisPerso * ref.recettes;
const e = (x: number, l: L) => formatMoney(x, 0, l);
const e2 = (x: number, l: L) => formatMoney(x, 2, l);
const n = (x: number, l: L) => formatNumber(x, 0, l);
const p = (x: number, l: L, d = 1) => formatPercent(x, d, l);
const pp = (x: number, l: L) => formatPercent(x, 2, l);
const r2 = (x: number, l: L) => formatDecimal(x, 2, l);

const tableRevenus = (l: L) => {
  const fr = l === 'fr';
  const lignes: Array<[string, string, number]> = [
    [fr ? `1er décile DREES ${DA}` : `DREES bottom decile ${DA}`, '', Q.d1],
    [fr ? `Médiane des revenus déclarés à la CARCDSF ${KR.annee}` : `Median income declared to CARCDSF ${KR.annee}`, '', KR.mediane],
    [fr ? `Assiette moyenne CARCDSF ${K.annee_statistiques}` : `CARCDSF average base ${K.annee_statistiques}`, '', K.assiette_moyenne],
    [fr ? `9e décile DREES ${DA}` : `DREES top decile ${DA}`, '', Q.d9],
    [fr ? 'Plafond : 5 Pass' : 'Ceiling: 5 Pass', '', plafond],
  ];
  const head = fr ? ['Revenu de référence', 'Revenu', 'Retraite de base', 'Complémentaire', 'PCV', 'Invalidité-décès', 'Total', 'Part du revenu'] : ['Reference income', 'Income', 'Basic pension', 'Supplementary', 'PCV', 'Invalidity-death', 'Total', 'Share of income'];
  const rows = lignes.map(([lab, , r]) => { const c = cotisationsCarcdsf(r); return [lab, e(r, l), e(c.rbl, l), e(c.rc, l), e(c.pcv, l), e(c.rid, l), e(c.total, l), p(c.total / r, l)]; });
  return { head, rows };
};

export default defineGuide({
  id: 'cotisations-carcdsf',
  group: 'gestion',
  order: 50,
  mini: 'carcdsf',
  related: ['revenu-dentiste', 'selarl-ou-bnc', 'taux-de-charges', 'omnipraticien'],
  sources: ['carcdsfBareme', 'carcdsfChiffres', 'carcdsfRevenus2024', 'urssafPam', 'dreesRevenus', 'unasa'],
  fr: {
    slug: 'cotisations-carcdsf',
    nav: 'Cotisations CARCDSF',
    card: 'Le barème 2026 de la caisse de retraite des chirurgiens-dentistes, appliqué revenu par revenu.',
    title: 'Cotisations CARCDSF 2026 : barème, plafonds et calcul',
    description: `Cotisations CARCDSF 2026 d’un chirurgien-dentiste : ${e(zero.total, 'fr')} au minimum, ${e(moy.total, 'fr')} au revenu moyen, ${e(max.total, 'fr')} au plafond. Barème complet et calcul détaillé.`,
    h1: 'Cotisations CARCDSF 2026 : le barème de retraite des chirurgiens-dentistes, chiffré',
    intro: 'Les quatre cotisations dues à la caisse en 2026, et ce qu’elles coûtent à chaque niveau de revenu.',
    resume: `En 2026, un chirurgien-dentiste conventionné verse à la CARCDSF quatre cotisations : retraite de base, retraite complémentaire, prestation complémentaire de vieillesse (PCV) et invalidité-décès. Au revenu professionnel moyen des cotisants, ${e(K.assiette_moyenne, 'fr')} selon les statistiques ${K.annee_statistiques} de la caisse, le barème donne ${e(moy.total, 'fr')} par an, soit ${p(moy.total / K.assiette_moyenne, 'fr')} du revenu. Même sans revenu, le praticien doit ${e(zero.total, 'fr')}, à cause des forfaits et de l’assiette minimale du régime de base. Le total cesse d’augmenter à ${e(plafond, 'fr')}, cinq fois le plafond annuel de la Sécurité sociale (Pass) de ${e(pass, 'fr')} : il plafonne alors à ${e(max.total, 'fr')}. Le poids relatif baisse donc à mesure que le revenu monte, de ${p(d1.total / Q.d1, 'fr')} au 1er décile des revenus DREES à ${p(d9.total / Q.d9, 'fr')} au 9e. Ces montants ne comprennent ni la maladie, ni les allocations familiales, ni la CSG-CRDS, appelées par l’Urssaf.`,
    faqs: [
      { q: 'Combien coûte la CARCDSF par an à un chirurgien-dentiste ?', a: `Au barème 2026, ${e(moy.total, 'fr')} pour un revenu professionnel de ${e(K.assiette_moyenne, 'fr')}, l’assiette moyenne publiée par la caisse pour ${K.annee_statistiques}. À la médiane des revenus ${KR.annee} déclarés à la caisse (${e(KR.mediane, 'fr')}), le total tombe à ${e(med.total, 'fr')}. La caisse affiche de son côté une cotisation moyenne de ${e(K.cotisation_moyenne, 'fr')}, une moyenne de montants réellement appelés qui n’est pas le barème appliqué au revenu moyen.` },
      { q: 'Quelle cotisation CARCDSF paie un dentiste sans revenu ou en tout début d’activité ?', a: `${e(zero.total, 'fr')} en 2026 pour un revenu nul : ${e(C.rc_forfait, 'fr')} de forfait de retraite complémentaire, ${e(C.pcv_forfait, 'fr')} de forfait PCV, ${e(C.rid_forfait, 'fr')} d’invalidité-décès, plus la retraite de base calculée sur l’assiette minimale de ${e(C.rbl_assiette_minimale, 'fr')}. Ces forfaits ne dépendent pas du revenu. La part proportionnelle de la complémentaire ne démarre qu’à ${e(plancherRc, 'fr')} de revenu.` },
      { q: 'À partir de quel revenu les cotisations CARCDSF n’augmentent-elles plus ?', a: `À ${e(plafond, 'fr')} de revenu en 2026, soit cinq Pass de ${e(pass, 'fr')}. Toutes les parts proportionnelles s’arrêtent à ce plafond : la deuxième tranche de la retraite de base, la complémentaire et la PCV. Au-delà, le total reste à ${e(max.total, 'fr')} par an, quel que soit le revenu. Un praticien qui gagne deux fois ce plafond paie donc la même somme, qui ne représente plus qu’une fraction réduite de son revenu.` },
      { q: 'Comment se calcule la retraite complémentaire de la CARCDSF en 2026 ?', a: `Un forfait de ${e2(C.rc_forfait, 'fr')}, plus ${pp(C.rc_taux, 'fr')} de la part du revenu comprise entre ${e(plancherRc, 'fr')} et ${e(plafondRc, 'fr')}, c’est-à-dire entre ${r2(C.rc_plancher_pass, 'fr')} et ${n(C.rc_plafond_pass, 'fr')} Pass. Sous le seuil bas, seul le forfait est dû. Au revenu moyen des cotisants, la complémentaire atteint ${e(moy.rc, 'fr')} et devient la plus lourde des quatre cotisations, devant la retraite de base (${e(moy.rbl, 'fr')}).` },
      { q: 'La CARCDSF couvre-t-elle aussi la maladie et les allocations familiales ?', a: `Non. La caisse gère la retraite de base, la complémentaire, la PCV et l’invalidité-décès. L’assurance maladie, les allocations familiales, la CSG-CRDS, la contribution aux unions régionales des professionnels de santé et la formation professionnelle sont appelées par l’Urssaf, avec leurs propres taux. Dans les comptes UNASA ${UNASA_YEAR}, l’ensemble des cotisations personnelles et de la CSG déductible pèse ${p(ref.cotisPerso, 'fr')} des recettes.` },
      { q: 'Combien de chirurgiens-dentistes cotisent à la CARCDSF ?', a: `${n(K.cotisants_dentistes, 'fr')} chirurgiens-dentistes cotisants selon les chiffres clés ${K.annee_statistiques} de la caisse, qui affilie aussi les sages-femmes. Elle a enregistré ${n(K.affiliations, 'fr')} nouvelles affiliations de dentistes, à ${r2(K.age_moyen_affiliation, 'fr')} ans en moyenne. L’assiette moyenne des cotisants atteint ${e(K.assiette_moyenne, 'fr')}, et la cotisation moyenne ${e(K.cotisation_moyenne, 'fr')}.` },
    ],
    body: (h) => {
      const t = tableRevenus('fr');
      return `
<h2>Les quatre lignes de l’appel de cotisations</h2>
<p>La CARCDSF (caisse autonome de retraite des chirurgiens-dentistes et des sages-femmes) appelle en 2026 quatre cotisations, toutes fixées par son barème (${h.src('carcdsfBareme')}). Le Pass, plafond annuel de la Sécurité sociale, vaut ${h.eur(pass)} et sert d’unité à presque toutes les bornes.</p>
<ul>
<li><strong>Retraite de base</strong> : ${h.pct(C.rbl_tranche1, 2)} du revenu jusqu’à un Pass, plus ${h.pct(C.rbl_tranche2, 2)} du revenu jusqu’à cinq Pass. L’assiette ne descend jamais sous ${h.eur(C.rbl_assiette_minimale)}.</li>
<li><strong>Retraite complémentaire</strong> : un forfait de ${h.eur(C.rc_forfait, 2)}, plus ${h.pct(C.rc_taux, 2)} de la part du revenu située entre ${h.eur(plancherRc)} et ${h.eur(plafondRc)}.</li>
<li><strong>Prestation complémentaire de vieillesse (PCV)</strong> : un forfait de ${h.eur(C.pcv_forfait, 2)} et ${h.pct(C.pcv_taux, 3)} du revenu jusqu’à cinq Pass, pour la part qui reste à la charge du praticien conventionné.</li>
<li><strong>Invalidité-décès</strong> : un forfait de ${h.eur(C.rid_forfait)}, identique pour tous.</li>
</ul>
<p>Additionnés, les trois forfaits pèsent ${h.eur(forfaits)} avant le moindre euro de revenu. Ils expliquent pourquoi un praticien à faible activité paie une part élevée de ce qu’il gagne.</p>
<h2>Le barème appliqué à cinq revenus</h2>
<p>Le tableau applique le barème 2026 à des revenus tirés des données publiques : les 1er et 9e déciles de la distribution DREES ${DA} (${h.src('dreesRevenus', 'DREES')}), la médiane des revenus ${KR.annee} déclarés à la caisse (${h.src('carcdsfRevenus2024', 'CARCDSF')}), l’assiette moyenne publiée par la caisse et le plafond de cinq Pass. Le calcul est celui du simulateur de la page.</p>
${h.table(t.head, t.rows, 'Cotisations CARCDSF 2026 d’un chirurgien-dentiste conventionné, selon le revenu professionnel', ['l', 'r', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>La ligne de la retraite complémentaire est celle qui bouge le plus. Entre le 1er et le 9e décile, elle passe de ${h.eur(d1.rc)} à ${h.eur(d9.rc)}, alors que la retraite de base ne gagne que ${h.eur(d9.rbl - d1.rbl)}. Le taux de ${h.pct(C.rc_taux, 2)} s’applique à toute la tranche jusqu’à cinq Pass, tandis que la retraite de base change de taux dès le premier Pass.</p>
<h2>Un poids qui baisse quand le revenu monte</h2>
<p>Rapportées au revenu, les cotisations dessinent une pente descendante : ${h.pct(d1.total / Q.d1)} au 1er décile, ${h.pct(med.total / KR.mediane)} à la médiane, ${h.pct(d9.total / Q.d9)} au 9e décile. Les forfaits pèsent lourd sur les petits revenus, puis les plafonds arrêtent la progression des grosses assiettes. Au-delà de ${h.eur(plafond)}, chaque euro de revenu supplémentaire ne coûte plus rien à la CARCDSF.</p>
<p>Cette forme explique un écart visible dans les chiffres de la caisse (${h.src('carcdsfChiffres', 'chiffres clés')}). Le barème appliqué à l’assiette moyenne donne ${h.eur(moy.total)}, mais la cotisation moyenne publiée n’est que de ${h.eur(K.cotisation_moyenne)}. Quand une cotisation croît moins vite que le revenu, la moyenne des cotisations reste sous la cotisation du revenu moyen ; la caisse ne publie pas le détail qui permettrait de répartir l’écart entre cet effet et les situations particulières de ses cotisants.</p>
<h2>Le revenu retenu et le calendrier</h2>
<p>Le barème s’applique au revenu professionnel déclaré, c’est-à-dire au bénéfice non commercial pour un praticien en exercice individuel. Le simulateur demande le revenu 2025, celui sur lequel la caisse calcule l’appel 2026. Pour un associé de SELARL, la question de l’assiette se pose autrement : rémunération de gérant et part des dividendes au-delà de ${h.pct(P.fiscal_2026.seuil_dividendes_capital, 0)} du capital, détaillées sur la page ${h.a('selarl-ou-bnc', 'SELARL ou BNC')}.</p>
<p>Deux précisions sur les valeurs. Le Pass retenu est celui publié par l’Urssaf pour 2026 ; une coquille sur la page de la caisse, relevée lors de la mise à jour, n’a pas été reprise. L’assiette minimale de la retraite de base, ${h.eur(C.rbl_assiette_minimale)}, est indexée sur le Smic horaire du 1er janvier 2026, comme l’indique le barème.</p>
<h2>Ce que l’Urssaf appelle à côté</h2>
<p>La CARCDSF ne représente qu’une partie des prélèvements personnels. L’Urssaf appelle l’assurance maladie, les allocations familiales, la CSG-CRDS, la contribution aux unions régionales des professionnels de santé et la contribution à la formation professionnelle (${h.src('urssafPam', 'taux Urssaf des praticiens')}). Le site ne calcule pas ces lignes. Les comptes ${UNASA_YEAR} des cabinets adhérents de l’UNASA donnent l’ordre de grandeur de l’ensemble : ${h.pct(ref.cotisPerso)} des recettes, soit environ ${h.eur(persoUnasa)} sur des recettes moyennes de ${h.eur(ref.recettes)} (${h.src('unasa', 'UNASA')}). Pour voir ce que tout cela laisse au praticien, la page ${h.a('revenu-dentiste', 'revenu des dentistes')} rassemble les sources publiées.</p>`;
    },
  },
  en: {
    slug: 'carcdsf-contributions',
    nav: 'CARCDSF contributions',
    card: 'The 2026 scale of the French dentists’ pension fund, applied income by income.',
    title: 'CARCDSF contributions 2026: the dentists’ pension scale',
    description: `2026 CARCDSF pension contributions for a dentist in France: ${e(zero.total, 'en')} minimum, ${e(moy.total, 'en')} at average income, ${e(max.total, 'en')} at the cap. Full scale, line by line, in tables.`,
    h1: 'CARCDSF contributions in 2026: the French dentists’ pension scale, worked out',
    intro: 'The four contributions the fund collects in 2026, and what they cost at each level of income.',
    resume: `CARCDSF, the pension fund for French dentists and midwives, collects four contributions in 2026 from a dentist working under the national agreement: basic pension, supplementary pension, the PCV (prestation complémentaire de vieillesse, an extra pension partly funded by health insurance) and invalidity-death cover. On the members’ average professional income, ${e(K.assiette_moyenne, 'en')} in the fund’s ${K.annee_statistiques} statistics, the scale comes to ${e(moy.total, 'en')} a year, or ${p(moy.total / K.assiette_moyenne, 'en')} of income. With no income at all, a dentist still owes ${e(zero.total, 'en')}, because of flat amounts and a minimum base for the basic pension. The bill stops rising at ${e(plafond, 'en')}, five times the social security ceiling (Pass) of ${e(pass, 'en')}, where it tops out at ${e(max.total, 'en')}. The share of income therefore falls as income rises, from ${p(d1.total / Q.d1, 'en')} at the DREES bottom decile to ${p(d9.total / Q.d9, 'en')} at the top decile. Health cover, family benefits and CSG-CRDS are separate, collected by Urssaf.`,
    faqs: [
      { q: 'How much does a dentist in France pay CARCDSF each year?', a: `Under the 2026 scale, ${e(moy.total, 'en')} on professional income of ${e(K.assiette_moyenne, 'en')}, the average base the fund reports for ${K.annee_statistiques}. At the median income declared to the fund for ${KR.annee} (${e(KR.mediane, 'en')}) the total is ${e(med.total, 'en')}. The fund also reports an average contribution of ${e(K.cotisation_moyenne, 'en')}, which averages amounts actually billed and is not the scale applied to average income.` },
      { q: 'What is the minimum CARCDSF contribution for a dentist with little or no income?', a: `${e(zero.total, 'en')} in 2026 on zero income: ${e(C.rc_forfait, 'en')} flat supplementary pension, ${e(C.pcv_forfait, 'en')} flat PCV, ${e(C.rid_forfait, 'en')} invalidity-death, and the basic pension worked out on the minimum base of ${e(C.rbl_assiette_minimale, 'en')}. None of these depends on income, and the income-linked part of the supplementary pension only starts at ${e(plancherRc, 'en')}.` },
      { q: 'Is there a ceiling on CARCDSF contributions?', a: `Yes, at ${e(plafond, 'en')} of income in 2026, five times the ${e(pass, 'en')} Pass. Every income-linked part stops there: the second band of the basic pension, the supplementary pension and the PCV. Above it the total stays at ${e(max.total, 'en')} a year whatever the income, so a dentist earning twice the ceiling pays the same amount as one earning exactly the ceiling.` },
      { q: 'How is the CARCDSF supplementary pension contribution worked out?', a: `A flat ${e2(C.rc_forfait, 'en')}, plus ${pp(C.rc_taux, 'en')} of income between ${e(plancherRc, 'en')} and ${e(plafondRc, 'en')}, that is between ${r2(C.rc_plancher_pass, 'en')} and ${n(C.rc_plafond_pass, 'en')} times the Pass. Below the lower bound only the flat amount is due. At members’ average income the supplementary pension reaches ${e(moy.rc, 'en')}, the largest of the four lines, ahead of the basic pension at ${e(moy.rbl, 'en')}.` },
      { q: 'Does CARCDSF also cover health insurance and family benefits?', a: `No. The fund handles the basic and supplementary pensions, the PCV and invalidity-death cover. Health insurance, family benefits, CSG-CRDS (social levies on income), the contribution to regional health professional unions and the training levy are all collected by Urssaf at their own rates. In ${UNASA_YEAR} UNASA practice accounts, personal contributions of every kind plus deductible CSG came to ${p(ref.cotisPerso, 'en')} of receipts.` },
      { q: 'How many dentists contribute to CARCDSF?', a: `${n(K.cotisants_dentistes, 'en')} contributing dentists according to the fund’s ${K.annee_statistiques} key figures; the same fund also covers midwives. It recorded ${n(K.affiliations, 'en')} new dentist registrations, at an average age of ${r2(K.age_moyen_affiliation, 'en')}. Members’ average contribution base was ${e(K.assiette_moyenne, 'en')} and their average contribution ${e(K.cotisation_moyenne, 'en')}, the amount actually billed.` },
    ],
    body: (h) => {
      const t = tableRevenus('en');
      return `
<h2>Four lines on the bill</h2>
<p>CARCDSF (caisse autonome de retraite des chirurgiens-dentistes et des sages-femmes) sets four contributions for 2026 in its scale (${h.src('carcdsfBareme')}). The Pass, France’s annual social security ceiling, is ${h.eur(pass)} and serves as the unit for almost every threshold.</p>
<ul>
<li><strong>Basic pension</strong>: ${h.pct(C.rbl_tranche1, 2)} of income up to one Pass, plus ${h.pct(C.rbl_tranche2, 2)} of income up to five Pass. The base never drops below ${h.eur(C.rbl_assiette_minimale)}.</li>
<li><strong>Supplementary pension</strong>: a flat ${h.eur(C.rc_forfait, 2)}, plus ${h.pct(C.rc_taux, 2)} of the slice of income between ${h.eur(plancherRc)} and ${h.eur(plafondRc)}.</li>
<li><strong>PCV</strong>: a flat ${h.eur(C.pcv_forfait, 2)} and ${h.pct(C.pcv_taux, 3)} of income up to five Pass, for the share left to a dentist under the national agreement.</li>
<li><strong>Invalidity-death</strong>: a flat ${h.eur(C.rid_forfait)}, the same for everyone.</li>
</ul>
<p>Together, the three flat amounts reach ${h.eur(forfaits)} before a single euro of income is counted, which is why a dentist with little activity pays a large share of what they earn.</p>
<h2>The scale at five income levels</h2>
<p>The table runs the 2026 scale on incomes taken from public data: the bottom and top deciles of the DREES ${DA} income spread (${h.src('dreesRevenus', 'DREES')}), the median ${KR.annee} income declared to the fund (${h.src('carcdsfRevenus2024', 'CARCDSF')}), the fund’s own average base, and the five-Pass ceiling. It uses the same calculation as the calculator on this page.</p>
${h.table(t.head, t.rows, '2026 CARCDSF contributions of a dentist under the national agreement, by professional income', ['l', 'r', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>The supplementary pension is the line that moves most. From bottom to top decile it climbs from ${h.eur(d1.rc)} to ${h.eur(d9.rc)}, while the basic pension adds only ${h.eur(d9.rbl - d1.rbl)}. The ${h.pct(C.rc_taux, 2)} rate covers the whole band up to five Pass, whereas the basic pension switches to its lower rate after the first Pass.</p>
<h2>A burden that eases with income</h2>
<p>As a share of income, contributions slope downward: ${h.pct(d1.total / Q.d1)} at the bottom decile, ${h.pct(med.total / KR.mediane)} at the median, ${h.pct(d9.total / Q.d9)} at the top decile. Flat amounts weigh on small incomes, and the ceilings then halt growth on large ones. Past ${h.eur(plafond)}, extra income costs nothing more in CARCDSF contributions.</p>
<p>That shape accounts for a gap in the fund’s published figures (${h.src('carcdsfChiffres', 'key figures')}). The scale applied to the average base gives ${h.eur(moy.total)}, yet the published average contribution is ${h.eur(K.cotisation_moyenne)}. When contributions grow more slowly than income, the average contribution sits below the contribution on average income; the fund does not publish enough detail to split the gap between that effect and its members’ individual circumstances.</p>
<h2>Which income, and when</h2>
<p>The scale applies to declared professional income, which for a sole practitioner means BNC profit (bénéfices non commerciaux). The calculator asks for 2025 income, the year the fund uses for the 2026 bill. For a partner in a SELARL the base is built differently, from the manager’s pay and dividends above ${h.pct(P.fiscal_2026.seuil_dividendes_capital, 0)} of capital, covered on the ${h.a('selarl-ou-bnc', 'SELARL or sole practice')} page.</p>
<p>Two notes on the values. The Pass used is the 2026 figure published by Urssaf; a typo on the fund’s own page, spotted during the update, was not carried over. The minimum base for the basic pension, ${h.eur(C.rbl_assiette_minimale)}, is tied to the hourly minimum wage of 1 January 2026, as the scale states.</p>
<h2>What Urssaf collects on top</h2>
<p>CARCDSF is only part of a dentist’s personal contributions. Urssaf collects health insurance, family benefits, CSG-CRDS, the regional health professional union levy and the training levy (${h.src('urssafPam', 'Urssaf rates for medical practitioners')}). This site does not compute those lines. For scale, ${UNASA_YEAR} accounts of UNASA member practices put all personal contributions together at ${h.pct(ref.cotisPerso)} of receipts, about ${h.eur(persoUnasa)} on average receipts of ${h.eur(ref.recettes)} (${h.src('unasa', 'UNASA')}). For what all this leaves the dentist, the ${h.a('revenu-dentiste', 'dentist income')} page brings the published sources together.</p>`;
    },
  },
});
