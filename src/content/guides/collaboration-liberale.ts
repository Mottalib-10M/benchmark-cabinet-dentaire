import { defineGuide } from '../../lib/guide-types';
import { reference, UNASA_YEAR } from '../../lib/engine/references';
import raw from '../../data/unasa.json';
import { FR, DATA_YEAR } from '../../lib/engine/data';
import { redevance, tauxPointMort } from '../../lib/engine/organisation-equipe';
import { formatMoney, formatNumber, formatPercent } from '../../lib/format';

/* Collaboration libérale entre chirurgiens-dentistes : cadre légal, redevance, lecture des comptes UNASA. */
type L = 'fr' | 'en';
type Tab = { echantillon: number; lignes: Record<string, Array<number | string | null>> };
const U = raw as unknown as Record<string, Tab>;
const Y = UNASA_YEAR;
const A = U[`851EAA_${Y}`];
const val = (row: string, i = 0) => Number(A.lignes[row][i]);
const retro = [0, 1, 2, 3, 4].map((i) => val('Honoraires rétrocédés', i));
const encaisse = [0, 1, 2, 3, 4].map((i) => val('Recettes encaissées', i));
const partRetro = retro.map((r, i) => (encaisse[i] > 0 ? r / encaisse[i] : 0));
const G = reference('omni');
const Q = [1, 2, 3, 4].map((q) => reference('omni', val('Montant net des recettes', q)));
const omni = FR.p.omni!.tot!;
// Exemple de lecture : honoraires du collaborateur = moyenne Ameli ; charges du fauteuil = charges hors cotisations
// personnelles du cabinet UNASA moyen, rapportées à deux fauteuils (hypothèse d'exemple, signalée).
const chargesCabinet = G.recettes * G.tauxHorsCotis;
const chargesFauteuil = chargesCabinet / 2;
const pm = tauxPointMort(omni, chargesFauteuil) ?? 0;
const TAUX = [0.2, 0.3, 0.4];
const lignes = TAUX.map((t) => ({ t, r: redevance({ honoraires: omni, taux: t, chargesFauteuil }) }));

const e = (x: number, l: L, d = 0) => formatMoney(x, d, l);
const p = (x: number, l: L, d = 1) => formatPercent(x, d, l);
const n = (x: number, l: L, d = 0) => formatNumber(x, d, l);

