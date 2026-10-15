import { defineGuide } from '../../lib/guide-types';
import { impotSocietes, distribution } from '../../lib/engine/selarl';
import { reference, UNASA_YEAR } from '../../lib/engine/references';
import { P } from '../../lib/engine/params';
import { formatMoney, formatNumber, formatPercent } from '../../lib/format';

type L = 'fr' | 'en';
const F = P.fiscal_2026;
const S = F.is_seuil_reduit;
const ref = reference('omni');
const pfu = F.pfu_ir + F.prelevements_sociaux;
/** Pression cumulée IS + PFU sur un euro de bénéfice distribué, au taux réduit puis au taux normal. */
const cumulReduit = 1 - (1 - F.is_taux_reduit) * (1 - pfu);
const cumulNormal = 1 - (1 - F.is_taux_normal) * (1 - pfu);
/** Scénarios : multiples du seuil du taux réduit (aucun montant tapé à la main). */
const scen = [0.5, 1, 2, 4].map((k) => S * k);
const isMoyen = ref.benefice ? impotSocietes(ref.benefice) : 0;
const dMoyen = distribution(ref.benefice, 0);
const capMoyen = dMoyen.distribuable / F.seuil_dividendes_capital;
const cotisBnc = ref.cotisPerso * ref.recettes;
const e = (x: number, l: L) => formatMoney(x, 0, l);
const n = (x: number, l: L) => formatNumber(x, 0, l);
const p = (x: number, l: L, d = 1) => formatPercent(x, d, l);
const pr = (x: number, l: L) => formatPercent(x, 0, l);

const tableIs = (l: L) => {
  const head = l === 'fr'
    ? ['Bénéfice laissé à la société', 'Impôt sur les sociétés', 'Taux moyen d’IS', 'Dividende distribuable', `Impôt sur le revenu (${p(F.pfu_ir, l)})`, 'Capital et comptes courants pour rester sous 10 %']
    : ['Profit left in the company', 'Corporation tax', 'Average tax rate', 'Distributable dividend', `Income tax (${p(F.pfu_ir, l)})`, 'Capital and shareholder loans to stay under 10%'];
  const rows = scen.map((b) => { const d = distribution(b, 0); return [e(b, l), e(d.is, l), p(d.is / b, l), e(d.distribuable, l), e(d.ir, l), e(d.distribuable / F.seuil_dividendes_capital, l)]; });
  return { head, rows };
};

