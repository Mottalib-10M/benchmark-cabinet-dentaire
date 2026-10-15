import { defineGuide } from '../../lib/guide-types';
import { reference, rangRevenu, UNASA_YEAR } from '../../lib/engine/references';
import { FR, DATA_YEAR } from '../../lib/engine/data';
import { P } from '../../lib/engine/params';
import { formatMoney, formatNumber, formatPercent, formatDecimal } from '../../lib/format';

type L = 'fr' | 'en';
const D = P.revenus.drees;
const Q = D.quantiles;
const A = D.annee_precedente;
const I = P.revenus.insee;
const K = P.revenus.carcdsf;
const ref = reference('omni');
const hono = FR.p.ensemble!;
const Y = DATA_YEAR;
const gMoy = D.moyen / A.moyen - 1;
const ans = D.annee - A.annee;
const fourch = [D.moyen, Q.mediane, D.liberal_moyen, I.mensuel_moyen * 12, K.assiette_moyenne, ref.benefice];
const fMin = Math.min(...fourch), fMax = Math.max(...fourch);
const ecartHF = D.hommes / D.femmes - 1;
const partLib = D.liberal_moyen / D.moyen;
const posK = rangRevenu(K.assiette_moyenne);
const posU = rangRevenu(ref.benefice);
const e = (x: number, l: L) => formatMoney(x, 0, l);
const n = (x: number, l: L) => formatNumber(x, 0, l);
const p = (x: number, l: L, d = 1) => formatPercent(x, d, l);
const r1 = (x: number, l: L) => formatDecimal(x, 1, l);
const cent = (x: { centile: number | null; sous: boolean; au: boolean }, l: L) => x.centile == null ? (l === 'fr' ? (x.sous ? 'sous le 1er décile' : 'au-delà du 9e décile') : (x.sous ? 'below the bottom decile' : 'above the top decile')) : (l === 'fr' ? `vers le ${x.centile}e centile` : `around the ${x.centile}th percentile`);

const tableSources = (l: L) => {
  const fr = l === 'fr';
  const head = fr ? ['Source', 'Année', 'Ce qui est mesuré', 'Montant annuel'] : ['Source', 'Year', 'What is measured', 'Annual amount'];
  const rows = [
    [fr ? 'DREES, moyenne' : 'DREES, average', D.annee, fr ? 'Revenu d’activité libéral et salarié, après charges et cotisations' : 'Private and salaried earnings after costs and contributions', e(D.moyen, l)],
    [fr ? 'DREES, médiane' : 'DREES, median', D.annee, fr ? 'Même champ, praticien du milieu' : 'Same scope, middle practitioner', e(Q.mediane, l)],
    [fr ? 'DREES, part libérale' : 'DREES, private share', D.annee, fr ? 'Revenu libéral seul, en moyenne' : 'Private-practice income only, average', e(D.liberal_moyen, l)],
    ['Insee', I.annee, fr ? 'Revenu des non-salariés de la pratique dentaire, moyenne mensuelle × 12' : 'Self-employed in dental practice, monthly average × 12', e(I.mensuel_moyen * 12, l)],
    ['CARCDSF', K.annee_statistiques, fr ? 'Assiette moyenne des cotisations des dentistes' : 'Average contribution base of dentists', e(K.assiette_moyenne, l)],
    ['UNASA', UNASA_YEAR, fr ? 'Bénéfice comptable moyen des cabinets adhérents en BNC' : 'Average book profit of member practices taxed as BNC', e(ref.benefice, l)],
    ['Assurance Maladie', Y, fr ? 'Honoraires moyens, avant toute charge (pas un revenu)' : 'Average fees before any cost (not income)', e(hono.tot!, l)],
  ];
  return { head, rows };
};
const tableQuantiles = (l: L) => {
  const fr = l === 'fr';
  const head = fr ? ['Repère DREES', 'Revenu annuel', 'Par mois', 'Rapport à la médiane'] : ['DREES marker', 'Annual income', 'Per month', 'Ratio to median'];
  const lab = fr ? ['1er décile', '1er quartile', 'Médiane', '3e quartile', '9e décile'] : ['Bottom decile', 'Lower quartile', 'Median', 'Upper quartile', 'Top decile'];
  const v = [Q.d1, Q.q1, Q.mediane, Q.q3, Q.d9];
  return { head, rows: v.map((x, i) => [lab[i], e(x, l), e(x / 12, l), r1(x / Q.mediane, l)]) };
};