const tableRetro = (l: L, h: { table: (a: string[], b: Array<Array<string | number>>, c?: string, d?: Array<'l' | 'r'>) => string }) => {
  const th = l === 'fr' ? ['Quart de recettes', 'Recettes encaissées', 'Honoraires rétrocédés', 'Part des recettes'] : ['Receipts quarter', 'Cash receipts', 'Fees handed on', 'Share of receipts'];
  const lab = (i: number) => (l === 'fr' ? `${i === 1 ? '1er' : `${i}e`} quart` : `Quarter ${i}`);
  const rows = [1, 2, 3, 4].map((i) => [lab(i), e(encaisse[i], l), e(retro[i], l), p(partRetro[i], l)]);
  rows.push([l === 'fr' ? 'Ensemble' : 'All practices', e(encaisse[0], l), e(retro[0], l), p(partRetro[0], l)]);
  const cap = l === 'fr'
    ? `Honoraires reversés à d’autres praticiens (remplaçants, titulaires d’un cabinet où l’on est collaborateur), comptes UNASA ${Y} de ${n(A.echantillon, l)} cabinets.`
    : `Fees handed on to other dentists (locums, owners of a practice where one works as an associate), UNASA ${Y} accounts of ${n(A.echantillon, l)} practices.`;
  return h.table(th, rows, cap, ['l', 'r', 'r', 'r']);
};
const tableTaux = (l: L, h: { table: (a: string[], b: Array<Array<string | number>>, c?: string, d?: Array<'l' | 'r'>) => string }) => {
  const th = l === 'fr' ? ['Taux de redevance (exemple)', 'Redevance au titulaire', 'Reste au collaborateur', 'Charges du fauteuil couvertes'] : ['Fee rate (example)', 'Fee to the owner', 'Left to the associate', 'Chair costs covered'];
  const rows = lignes.map(({ t, r }) => [p(t, l, 0), e(r.redevance, l), e(r.reste, l), r.couverture != null ? p(r.couverture, l, 0) : '–']);
  const cap = l === 'fr'
    ? `Collaborateur qui encaisse ${e(omni, l)} (moyenne Ameli ${DATA_YEAR} d’un omnipraticien) ; charges du fauteuil : la moitié des charges hors cotisations d’un cabinet UNASA moyen, ${e(chargesFauteuil, l)}. Taux choisis pour l’exemple, aucun n’est une norme.`
    : `An associate collecting ${e(omni, l)} (Ameli ${DATA_YEAR} average for a general dentist); chair costs: half the running costs of an average UNASA practice, ${e(chargesFauteuil, l)}. Rates picked for illustration; none is a norm.`;
  return h.table(th, rows, cap, ['l', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'collaboration-liberale',
  group: 'organisation',
  order: 70,
  mini: 'redevance',
  related: ['ca-par-fauteuil', 'taux-de-charges', 'selarl-ou-bnc', 'organisation-cabinet', 'revenu-dentiste'],
  sources: ['loi2005_882', 'deontologieDentiste', 'oncdCollaboration', 'oncdNoteContrats', 'unasa', 'ameliHonoraires'],
  fr: {
    slug: 'collaboration-liberale-dentiste',
    nav: 'Collaboration libérale',
    card: 'Le contrat de collaborateur libéral, la redevance au titulaire et ce que le fauteuil doit couvrir.',
    title: 'Collaboration libérale dentiste 2026 : contrat et redevance',
    description: 'Collaboration libérale entre dentistes en 2026 : contrat écrit obligatoire, règles de l’Ordre, redevance sans taux officiel et calcul des charges du fauteuil.',
    h1: 'La collaboration libérale entre chirurgiens-dentistes',
    intro: 'Ce que la loi impose au contrat, ce que dit l’Ordre, et comment juger un taux de redevance qu’aucun texte ne fixe.',
    resume: `Un chirurgien-dentiste peut faire travailler un confrère dans son cabinet comme collaborateur libéral : un professionnel non salarié qui soigne sa propre patientèle avec le fauteuil, le matériel et souvent l'assistante du titulaire, et lui reverse une redevance. La loi du 2 août 2005 impose un contrat écrit, à peine de nullité, qui précise la durée, la rémunération, les conditions de constitution de la clientèle personnelle et la rupture. Le code de déontologie limite le cabinet individuel à un seul collaborateur sans autorisation de l'Ordre et oblige à communiquer le contrat au conseil départemental. Aucun texte et aucune position de l'Ordre ne fixe le taux de la redevance : il se négocie. Pour juger un taux, il faut le rapporter aux charges du fauteuil mis à disposition. Dans les comptes UNASA ${Y}, les honoraires rétrocédés pèsent ${p(partRetro[0], 'fr')} des recettes encaissées en moyenne.`,
    faqs: [
      { q: 'Quel taux de redevance pour un collaborateur dentiste ?', a: `Aucun texte ne le fixe, et l'Ordre ne publie pas de barème : le pourcentage se négocie et s'écrit dans le contrat. Pour savoir si un taux tient, comparez la redevance qu'il produit aux charges du fauteuil mis à disposition, loyer, personnel, matériel et consommables compris. Le mini-simulateur calcule le taux qui couvre juste ces charges à partir de vos montants.` },
      { q: 'Le contrat de collaboration libérale doit-il être écrit ?', a: `Oui, à peine de nullité. L'article 18 de la loi du 2 août 2005 exige un écrit qui précise la durée, les modalités de la rémunération, les conditions dans lesquelles le collaborateur peut satisfaire sa clientèle personnelle et les conditions de rupture, avec le préavis. Le code de déontologie impose en plus de le communiquer au conseil départemental de l'Ordre.` },
      { q: 'Combien de collaborateurs un dentiste peut-il avoir dans son cabinet ?', a: `En exercice individuel, un seul : un collaborateur ou un étudiant adjoint, selon l'article R4127-276. Au-delà, il faut l'autorisation du conseil départemental, ou du conseil national au-delà de deux, accordée pour trois ans quand les besoins de santé publique le justifient, ou pour trois mois en cas d'afflux exceptionnel ou pour la santé du titulaire. Le silence gardé deux mois vaut accord.` },
      { q: 'Quand la redevance du collaborateur est-elle due ?', a: `Selon la note de l'Ordre sur les contrats de collaboration, la redevance est un pourcentage des honoraires encaissés par le collaborateur, due dès qu'il les perçoit, et non quand il facture. Elle est en principe soumise à la TVA, avec une franchise possible selon le montant : faites vérifier les seuils de l'année par votre expert-comptable, ceux de la note de 2020 ne valent plus.` },
      { q: 'Un ancien collaborateur peut-il s’installer à côté du cabinet ?', a: `Le code de déontologie encadre ce cas. Après plus de trois mois consécutifs comme remplaçant ou adjoint, un praticien ne peut pas, pendant deux ans, s'installer dans un poste où il entrerait en concurrence directe avec le titulaire, sauf accord de celui-ci. Le contrat type de l'Ordre reprend des clauses de ce genre ; relisez-les avant de signer.` },
      { q: 'Collaborateur salarié ou libéral : quelle différence pour le cabinet ?', a: `Le collaborateur salarié reçoit un salaire, soumis aux cotisations patronales, et soigne les patients du cabinet. Le collaborateur libéral encaisse ses honoraires, paie ses propres cotisations, peut se constituer une clientèle personnelle et reverse une redevance. Le code de déontologie autorise les deux formes ; la seconde fait porter le risque d'activité au collaborateur.` },
    ],
    body: (h) => `
<h2>Le cadre : une loi et quatre articles de déontologie</h2>
<p>La collaboration libérale a un socle légal commun à toutes les professions libérales réglementées : l'${h.src('loi2005_882', 'article 18 de la loi du 2 août 2005')}. Il définit le collaborateur libéral comme le membre non salarié d'une de ces professions qui exerce auprès d'un confrère, « peut compléter sa formation et peut se constituer une clientèle personnelle ». Le contrat « doit, à peine de nullité, être établi par écrit et préciser » :</p>
<ul>
<li>sa durée, déterminée ou non ;</li>
<li>les modalités de la rémunération, c'est-à-dire en pratique la redevance ;</li>
<li>les conditions dans lesquelles le collaborateur peut satisfaire les besoins de sa clientèle personnelle ;</li>
<li>les conditions et le préavis de rupture ;</li>
<li>la suspension en cas de maternité, de paternité ou d'adoption.</li>
</ul>
<p>Le ${h.src('deontologieDentiste', 'code de déontologie des chirurgiens-dentistes')} ajoute les règles propres à la profession. L'article R4127-276 autorise le praticien qui exerce seul à s'attacher le concours d'un seul étudiant ou d'un seul confrère collaborateur, et précise que la collaboration « peut être salariée ou libérale ». L'article R4127-276-1 ouvre la porte à d'autres collaborateurs sur autorisation : du conseil départemental, ou du conseil national au-delà de deux, pour trois ans quand les besoins de santé publique le justifient, pour trois mois en cas d'afflux exceptionnel de patients ou pour l'état de santé du titulaire ; le silence gardé deux mois vaut accord. L'article R4127-279 interdit tout exercice conjoint sans contrat écrit soumis au conseil départemental, qui rend son avis dans le mois. L'article R4127-277, enfin, interdit pendant deux ans l'installation en concurrence directe à un praticien resté plus de trois mois consécutifs remplaçant ou adjoint, sauf accord du titulaire.</p>
<h2>Le contrat type de l'Ordre</h2>
<p>L'Ordre national des chirurgiens-dentistes publie un ${h.src('oncdCollaboration', 'contrat type de collaborateur libéral')}, dans sa version du 1er septembre 2023, et une ${h.src('oncdNoteContrats', 'note d’information sur les contrats de collaboration')}. La note pose les deux règles de la redevance. Le collaborateur « rétrocède au titulaire du cabinet dentaire un pourcentage sur les honoraires encaissés » ; elle est due dès que le collaborateur perçoit ses honoraires. Elle est en principe soumise à la TVA, avec une franchise possible : les seuils indiqués dans la note datent de 2020 et doivent être vérifiés pour l'année en cours.</p>
<p>Ce que ni la loi, ni le code, ni l'Ordre ne disent : le taux. Les mots « redevance » et « rétrocession » n'apparaissent même pas dans les articles de déontologie, qui parlent de collaborateur. Les pourcentages qui circulent entre confrères relèvent de la négociation, du lieu, de l'équipement et de l'assistance fournis. Dentimètre n'en publie donc aucun comme repère.</p>
<h2>Juger un taux : partir des charges du fauteuil</h2>
<p>Pour le titulaire, la redevance doit au minimum payer ce que coûte le fauteuil prêté : la part du loyer, l'assistante qui travaille avec le collaborateur, le matériel, les consommables, la stérilisation, le logiciel. Pour le collaborateur, ce qui reste après la redevance doit couvrir ses cotisations et son revenu. Le taux juste se trouve entre les deux, et il se calcule. Le taux de point mort est simple : charges annuelles du fauteuil ÷ honoraires encaissés par le collaborateur.</p>
<p>Un exemple chiffré, pour la méthode seulement. Un collaborateur qui encaisse ${h.eur(omni)}, la moyenne ${DATA_YEAR} d'un omnipraticien selon l'${h.src('ameliHonoraires', 'Assurance Maladie')}, travaille dans un cabinet dont les charges hors cotisations personnelles sont celles d'un cabinet UNASA moyen, ${h.eur(chargesCabinet)} par an. Si l'on attribue la moitié de ces charges au fauteuil qu'il occupe, soit ${h.eur(chargesFauteuil)}, le taux qui les couvre tout juste est de ${h.pct(pm)}. Cette répartition par moitié est une convention d'exemple : remplacez-la par vos chiffres.</p>
${tableTaux('fr', h)}
<p>Le mini-simulateur en haut de page refait ce calcul avec vos montants. Il ne propose pas de taux : celui qu'il affiche au départ est un exemple de saisie, à remplacer par celui de votre contrat ou de votre projet.</p>
<h2>Ce que montrent les comptes des cabinets</h2>
<p>Les comptes de l'${h.src('unasa', 'UNASA')} isolent une ligne « honoraires rétrocédés » : ce que le praticien reverse à d'autres, remplaçants ou titulaire du cabinet où il est lui-même collaborateur. Elle ne mesure donc pas les redevances reçues par les titulaires, mais elle dit où se trouvent les collaborateurs.</p>
${tableRetro('fr', h)}
<p>Les rétrocessions pèsent nettement plus dans le premier quart de recettes (${h.pct(partRetro[1])} des recettes encaissées) que dans le dernier (${h.pct(partRetro[4])}). C'est cohérent avec des praticiens en début d'exercice qui travaillent en partie comme collaborateurs avant de s'installer, ou qui exercent à temps partiel dans le cabinet d'un confrère. Le montant net des recettes moyen du premier quart, ${h.eur(Q[0].recettes)}, est d'ailleurs très inférieur à celui de l'ensemble, ${h.eur(G.recettes)}.</p>
<h2>Salarié ou libéral</h2>
<p>Le code de déontologie admet les deux formes, et le choix change l'économie du cabinet. Le collaborateur salarié soigne les patients du cabinet contre un salaire, soumis aux cotisations patronales ; le titulaire porte le risque d'activité et encaisse les honoraires. Le collaborateur libéral encaisse ses propres honoraires, paie ses cotisations, peut se constituer une clientèle personnelle et reverse une redevance ; le risque d'agenda vide est pour lui. Une collaboration libérale où le collaborateur n'aurait aucune clientèle propre, des horaires imposés et aucune liberté d'organisation risque d'être requalifiée en contrat de travail : relisez le contrat avec un conseil.</p>
<p>La forme juridique du cabinet joue aussi. Dans une société d'exercice, la question se pose autrement, entre associés ; la page ${h.a('selarl-ou-bnc', 'SELARL ou BNC')} pose les termes du choix fiscal.</p>
<h2>Les points à trancher avant de signer</h2>
<ul>
<li><strong>L'assiette de la redevance</strong> : honoraires encaissés, comme le prévoit la note de l'Ordre, et non facturés ; préciser le sort des impayés et des prothèses réglées en plusieurs fois.</li>
<li><strong>Ce que couvre la redevance</strong> : fauteuil, assistante, matériel, consommables, laboratoire, secrétariat, logiciel. Tout ce qui n'est pas écrit sera discuté plus tard.</li>
<li><strong>Les jours et les horaires</strong> : le collaborateur organise son activité, mais le partage du fauteuil doit être prévu, demi-journée par demi-journée.</li>
<li><strong>La clientèle personnelle</strong> : comment elle se constitue, et ce qu'elle devient au départ du collaborateur.</li>
<li><strong>La sortie</strong> : préavis, clause de non-concurrence conforme à l'article R4127-277, et communication du contrat au conseil départemental.</li>
</ul>
<h2>Quand un fauteuil en plus justifie une collaboration</h2>
<p>Un troisième fauteuil inoccupé une partie de la semaine coûte du loyer et de l'amortissement sans rien produire. Avant d'y installer un collaborateur, comptez sur quatre semaines d'agenda les heures où il reste vide, et estimez ce que la redevance couvrirait. Si le fauteuil est déjà rentable avec vous seul, mesurez plutôt votre ${h.a('ca-par-fauteuil', 'chiffre d’affaires par fauteuil')} et votre ${h.a('taux-de-charges', 'taux de charges')}. Le ${h.a('home', 'diagnostic du cabinet')} signale ce levier quand vous déclarez au moins trois fauteuils, et la rubrique ${h.a('organisation-cabinet', 'organisation et performance')} le replace parmi les autres.</p>`,
  },
  en: {
    slug: 'dental-associate-contract',
    nav: 'Associate dentist contract',
    card: 'The French self-employed associate contract, the fee paid to the owner and what the chair must cover.',
    title: 'Dental associate contract in France 2026: rules and fee rate',
    description: 'Associate dentists in France in 2026: a written contract is compulsory, the Ordre’s rules, no official fee rate, and how to check the fee against chair costs.',
    h1: 'Self-employed associates in French dental practices',
    intro: 'What the law requires in the contract, what the dental council says, and how to judge a fee rate that no text sets.',
    resume: `A French dentist can bring a colleague into the practice as a self-employed associate (collaborateur libéral): a non-salaried dentist who treats their own patients using the owner’s chair, equipment and often dental nurse, and pays the owner a fee (redevance) in return. The law of 2 August 2005 requires a written contract, on pain of nullity, stating its length, the pay arrangements, how the associate may build a personal list of patients, and how it ends. The dentists’ code of ethics limits a sole practice to one associate without the council’s approval and requires the contract to be sent to the local council of the Ordre. No law and no Ordre guidance sets the fee rate: it is negotiated. To judge a rate, set it against the costs of the chair provided. In the UNASA ${Y} accounts, fees handed on to other dentists make up ${p(partRetro[0], 'en')} of cash receipts on average.`,
    faqs: [
      { q: 'What fee rate does an associate dentist pay in France?', a: `No text sets one and the Ordre publishes no scale: the percentage is negotiated and written into the contract. To see whether a rate holds up, compare the fee it produces with the costs of the chair provided, including rent, staff, equipment and consumables. The small calculator works out the rate that just covers those costs from your own figures.` },
      { q: 'Must a French associate dentist contract be in writing?', a: `Yes, or it is void. Article 18 of the law of 2 August 2005 requires a written contract stating its length, how the associate is paid, how they may look after their own patients, and how it ends, with notice. The dentists’ code of ethics also requires it to be sent to the local council of the Ordre.` },
      { q: 'How many associates can a French dentist take on?', a: `In a sole practice, one: an associate or an assistant student, under article R4127-276. Beyond that the local council must approve, or the national council beyond two, for three years where public health needs justify it, or three months for an exceptional influx of patients or the owner’s health. No answer within two months counts as approval.` },
      { q: 'When is the associate’s fee due to the practice owner?', a: `According to the Ordre’s note on associate contracts, the fee is a percentage of the fees the associate collects, due as soon as they are received rather than when they are billed. It is in principle subject to VAT, with an exemption possible below a turnover threshold: check this year’s threshold with your accountant, since the 2020 figures in the note are out of date.` },
      { q: 'Can a former associate open a practice next door?', a: `The code of ethics covers this. After more than three consecutive months as a locum or assistant dentist, a practitioner may not, for two years, set up where they would compete directly with the owner, unless the owner agrees. The Ordre’s model contract carries clauses of this kind; read them before signing.` },
      { q: 'Salaried or self-employed associate: what changes for the practice?', a: `A salaried associate draws a wage, with employer contributions, and treats the practice’s patients. A self-employed associate collects their own fees, pays their own contributions, may build a personal list of patients and pays a fee to the owner. The code of ethics allows both; the second shifts the risk of an empty diary onto the associate.` },
    ],
    body: (h) => `
<h2>The framework: one law and four ethics articles</h2>
<p>Self-employed associates rest on a legal base shared by all regulated professions in France: ${h.src('loi2005_882', 'article 18 of the law of 2 August 2005')}. It defines the associate as a non-salaried member of one of those professions working alongside a colleague, who “may complete their training and may build a personal clientele”. The contract “must, on pain of nullity, be in writing and state”:</p>
<ul>
<li>its length, fixed or open-ended;</li>
<li>how the associate is paid, which in practice means the fee to the owner;</li>
<li>how the associate may meet the needs of their own patients;</li>
<li>how and with what notice it may be ended;</li>
<li>suspension for maternity, paternity or adoption.</li>
</ul>
<p>The ${h.src('deontologieDentiste', 'dentists’ code of ethics')} adds rules for the profession. Article R4127-276 lets a dentist working alone take on one student or one associate dentist, and says the arrangement “may be salaried or self-employed”. Article R4127-276-1 allows further associates with approval: from the local council, or the national council beyond two, for three years where public health needs justify it, or three months for an exceptional influx of patients or the owner’s health; two months’ silence counts as approval. Article R4127-279 bars any joint practice without a written contract submitted to the local council, which responds within a month. Article R4127-277 bars a dentist who has been a locum or assistant for more than three consecutive months from setting up in direct competition for two years, unless the owner agrees.</p>
<h2>The Ordre’s model contract</h2>
<p>The French dental council (Ordre national des chirurgiens-dentistes) publishes a ${h.src('oncdCollaboration', 'model self-employed associate contract')}, version of 1 September 2023, and a ${h.src('oncdNoteContrats', 'briefing note on associate contracts')}. The note sets the two rules for the fee. The associate “pays the practice owner a percentage of the fees collected”, and it falls due as soon as the associate receives those fees. It is in principle subject to VAT, with an exemption possible: the thresholds quoted in the note date from 2020 and need checking for the current year.</p>
<p>What neither the law, the code nor the Ordre says is the rate. The words “redevance” and “rétrocession” do not even appear in the ethics articles, which speak only of associates. The percentages dentists quote to one another come from negotiation, location, equipment and the nursing support provided. Dentimètre therefore publishes none of them as a benchmark.</p>
<h2>Judging a rate: start from the chair’s costs</h2>
<p>For the owner, the fee must at least pay for the chair lent: a share of the rent, the nurse working with the associate, equipment, consumables, sterilisation, software. For the associate, what is left after the fee must cover contributions and income. The fair rate lies between the two, and it can be worked out. The break-even rate is simple: annual chair costs ÷ fees collected by the associate.</p>
<p>A worked example, for the method only. An associate collects ${h.eur(omni)}, the ${DATA_YEAR} average for a general dentist according to ${h.src('ameliHonoraires', 'Assurance Maladie')}, in a practice whose running costs, excluding the owner’s personal contributions, match the average UNASA practice: ${h.eur(chargesCabinet)} a year. Charge half of those costs to the associate’s chair, ${h.eur(chargesFauteuil)}, and the rate that just covers them is ${h.pct(pm)}. The half-and-half split is an illustrative convention; replace it with your own figures.</p>
${tableTaux('en', h)}
<p>The calculator at the top of the page reruns this with your numbers. It does not suggest a rate: the one it shows at first is a sample entry, to be replaced by the rate in your contract or proposal.</p>
<h2>What practice accounts show</h2>
<p>The ${h.src('unasa', 'UNASA')} accounts have a separate line for “fees handed on”: what a dentist passes to others, locums or the owner of a practice where they are an associate. So it does not measure fees received by owners, but it shows where associates are found.</p>
${tableRetro('en', h)}
<p>Fees handed on weigh far more in the bottom receipts quarter (${h.pct(partRetro[1])} of cash receipts) than in the top one (${h.pct(partRetro[4])}). That fits dentists early in their careers who work partly as associates before setting up, or part-time in a colleague’s surgery. Average net receipts in the bottom quarter, ${h.eur(Q[0].recettes)}, are also well below the overall ${h.eur(G.recettes)}.</p>
<h2>Salaried or self-employed</h2>
<p>The code of ethics allows both, and the choice changes the practice’s economics. A salaried associate treats the practice’s patients for a wage with employer contributions; the owner carries the business risk and collects the fees. A self-employed associate collects their own fees, pays their own contributions, may build their own patient list and pays a fee to the owner; the risk of an empty diary is theirs. A self-employed arrangement where the associate has no patients of their own, fixed hours and no say in organisation risks being reclassified as employment: have the contract reviewed by an adviser.</p>
<p>The practice’s legal form matters too. In an incorporated practice the question arises between partners instead; the page on ${h.a('selarl-ou-bnc', 'SELARL or sole trader')} sets out the tax side of that choice.</p>
<h2>Points to settle before signing</h2>
<ul>
<li><strong>What the fee is based on</strong>: fees collected, as the Ordre’s note says, not fees billed; state what happens to unpaid bills and to prosthetics paid in instalments.</li>
<li><strong>What the fee pays for</strong>: chair, dental nurse, equipment, consumables, laboratory, reception, software. Anything left unwritten will be argued about later.</li>
<li><strong>Days and hours</strong>: the associate organises their own work, but sharing the chair has to be planned, half-day by half-day.</li>
<li><strong>The associate’s own patients</strong>: how that list is built, and what happens to it when the associate leaves.</li>
<li><strong>The exit</strong>: notice, a non-compete clause in line with article R4127-277, and the contract sent to the local council of the Ordre.</li>
</ul>
<p>Write the answers down before the first day. Most disputes between owner and associate start with a cost that one side thought was covered by the fee and the other did not.</p>
<h2>When a spare chair justifies an associate</h2>
<p>A third chair empty part of the week costs rent and depreciation and produces nothing. Before putting an associate in it, count the empty hours over four weeks of the diary and estimate what the fee would cover. If the chair already pays with you alone, look instead at your ${h.a('ca-par-fauteuil', 'turnover per chair')} and your ${h.a('taux-de-charges', 'cost ratio')}. The ${h.a('home', 'practice check-up')} flags this lever when you report three chairs or more, and the ${h.a('organisation-cabinet', 'organisation and performance')} section sets it beside the others.</p>`,
  },
});