export default defineGuide({
  id: 'selarl-ou-bnc',
  group: 'gestion',
  order: 50,
  mini: 'selarlIs',
  related: ['revenu-dentiste', 'cotisations-carcdsf', 'taux-de-charges', 'omnipraticien'],
  sources: ['cgi219', 'cssL136', 'spPs', 'impotsMobiliers', 'unasa'],
  fr: {
    slug: 'selarl-ou-bnc-dentiste',
    nav: 'SELARL ou BNC',
    card: 'Impôt sur les sociétés, dividendes et seuil des 10 % : ce que change la SELARL pour un dentiste.',
    title: 'SELARL ou BNC pour un dentiste en 2026 : IS et dividendes',
    description: `SELARL dentaire 2026 : IS à ${pr(F.is_taux_reduit, 'fr')} jusqu’à ${e(S, 'fr')}, puis ${pr(F.is_taux_normal, 'fr')}, dividendes au PFU de ${p(pfu, 'fr')} sous ${pr(F.seuil_dividendes_capital, 'fr')} du capital et des comptes courants. Calcul et limites.`,
    h1: 'SELARL ou exercice en BNC : ce que la société change pour un chirurgien-dentiste',
    intro: 'Le passage en société vu par l’impôt sur les sociétés et les dividendes, règles 2026 à l’appui.',
    resume: `En 2026, une SELARL de chirurgien-dentiste paie l’impôt sur les sociétés à ${pr(F.is_taux_reduit, 'fr')} sur les ${e(S, 'fr')} premiers euros de bénéfice, si elle remplit les conditions de l’article 219 du Code général des impôts, puis à ${pr(F.is_taux_normal, 'fr')} au-delà. Ce qui reste peut être versé en dividendes : impôt sur le revenu forfaitaire de ${p(F.pfu_ir, 'fr')} et prélèvements sociaux de ${p(F.prelevements_sociaux, 'fr')}, mais seulement sur la part qui ne dépasse pas ${pr(F.seuil_dividendes_capital, 'fr')} du capital et des comptes courants. Au-delà, le dividende d’un associé qui exerce dans la société entre dans l’assiette de ses cotisations sociales (article L136-3 du Code de la sécurité sociale). En BNC, le bénéfice moyen des cabinets suivis par l’UNASA atteint ${e(ref.benefice, 'fr')} en ${UNASA_YEAR}, imposé en totalité au barème et aux cotisations. Laisser ce montant en société coûterait ${e(isMoyen, 'fr')} d’IS. Le choix dépend de la rémunération, du capital et de l’impôt personnel : ce site calcule l’IS et les dividendes, pas le bilan complet, qui relève d’un expert-comptable.`,
    faqs: [
      { q: 'Quel taux d’impôt sur les sociétés paie une SELARL de dentiste en 2026 ?', a: `${pr(F.is_taux_reduit, 'fr')} jusqu’à ${e(S, 'fr')} de bénéfice imposable, puis ${pr(F.is_taux_normal, 'fr')} sur le surplus. Le taux réduit suppose des conditions de chiffre d’affaires et un capital entièrement libéré, détenu en majorité par des personnes physiques (article 219 du CGI). Sur ${e(S * 2, 'fr')} de bénéfice, l’impôt atteint ${e(impotSocietes(S * 2), 'fr')}, soit un taux moyen de ${p(impotSocietes(S * 2) / (S * 2), 'fr')}.` },
      { q: 'Les dividendes d’une SELARL dentaire supportent-ils des cotisations sociales ?', a: `Une partie, oui. La fraction des dividendes qui dépasse ${pr(F.seuil_dividendes_capital, 'fr')} du capital social, des primes d’émission et des sommes en compte courant entre dans l’assiette des cotisations de l’associé qui travaille dans la société (article L136-3 du Code de la sécurité sociale). En dessous, le dividende ne supporte que le prélèvement forfaitaire : ${p(F.pfu_ir, 'fr')} d’impôt et ${p(F.prelevements_sociaux, 'fr')} de prélèvements sociaux en 2026.` },
      { q: 'Quel capital faut-il pour que les dividendes échappent aux cotisations ?', a: `Dix fois le dividende versé, puisque le seuil est de ${pr(F.seuil_dividendes_capital, 'fr')}. Pour distribuer ${e(dMoyen.distribuable, 'fr')}, ce qui reste du bénéfice BNC moyen UNASA ${UNASA_YEAR} après IS, il faudrait ${e(capMoyen, 'fr')} de capital et de comptes courants. Une SELARL créée avec un petit capital voit donc presque tout son dividende soumis aux cotisations des indépendants, que le site ne calcule pas.` },
      { q: 'Combien paie-t-on au total sur un euro distribué par une SELARL ?', a: `Sous le seuil des ${pr(F.seuil_dividendes_capital, 'fr')}, l’euro de bénéfice paie d’abord l’IS, puis le prélèvement forfaitaire de ${p(pfu, 'fr')} sur ce qui reste. Le cumul ressort à ${p(cumulReduit, 'fr')} dans la tranche à ${pr(F.is_taux_reduit, 'fr')} et à ${p(cumulNormal, 'fr')} dans la tranche à ${pr(F.is_taux_normal, 'fr')}. Ces taux ne valent que pour la part du dividende qui échappe aux cotisations sociales.` },
      { q: 'Quel bénéfice dégage un cabinet dentaire resté en BNC ?', a: `Dans les comptes ${UNASA_YEAR} des ${n(ref.echantillon, 'fr')} cabinets de chirurgiens-dentistes adhérents de l’UNASA, tous en BNC, le bénéfice moyen vaut ${e(ref.benefice, 'fr')}, soit ${p(1 - ref.taux, 'fr')} de recettes nettes moyennes de ${e(ref.recettes, 'fr')}. Ce bénéfice est déjà diminué des cotisations sociales personnelles et de la CSG déductible. Il supporte ensuite l’impôt sur le revenu au barème, selon la situation du foyer.` },
      { q: 'Ce site peut-il dire si la SELARL est plus intéressante pour mon cabinet ?', a: `Non. Il calcule l’impôt sur les sociétés et l’imposition des dividendes avec les règles 2026, rien de plus. Le bilan complet dépend de la rémunération du gérant, du barème de l’impôt sur le revenu du foyer, des cotisations sociales sur chaque euro, du capital, des emprunts et des frais de la société. Ce chiffrage revient à un expert-comptable, et les statuts à un avocat ou à un notaire.` },
    ],
    body: (h) => {
      const t = tableIs('fr');
      return `
<h2>Deux régimes, deux façons d’imposer le même bénéfice</h2>
<p>En exercice individuel, le chirurgien-dentiste déclare un bénéfice non commercial (BNC). Tout ce bénéfice est à lui l’année même : il supporte les cotisations sociales personnelles, puis l’impôt sur le revenu au barème progressif du foyer. Qu’il laisse ou non de la trésorerie sur le compte du cabinet ne change rien à l’assiette.</p>
<p>En SELARL soumise à l’impôt sur les sociétés, la société devient le contribuable. Elle paie au praticien une rémunération de gérant, déductible de son résultat, puis l’IS sur ce qui reste. Le bénéfice après impôt peut rester dans la société ou être distribué. C’est cette séparation, entre ce que l’associé prélève et ce que la société garde, qui fait l’intérêt ou l’absence d’intérêt du montage.</p>
<p>Les comptes ${UNASA_YEAR} des cabinets adhérents de l’UNASA donnent l’ordre de grandeur côté BNC : ${e(ref.recettes, 'fr')} de recettes nettes, ${e(ref.benefice, 'fr')} de bénéfice, et des cotisations sociales personnelles avec la CSG déductible qui pèsent ${p(ref.cotisPerso, 'fr')} des recettes, soit environ ${e(cotisBnc, 'fr')}. Ces statistiques ne portent que sur des entreprises individuelles : aucune source publique ne publie les comptes moyens des SELARL dentaires.</p>
<h2>L’impôt sur les sociétés en 2026</h2>
<p>Le barème tient en deux taux. Les ${e(S, 'fr')} premiers euros de bénéfice imposable sont taxés à ${h.pct(F.is_taux_reduit, 0)}, le reste à ${h.pct(F.is_taux_normal, 0)} (${h.src('cgi219')}). Le taux réduit n’est pas automatique : il exige un chiffre d’affaires sous un plafond, un capital entièrement libéré et une détention majoritaire par des personnes physiques. Une SELARL de dentiste ordinaire les remplit en général ; une société détenue par une holding doit vérifier.</p>
<p>Le tableau suit quatre niveaux de bénéfice laissé dans la société, exprimés en multiples du seuil du taux réduit. Il suppose un capital nul pour isoler l’effet du seuil des ${h.pct(F.seuil_dividendes_capital, 0)} : la dernière colonne donne le capital et les comptes courants qu’il faudrait pour que tout le dividende reste au seul prélèvement forfaitaire.</p>
${h.table(t.head, t.rows, 'Impôt sur les sociétés 2026 et dividende distribuable selon le bénéfice laissé à la SELARL', ['r', 'r', 'r', 'r', 'r', 'r'])}
<p>Le taux moyen grimpe vite au-dessus du seuil. À ${h.eur(scen[3])} de bénéfice, il dépasse déjà ${h.pct(impotSocietes(scen[3]) / scen[3], 0)}. Le taux réduit sert surtout une SELARL qui garde un bénéfice modeste, pour financer un fauteuil, une radio panoramique ou le remboursement d’un emprunt, en laissant le reste en rémunération.</p>
<h2>Les dividendes et la règle des 10 %</h2>
<p>Le dividende d’un associé personne physique supporte par défaut le prélèvement forfaitaire unique : ${h.pct(F.pfu_ir)} d’impôt sur le revenu (${h.src('impotsMobiliers', 'impots.gouv.fr')}) et ${h.pct(F.prelevements_sociaux)} de prélèvements sociaux (${h.src('spPs', 'service-public.gouv.fr')}), soit ${h.pct(pfu)}. Ajouté à l’IS, l’euro distribué perd ${h.pct(cumulReduit)} dans la tranche réduite et ${h.pct(cumulNormal)} dans la tranche normale.</p>
<p>Cette mécanique ne vaut que sous un plafond. Pour l’associé qui exerce son activité dans la société, la part des dividendes qui dépasse ${h.pct(F.seuil_dividendes_capital, 0)} du capital, des primes d’émission et des comptes courants est traitée comme un revenu d’activité et entre dans l’assiette des cotisations des travailleurs indépendants (${h.src('cssL136')}). Sur le bénéfice moyen UNASA, distribuer tout le résultat après IS sans cotisations demanderait ${h.eur(capMoyen)} de capital et de comptes courants. Peu de cabinets apportent une telle somme : c’est pour cela que la SELARL n’efface pas les cotisations comme on le lit parfois.</p>
<h2>Ce que la comparaison complète demande</h2>
<p>Comparer honnêtement les deux régimes suppose de connaître des éléments que ce site ne modélise pas :</p>
<ul>
<li>la rémunération du gérant, ses cotisations Urssaf et ${h.a('cotisations-carcdsf', 'ses cotisations CARCDSF')}, qui suivent le revenu d’activité ;</li>
<li>le barème de l’impôt sur le revenu du foyer, ses parts et ses autres revenus ;</li>
<li>les cotisations sur la part des dividendes au-delà de ${h.pct(F.seuil_dividendes_capital, 0)} ;</li>
<li>le coût propre de la société : comptabilité, juridique, frais bancaires, et le sort de la patientèle et du matériel apportés ;</li>
<li>les projets : rachat de parts, association, vente du cabinet, départ en retraite.</li>
</ul>
<p>Le simulateur placé plus haut calcule l’IS et les dividendes nets sur deux saisies, le bénéfice après rémunération et le capital. Il donne un morceau du calcul. Pour situer d’abord votre bénéfice actuel, ${h.a('taux-de-charges', 'le taux de charges des cabinets')} et ${h.a('revenu-dentiste', 'les revenus publiés de la profession')} servent de repère.</p>
<h2>Ce que le site ne dit pas</h2>
<p>Dentimètre n’est ni un cabinet d’expertise comptable ni un cabinet d’avocats. Les montants ci-dessus appliquent des règles 2026 à des bénéfices types, sans tenir compte d’une situation particulière. Le choix d’une forme sociale engage les statuts, la fiscalité du foyer et la transmission du cabinet : il se prépare avec un expert-comptable et, pour la rédaction des actes, un avocat ou un notaire.</p>`;
    },
  },
  en: {
    slug: 'selarl-or-sole-practice',
    nav: 'SELARL or sole practice',
    card: 'Corporation tax, dividends and the 10% threshold: what a SELARL changes for a dentist in France.',
    title: 'Dentist SELARL vs sole practice in France: 2026 tax rules',
    description: `French dental SELARL in 2026: ${pr(F.is_taux_reduit, 'en')} corporation tax up to ${e(S, 'en')}, then ${pr(F.is_taux_normal, 'en')}; dividends taxed at ${p(pfu, 'en')} below the ${pr(F.seuil_dividendes_capital, 'en')} capital rule, worked through with tables.`,
    h1: 'SELARL or sole practice: what incorporating changes for a dentist in France',
    intro: 'Corporation tax and dividends for a dental company, worked through with the 2026 rules.',
    resume: `A SELARL (société d’exercice libéral à responsabilité limitée, the limited company French dentists use to practise) pays corporation tax in 2026 at ${pr(F.is_taux_reduit, 'en')} on the first ${e(S, 'en')} of taxable profit, provided it meets the conditions of article 219 of the General Tax Code, and at ${pr(F.is_taux_normal, 'en')} above that. Profit after tax can be paid out as dividends, taxed at a flat ${p(F.pfu_ir, 'en')} income tax plus ${p(F.prelevements_sociaux, 'en')} social levies, but only up to ${pr(F.seuil_dividendes_capital, 'en')} of capital and shareholder loans. Beyond that line, a working partner’s dividends count toward self-employed contributions (Social Security Code, article L136-3). In sole practice, taxed as BNC (bénéfices non commerciaux, the profit of a self-employed professional), UNASA member practices showed ${e(ref.benefice, 'en')} of average profit in ${UNASA_YEAR}, all of it subject to progressive income tax. Keeping that sum inside a SELARL would cost ${e(isMoyen, 'en')} in corporation tax. This page works out the company side only; the full comparison belongs with a chartered accountant.`,
    faqs: [
      { q: 'What corporation tax rate does a French dental SELARL pay in 2026?', a: `${pr(F.is_taux_reduit, 'en')} on taxable profit up to ${e(S, 'en')}, then ${pr(F.is_taux_normal, 'en')} on the rest. The reduced band requires turnover under a ceiling and fully paid-up capital held mainly by individuals, under article 219 of the General Tax Code. On ${e(S * 2, 'en')} of profit the bill is ${e(impotSocietes(S * 2), 'en')}, an average rate of ${p(impotSocietes(S * 2) / (S * 2), 'en')}.` },
      { q: 'Do I pay social contributions on dividends from my dental company?', a: `On part of them. For a partner who works in the company, dividends above ${pr(F.seuil_dividendes_capital, 'en')} of share capital, share premium and shareholder loan accounts are treated as earned income and bear self-employed contributions (Social Security Code, article L136-3). Below that line, only the flat levy applies in 2026: ${p(F.pfu_ir, 'en')} income tax and ${p(F.prelevements_sociaux, 'en')} social levies.` },
      { q: 'How much capital keeps SELARL dividends clear of contributions?', a: `Ten times the dividend, since the line sits at ${pr(F.seuil_dividendes_capital, 'en')}. Paying out ${e(dMoyen.distribuable, 'en')}, which is what the average ${UNASA_YEAR} UNASA profit leaves after corporation tax, would take ${e(capMoyen, 'en')} of capital and shareholder loans. Most dental companies are formed with far less, so nearly all of their dividends fall into the contribution base, a figure this site does not compute.` },
      { q: 'What is the combined tax on profit paid out by a SELARL?', a: `Below the ${pr(F.seuil_dividendes_capital, 'en')} line, each euro first bears corporation tax, then the ${p(pfu, 'en')} flat levy on what remains. Together that comes to ${p(cumulReduit, 'en')} in the ${pr(F.is_taux_reduit, 'en')} band and ${p(cumulNormal, 'en')} in the ${pr(F.is_taux_normal, 'en')} band. Those rates hold only for the share of the dividend that escapes social contributions, so they are a floor, not a total.` },
      { q: 'How much profit does a French dental practice make as a sole trader?', a: `UNASA, a federation of approved accounting bodies, reports ${UNASA_YEAR} accounts for ${n(ref.echantillon, 'en')} member dental practices, all taxed as BNC. Average profit was ${e(ref.benefice, 'en')}, or ${p(1 - ref.taux, 'en')} of average net receipts of ${e(ref.recettes, 'en')}. That profit is already net of personal social contributions and deductible CSG, and income tax then applies at household rates.` },
      { q: 'Can this site tell me whether incorporating suits my practice?', a: `No. It applies the 2026 corporation tax and dividend rules and stops there. A real answer depends on the manager’s pay, household income tax, contributions on each euro, capital, borrowing, company running costs and what happens when the practice is sold. That work belongs to a chartered accountant (expert-comptable), and the articles of association to a lawyer or notary.` },
    ],
    body: (h) => {
      const t = tableIs('en');
      return `
<h2>Same profit, two tax logics</h2>
<p>As a sole practitioner, a French dentist reports BNC profit. All of it is treated as theirs in the year it is made: personal social contributions come off first, then household income tax at progressive rates. Leaving cash in the practice account does not shrink the taxable amount.</p>
<p>Inside a SELARL taxed at corporate rates, the company is the taxpayer. It pays the dentist a manager’s salary, which it deducts, and corporation tax on what is left. Profit after tax can stay in the company or go out as dividends. Whether incorporating helps comes down to that split between what the partner draws and what the company keeps.</p>
<p>For scale on the sole-practice side, UNASA’s ${UNASA_YEAR} figures show ${e(ref.recettes, 'en')} of net receipts, ${e(ref.benefice, 'en')} of profit, and personal contributions plus deductible CSG (a social levy on earned income) equal to ${p(ref.cotisPerso, 'en')} of receipts, roughly ${e(cotisBnc, 'en')}. These accounts cover sole traders only. No public source reports average accounts for dental SELARLs.</p>
<h2>Corporation tax in 2026</h2>
<p>Two rates apply: ${h.pct(F.is_taux_reduit, 0)} on the first ${e(S, 'en')} of taxable profit and ${h.pct(F.is_taux_normal, 0)} beyond (${h.src('cgi219')}). The lower band comes with conditions on turnover, paid-up capital and ownership by individuals. A dental SELARL owned directly by its practitioners usually qualifies; one held through a holding company should check.</p>
<p>The table runs four levels of profit retained in the company, set as multiples of the reduced-rate band. Capital is taken as zero so that the effect of the ${h.pct(F.seuil_dividendes_capital, 0)} rule stands out: the last column gives the capital and shareholder loans needed for the whole dividend to stay under the flat levy alone.</p>
${h.table(t.head, t.rows, '2026 corporation tax and distributable dividend by profit left in the SELARL', ['r', 'r', 'r', 'r', 'r', 'r'])}
<p>The average rate climbs quickly past the band. At ${h.eur(scen[3])} of profit it is above ${h.pct(impotSocietes(scen[3]) / scen[3], 0)}. The reduced rate mostly helps a company that keeps a modest profit back, for a new chair, a panoramic X-ray unit or loan repayments, while the rest goes out as pay.</p>
<h2>Dividends and the 10% rule</h2>
<p>By default, dividends paid to an individual bear the flat-rate levy known as PFU: ${h.pct(F.pfu_ir)} income tax (${h.src('impotsMobiliers', 'impots.gouv.fr')}) and ${h.pct(F.prelevements_sociaux)} social levies (${h.src('spPs', 'service-public.gouv.fr')}), ${h.pct(pfu)} in all. Stacked on corporation tax, a distributed euro loses ${h.pct(cumulReduit)} in the lower band and ${h.pct(cumulNormal)} in the upper one.</p>
<p>That only holds under a cap. For a partner who practises through the company, the slice of dividends above ${h.pct(F.seuil_dividendes_capital, 0)} of capital, share premium and loan accounts is reclassified as earned income and added to the self-employed contribution base (${h.src('cssL136')}). On the UNASA average, paying out the whole after-tax profit free of contributions would need ${h.eur(capMoyen)} of capital and loans. Few practices put that much in, which is why a SELARL does not make contributions disappear, whatever forums say.</p>
<h2>What a full comparison needs</h2>
<p>A fair comparison of the two set-ups rests on inputs this site does not model:</p>
<ul>
<li>the manager’s pay, with its Urssaf contributions and ${h.a('cotisations-carcdsf', 'CARCDSF pension contributions')}, both driven by earned income;</li>
<li>the household’s income tax position, family allowance shares and other income;</li>
<li>contributions due on dividends above the ${h.pct(F.seuil_dividendes_capital, 0)} line;</li>
<li>the company’s own costs: bookkeeping, legal work, bank fees, and how the patient list and equipment are brought in;</li>
<li>plans for buying in a partner, selling the practice or retiring.</li>
</ul>
<p>The calculator above takes two inputs, profit after your pay and capital, and returns corporation tax and net dividends. It is one piece of the sum. To place your current profit first, see ${h.a('taux-de-charges', 'practice cost ratios')} and ${h.a('revenu-dentiste', 'published income figures for French dentists')}.</p>
<h2>Where this page stops</h2>
<p>Dentimètre is neither an accounting firm nor a law firm. The amounts above apply 2026 rules to sample profits and ignore personal circumstances. Choosing a legal structure affects the articles of association, household tax and the eventual sale of the practice, and is worked out with an expert-comptable, with a lawyer or notary drafting the documents.</p>`;
    },
  },
});