export default defineGuide({
  id: 'revenu-dentiste',
  group: 'gestion',
  order: 50,
  mini: 'revenuPosition',
  related: ['taux-de-charges', 'cotisations-carcdsf', 'selarl-ou-bnc', 'omnipraticien', 'orthodontiste'],
  sources: ['dreesRevenus', 'inseeNonSalaries', 'carcdsfChiffres', 'unasa', 'ameliHonoraires'],
  fr: {
    slug: 'revenu-dentiste',
    nav: 'Revenu des dentistes',
    card: 'Médiane, déciles, écart selon l’ancienneté : ce que gagnent vraiment les chirurgiens-dentistes libéraux.',
    title: 'Revenu dentiste libéral : médiane et déciles, repères 2026',
    description: `Revenu d’un chirurgien-dentiste libéral : médiane DREES de ${e(Q.mediane, 'fr')}, moyenne ${e(D.moyen, 'fr')}, repères Insee, CARCDSF 2025 et UNASA. Les sources, sans honoraires.`,
    h1: 'Ce que gagne un chirurgien-dentiste libéral, source par source',
    intro: 'Les revenus publiés par la DREES, l’Insee, la CARCDSF et l’UNASA, et ce que chacun mesure.',
    resume: `Le chirurgien-dentiste libéral du milieu de la distribution a gagné ${e(Q.mediane, 'fr')} en ${D.annee}, selon la DREES, après charges du cabinet et cotisations sociales, avant impôt sur le revenu. La moyenne est plus haute, ${e(D.moyen, 'fr')}, tirée par le haut de l’échelle : un praticien sur dix dépasse ${e(Q.d9, 'fr')}, un sur dix reste sous ${e(Q.d1, 'fr')}, soit un rapport interdécile de ${r1(D.rapport_interdecile, 'fr')}. Ces chiffres couvrent les praticiens conventionnés de 70 ans ou moins, installés avant l’année, remplaçants exclus, toutes spécialités dentaires confondues. Les autres sources tombent dans le même ordre de grandeur : ${e(I.mensuel_moyen, 'fr')} par mois en moyenne pour l’Insee (${I.annee}), ${e(K.assiette_moyenne, 'fr')} d’assiette moyenne de cotisations à la CARCDSF (statistiques ${K.annee_statistiques}), ${e(ref.benefice, 'fr')} de bénéfice moyen pour les cabinets suivis par l’UNASA en ${UNASA_YEAR}. Les ${e(hono.tot!, 'fr')} d’honoraires moyens publiés par l’Assurance Maladie pour ${Y} ne sont pas un revenu : il faut en retirer toutes les charges.`,
    faqs: [
      { q: 'Quel est le revenu médian d’un chirurgien-dentiste libéral en France ?', a: `${e(Q.mediane, 'fr')} par an en ${D.annee}, d’après la DREES, soit environ ${e(Q.mediane / 12, 'fr')} par mois. C’est un revenu d’activité net des charges professionnelles et des cotisations sociales, avant impôt sur le revenu, qui additionne la part libérale et une éventuelle part salariée. La moitié des praticiens gagne moins, l’autre moitié davantage. La moyenne, ${e(D.moyen, 'fr')}, est plus élevée parce que les hauts revenus la tirent vers le haut.` },
      { q: 'Combien gagne un dentiste par mois en France ?', a: `L’Insee, qui recense ${n(I.effectifs, 'fr')} non-salariés de la pratique dentaire en ${I.annee}, publie un revenu mensuel moyen de ${e(I.mensuel_moyen, 'fr')} et une médiane de ${e(I.mensuel_mediane, 'fr')}. Le 1er décile se situe à ${e(I.mensuel_d1, 'fr')} par mois, le 9e à ${e(I.mensuel_d9, 'fr')}. Ces montants sont nets de charges et de cotisations, avant impôt, et lissés sur l’année : ce n’est pas ce qui tombe chaque mois sur le compte.` },
      { q: 'Les chirurgiens-dentistes hommes gagnent-ils plus que les femmes ?', a: `En moyenne, oui : ${e(D.hommes, 'fr')} pour les hommes et ${e(D.femmes, 'fr')} pour les femmes en ${D.annee}, un écart de ${p(ecartHF, 'fr', 0)} selon la DREES. Ce chiffre brut ne tient compte ni du temps de travail, ni de l’ancienneté, ni de la spécialité. Les femmes représentent ${p(I.femmes, 'fr', 0)} des non-salariés du secteur selon l’Insee. L’écart publié ne mesure donc pas une différence à travail égal.` },
      { q: 'Combien gagne un dentiste dans ses dix premières années d’installation ?', a: `${e(D.installes_moins_10_ans, 'fr')} en moyenne en ${D.annee} pour les praticiens installés depuis moins de dix ans, selon la DREES. Le revenu moyen monte à ${e(D.installes_10_29_ans, 'fr')} entre 10 et 29 ans d’installation, puis redescend à ${e(D.installes_30_ans_plus, 'fr')} au-delà de 30 ans. Le remboursement en capital d’un emprunt de rachat n’est pas une charge : il n’est pas déduit de ce revenu.` },
      { q: 'À partir de quel revenu un dentiste est-il dans les 10 % les mieux payés ?', a: `Au-delà de ${e(Q.d9, 'fr')} de revenu annuel en ${D.annee}, le 9e décile publié par la DREES, soit plus de ${e(Q.d9 / 12, 'fr')} par mois. Le quart supérieur commence à ${e(Q.q3, 'fr')}. La DREES ne publie rien au-dessus du 9e décile : aucune source ne permet de situer les tout premiers centiles, et le simulateur de cette page s’arrête donc à « au-delà du 9e décile ».` },
      { q: 'Le revenu des chirurgiens-dentistes a-t-il progressé depuis 2017 ?', a: `En euros courants, oui. La DREES mesurait un revenu moyen de ${e(A.moyen, 'fr')} en ${A.annee} et de ${e(D.moyen, 'fr')} en ${D.annee}, soit ${p(gMoy, 'fr')} en ${n(ans, 'fr')} ans. La médiane est passée de ${e(A.mediane, 'fr')} à ${e(Q.mediane, 'fr')}. Ces montants ne sont pas corrigés de l’inflation. L’année ${D.annee} reste la dernière publiée, et ${D.annee} fut aussi l’année du fort rebond des honoraires après 2020.` },
    ],
    body: (h) => {
      const s = tableSources('fr'); const q = tableQuantiles('fr');
      return `
<h2>Une question, plusieurs définitions</h2>
<p>Chercher « le revenu d’un dentiste » renvoie à des montants qui ne mesurent pas la même chose. La DREES suit le revenu d’activité des praticiens conventionnés (${h.src('dreesRevenus', 'DREES')}). L’Insee compte les non-salariés de la pratique dentaire au sens de la nomenclature d’activités (${h.src('inseeNonSalaries', 'Insee')}). La CARCDSF, caisse de retraite des chirurgiens-dentistes et des sages-femmes, publie l’assiette moyenne sur laquelle ses cotisants paient (${h.src('carcdsfChiffres', 'CARCDSF')}). L’UNASA agrège les comptes des cabinets adhérents de ses organismes de gestion (${h.src('unasa', 'UNASA')}). L’Assurance Maladie, enfin, publie des honoraires, ce qui n’a rien d’un revenu.</p>
${h.table(s.head, s.rows, 'Revenus et honoraires des chirurgiens-dentistes libéraux selon la source', ['l', 'r', 'l', 'r'])}
<p>Une fois les honoraires écartés, les sources se tiennent entre ${h.eur(fMin)} et ${h.eur(fMax)} par an, avec des écarts qui tiennent au champ et à l’année. La DREES inclut une éventuelle activité salariée et exclut les praticiens de plus de 70 ans. L’assiette de la CARCDSF ne retient que le revenu professionnel non salarié. L’UNASA ne voit que les cabinets adhérents, en entreprise individuelle, sans les SELARL. Aucun de ces chiffres n’est faux ; aucun ne répond seul à la question.</p>
<h2>Une distribution très étirée</h2>
<p>La moyenne trompe ici plus qu’ailleurs. Avec un rapport de ${h.num(D.rapport_interdecile, 1)} entre le 9e et le 1er décile, la DREES publie un écart qu’elle ne décompose pas : temps de travail, taille du cabinet et ancienneté s’y mêlent sans être chiffrés séparément. Le tableau donne les cinq repères publiés par la DREES pour ${D.annee}.</p>
${h.table(q.head, q.rows, `Distribution des revenus d’activité des chirurgiens-dentistes libéraux, DREES, revenus ${D.annee}`, ['l', 'r', 'r', 'r'])}
<p>Entre deux repères, le simulateur de la page interpole en ligne droite : c’est une approximation, la DREES ne publiant pas la courbe complète. Il situe par exemple l’assiette moyenne CARCDSF ${cent(posK, 'fr')} et le bénéfice moyen UNASA ${cent(posU, 'fr')}, ce qui confirme que la moyenne se trouve nettement au-dessus de la médiane.</p>
<h2>L’ancienneté pèse plus que tout autre facteur publié</h2>
<p>La DREES croise le revenu avec la durée d’installation. Les praticiens installés depuis moins de dix ans gagnent ${h.eur(D.installes_moins_10_ans)} en moyenne, ceux installés depuis 10 à 29 ans ${h.eur(D.installes_10_29_ans)}, ceux qui ont passé 30 ans ${h.eur(D.installes_30_ans_plus)}. La courbe monte, plafonne, puis s’infléchit en fin de carrière ; la DREES n’en publie pas les causes.</p>
<p>L’écart entre hommes et femmes, ${h.eur(D.hommes)} contre ${h.eur(D.femmes)}, se lit avec prudence. L’Insee compte ${h.pct(I.femmes, 0)} de femmes parmi les non-salariés du secteur, pour ${h.pct(I.plus_60_ans, 0)} de praticiens de plus de 60 ans. Les données publiées ne croisent pas le sexe avec l’ancienneté ni le temps de travail, et l’on ne peut pas en tirer un écart à activité égale.</p>
<h2>Des honoraires au revenu</h2>
<p>Les ${h.eur(hono.tot!)} d’honoraires moyens que l’Assurance Maladie publie pour ${Y} portent sur les actes remboursables d’un praticien actif à part entière. Les comptes des cabinets montrent ce qui en reste. Chez les adhérents de l’UNASA, le bénéfice représente ${h.pct(1 - ref.taux)} des recettes en ${UNASA_YEAR}, après achats (${h.pct(ref.achats)}), personnel (${h.pct(ref.personnel)}), loyer (${h.pct(ref.loyer)}) et cotisations sociales personnelles avec la CSG déductible (${h.pct(ref.cotisPerso)}). Le détail par poste et par taille de cabinet figure sur la page ${h.a('taux-de-charges', 'taux de charges')}.</p>
<p>Ce bénéfice n’est pas encore le revenu disponible. L’impôt sur le revenu reste à payer, et le remboursement en capital des emprunts de rachat ou d’équipement sort de la trésorerie sans passer par les charges. Deux praticiens au même bénéfice peuvent donc vivre avec des sommes très différentes. Le détail des ${h.a('cotisations-carcdsf', 'cotisations de retraite CARCDSF')} et, pour ceux qui exercent en société, ${h.a('selarl-ou-bnc', 'l’imposition d’une SELARL')} complètent le tableau.</p>
<h2>Ce qu’aucune source ne publie</h2>
<ul>
<li>Aucun revenu officiel par spécialité : la DREES ne distingue ni les orthodontistes, ni la chirurgie orale, ni la médecine bucco-dentaire.</li>
<li>Aucun revenu par département : seuls les honoraires sont publiés à cette échelle, sur ${h.a('classement-departements', 'le classement des départements')}.</li>
<li>Rien sur les revenus tirés de l’implantologie ou de la parodontie, actes hors nomenclature que les données de l’Assurance Maladie ne voient pas.</li>
<li>Rien de plus récent que ${D.annee} pour la DREES : les revenus ${D.annee + 1} et suivants n’étaient pas publiés au moment de la mise à jour.</li>
</ul>`;
    },
  },
  en: {
    slug: 'dentist-income',
    nav: 'Dentist income',
    card: 'Median, deciles, the effect of seniority: what dentists in private practice in France actually earn.',
    title: 'Dentist income in France: median, deciles and 2026 sources',
    description: `French dentist income: DREES median ${e(Q.mediane, 'en')}, average ${e(D.moyen, 'en')}, plus Insee, CARCDSF 2025 and UNASA figures. Each source explained, with fees kept apart.`,
    h1: 'What a dentist in private practice earns in France, source by source',
    intro: 'Income figures from DREES, Insee, CARCDSF and UNASA, and what each of them actually counts.',
    resume: `The middle dentist in French private practice earned ${e(Q.mediane, 'en')} in ${D.annee}, according to DREES, the health ministry’s statistics office. That is income after practice costs and social contributions but before income tax. The average is higher, ${e(D.moyen, 'en')}, pulled up by the top of the scale: one dentist in ten makes more than ${e(Q.d9, 'en')} and one in ten less than ${e(Q.d1, 'en')}, an interdecile ratio of ${r1(D.rapport_interdecile, 'en')}. DREES covers practitioners under the national agreement, aged 70 or under, already set up at the start of the year, locums excluded, with all dental specialties pooled. Other sources land in the same range: Insee reports ${e(I.mensuel_moyen, 'en')} a month on average (${I.annee}), CARCDSF, the dentists’ pension fund, an average contribution base of ${e(K.assiette_moyenne, 'en')} (${K.annee_statistiques} statistics), and UNASA practices ${e(ref.benefice, 'en')} of average profit in ${UNASA_YEAR}. The ${e(hono.tot!, 'en')} of average fees Assurance Maladie publishes for ${Y} is billing, not pay.`,
    faqs: [
      { q: 'What is the median income of a dentist in private practice in France?', a: `${e(Q.mediane, 'en')} a year in ${D.annee}, according to DREES, about ${e(Q.mediane / 12, 'en')} a month. It is earned income after professional costs and social contributions and before income tax, adding private-practice income to any salaried work. Half of dentists earn less and half more. The average, ${e(D.moyen, 'en')}, sits higher because high earners pull it up.` },
      { q: 'How much does a dentist in France make per month?', a: `Insee, which counts ${n(I.effectifs, 'en')} self-employed people in dental practice in ${I.annee}, reports an average of ${e(I.mensuel_moyen, 'en')} a month and a median of ${e(I.mensuel_mediane, 'en')}. The bottom decile is ${e(I.mensuel_d1, 'en')} a month, the top decile ${e(I.mensuel_d9, 'en')}. These are annual figures divided by twelve, net of costs and contributions, before tax, rather than an actual monthly payout.` },
      { q: 'Do male dentists in France earn more than female dentists?', a: `On average, yes: ${e(D.hommes, 'en')} for men against ${e(D.femmes, 'en')} for women in ${D.annee}, a gap of ${p(ecartHF, 'en', 0)} according to DREES. The raw figure ignores hours, years in practice and specialty. Women make up ${p(I.femmes, 'en', 0)} of self-employed dentists in Insee’s count. The published gap is therefore not a gap for the same workload.` },
      { q: 'What do dentists earn in their first ten years of practice in France?', a: `${e(D.installes_moins_10_ans, 'en')} on average in ${D.annee} for those set up less than ten years earlier, according to DREES. The figure rises to ${e(D.installes_10_29_ans, 'en')} between 10 and 29 years in practice and eases to ${e(D.installes_30_ans_plus, 'en')} after 30 years. Capital repayments on a loan to buy a practice are not costs, so they are not deducted from that figure.` },
      { q: 'What income puts a French dentist in the top 10%?', a: `Anything above ${e(Q.d9, 'en')} a year in ${D.annee}, the top decile published by DREES, or over ${e(Q.d9 / 12, 'en')} a month. The top quarter starts at ${e(Q.q3, 'en')}. DREES publishes nothing above the top decile, so no source shows where the very top percentiles begin, and the calculator on this page stops at “above the top decile”.` },
      { q: 'Has dentist income in France gone up since 2017?', a: `In current euros, yes. DREES measured average income of ${e(A.moyen, 'en')} in ${A.annee} and ${e(D.moyen, 'en')} in ${D.annee}, up ${p(gMoy, 'en')} over ${n(ans, 'en')} years, while the median moved from ${e(A.mediane, 'en')} to ${e(Q.mediane, 'en')}. None of this is adjusted for inflation. ${D.annee} is the latest year published, and it was also the year fees rebounded sharply after the 2020 dip.` },
    ],
    body: (h) => {
      const s = tableSources('en'); const q = tableQuantiles('en');
      return `
<h2>One question, several definitions</h2>
<p>Search for what a French dentist earns and you meet amounts that measure different things. DREES tracks the earned income of practitioners under the national agreement (${h.src('dreesRevenus', 'DREES')}). Insee, the national statistics institute, counts self-employed workers classed under dental practice (${h.src('inseeNonSalaries', 'Insee')}). CARCDSF, the pension fund for dentists and midwives, publishes the average base its members pay on (${h.src('carcdsfChiffres', 'CARCDSF')}). UNASA pools the accounts of practices that belong to its approved accounting bodies (${h.src('unasa', 'UNASA')}). Assurance Maladie, the national health insurer, publishes fees, which is a different thing altogether.</p>
${h.table(s.head, s.rows, 'Income and fees of dentists in French private practice, by source', ['l', 'r', 'l', 'r'])}
<p>Leave fees aside and the sources fall between ${h.eur(fMin)} and ${h.eur(fMax)} a year, with gaps explained by scope and year. DREES includes any salaried work and drops practitioners over 70. The CARCDSF base keeps only self-employed professional income. UNASA sees member practices run as sole traders and no SELARL companies. None of the figures is wrong, and none answers the question alone.</p>
<h2>A very wide spread</h2>
<p>Averages mislead more than usual here. With a ratio of ${h.num(D.rapport_interdecile, 1)} between top and bottom decile, DREES reports a spread it does not break down: hours worked, practice size and seniority all feed into it, none of them measured on its own. The table shows the five markers DREES publishes for ${D.annee}.</p>
${h.table(q.head, q.rows, `Spread of earned income among dentists in private practice, DREES, ${D.annee} income`, ['l', 'r', 'r', 'r'])}
<p>Between two markers the calculator draws a straight line, an approximation because DREES does not publish the full curve. On that basis the average CARCDSF base falls ${cent(posK, 'en')} and the average UNASA profit ${cent(posU, 'en')}, which shows again how far the mean sits above the median.</p>
<h2>Years in practice matter most</h2>
<p>DREES splits income by how long a dentist has been set up. Under ten years: ${h.eur(D.installes_moins_10_ans)} on average. Ten to 29 years: ${h.eur(D.installes_10_29_ans)}. Thirty years and more: ${h.eur(D.installes_30_ans_plus)}. The curve rises, levels off, then dips late in a career, and DREES gives no reasons for the dip.</p>
<p>The gap between men and women, ${h.eur(D.hommes)} against ${h.eur(D.femmes)}, needs care. Insee counts ${h.pct(I.femmes, 0)} women among self-employed dentists and ${h.pct(I.plus_60_ans, 0)} over 60. Published data do not cross sex with seniority or hours worked, so no like-for-like pay gap can be drawn from them.</p>
<h2>From fees to income</h2>
<p>The ${h.eur(hono.tot!)} of average ${Y} fees from Assurance Maladie cover reimbursable procedures for a full-time active practitioner. Practice accounts show what is left. Among UNASA members, profit was ${h.pct(1 - ref.taux)} of receipts in ${UNASA_YEAR}, after supplies and laboratory work (${h.pct(ref.achats)}), staff (${h.pct(ref.personnel)}), rent (${h.pct(ref.loyer)}) and personal contributions with deductible CSG (${h.pct(ref.cotisPerso)}). The line-by-line breakdown by practice size is on the ${h.a('taux-de-charges', 'cost ratio')} page.</p>
<p>Profit is still not spendable income. Income tax has yet to be paid, and capital repayments on loans for buying the practice or equipment leave the bank account without ever appearing as costs. Two dentists with the same profit can live on very different amounts. See also ${h.a('cotisations-carcdsf', 'CARCDSF pension contributions')} and, for those practising through a company, ${h.a('selarl-ou-bnc', 'how a SELARL is taxed')}.</p>
<h2>What no source publishes</h2>
<ul>
<li>No official income by specialty: DREES does not separate orthodontists, oral surgeons or oral medicine specialists.</li>
<li>No income by département: only fees are published at that level, in ${h.a('classement-departements', 'the département ranking')}.</li>
<li>Nothing on income from implants or periodontal treatment, which sit outside the national fee schedule and never reach Assurance Maladie data.</li>
<li>Nothing more recent than ${D.annee} from DREES: later income years had not been released at the last update.</li>
</ul>`;
    },
  },
});
