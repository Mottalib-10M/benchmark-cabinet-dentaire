import { defineGuide } from '../../lib/guide-types';
import { reference, UNASA_YEAR } from '../../lib/engine/references';
import { P } from '../../lib/engine/params';
import { FR, DATA_YEAR } from '../../lib/engine/data';
import { depsCompares } from '../../lib/engine/diagnostic';
import { repereHoraireNational } from '../../lib/engine/organisation-suivi';
import { formatMoney, formatNumber, formatPercent } from '../../lib/format';

/* Les sept indicateurs du diagnostic, chacun avec le repère public qui existe (ou l'absence de repère). */
type L = 'fr' | 'en';
const G = reference('omni');
const Y = UNASA_YEAR;
const ameli = FR.p.omni!.tot!;
const nDeps = depsCompares('omni');
const RH = repereHoraireNational() ?? 0;
const TT = P.temps_travail;
const DL = P.delais_rdv;
const RN = P.rdv_non_honores;
const KR = P.revenus.carcdsf_2024;
const EX = P.defauts.omni;
const exHeures = EX.joursSemaine * EX.heuresJour * EX.semaines;
const exHoraire = EX.recettes / exHeures;
const exFauteuil = EX.recettes / EX.fauteuils;

const e = (x: number, l: L) => formatMoney(x, 0, l);
const p = (x: number, l: L, d = 1) => formatPercent(x, d, l);
const n = (x: number, l: L, d = 0) => formatNumber(x, d, l);

const tableau = (l: L, h: { table: (a: string[], b: Array<Array<string | number>>, c?: string, d?: Array<'l' | 'r'>) => string }) => {
  const fr = l === 'fr';
  const th = fr ? ['Indicateur', 'Repère public', 'Source', 'Année des données'] : ['Indicator', 'Public benchmark', 'Source', 'Data year'];
  const rows = fr
    ? [
      ['Chiffre d’affaires annuel', `${e(ameli, l)} (omnipraticien, France)`, 'Assurance Maladie', String(DATA_YEAR)],
      ['Chiffre d’affaires horaire', `≈ ${e(RH, l)} par heure de travail`, 'Ameli ÷ ORS Pays de la Loire', `${DATA_YEAR} et ${TT.annee_enquete}`],
      ['Chiffre d’affaires par fauteuil', 'Aucun', 'Aucune statistique publiée', '–'],
      ['Poids du loyer', p(G.loyer, l), 'UNASA', String(Y)],
      ['Bénéfice', `${e(G.benefice, l)} par an`, 'UNASA (CARCDSF pour le revenu)', `${Y} (${KR.annee})`],
      ['Rendez-vous manqués', `${p(RN.dentistes_pas_venu, l)} des patients absents sans prévenir`, 'Doctolib (utilisateurs)', String(RN.annee)],
      ['Délai du premier rendez-vous', `${n(DL.dentiste_median_jours, l)} jours (médiane)`, 'Doctolib et Fondation Jean-Jaurès', String(DL.annee)],
    ]
    : [
      ['Annual turnover', `${e(ameli, l)} (general dentist, France)`, 'Assurance Maladie', String(DATA_YEAR)],
      ['Turnover per hour', `≈ ${e(RH, l)} per working hour`, 'Ameli ÷ ORS Pays de la Loire', `${DATA_YEAR} and ${TT.annee_enquete}`],
      ['Turnover per chair', 'None', 'No published statistic', '–'],
      ['Weight of rent', p(G.loyer, l), 'UNASA', String(Y)],
      ['Profit', `${e(G.benefice, l)} a year`, 'UNASA (CARCDSF for income)', `${Y} (${KR.annee})`],
      ['Missed appointments', `${p(RN.dentistes_pas_venu, l)} of patients fail to turn up`, 'Doctolib (users)', String(RN.annee)],
      ['Wait for a first appointment', `${n(DL.dentiste_median_jours, l)} days (median)`, 'Doctolib and Fondation Jean-Jaurès', String(DL.annee)],
    ];
  const cap = fr
    ? 'Les sept indicateurs du diagnostic Dentimètre et le repère publié qui leur correspond. Un tiret signale qu’aucun organisme ne publie de moyenne.'
    : 'The seven indicators in the Dentimètre check-up and the matching published benchmark. A dash means no organisation publishes an average.';
  return h.table(th, rows, cap, ['l', 'l', 'l', 'l']);
};

export default defineGuide({
  id: 'indicateurs-cabinet',
  group: 'organisation',
  order: 10,
  mini: 'tableauBord',
  related: ['ca-par-fauteuil', 'taux-de-charges', 'rendez-vous-manques', 'delai-rendez-vous', 'organisation-cabinet', 'method'],
  sources: ['ameliHonoraires', 'unasa', 'carcdsfRevenus2024', 'orsPdlPanel', 'doctolibCartes2026', 'doctolibRdv2024'],
  fr: {
    slug: 'indicateurs-cabinet-dentaire',
    nav: 'Indicateurs du cabinet',
    card: 'Les sept chiffres à suivre chaque mois, avec le repère public qui existe pour chacun.',
    title: 'Indicateurs cabinet dentaire 2026 : les 7 chiffres à suivre',
    description: `Indicateurs d'un cabinet dentaire en 2026 : chiffre d'affaires, CA horaire, loyer, bénéfice, absences, délai. Définition, lecture et repère public de chacun.`,
    h1: 'Les indicateurs d’un cabinet dentaire, et les repères qui existent vraiment',
    intro: 'Sept chiffres suffisent pour piloter un cabinet. Six ont un repère publié et daté ; le chiffre par fauteuil n’en a aucun.',
    resume: `Un cabinet dentaire se pilote avec sept indicateurs : le chiffre d’affaires annuel, le chiffre d’affaires par heure au fauteuil, le chiffre d’affaires par fauteuil, le poids du loyer, le bénéfice, la part de rendez-vous manqués et le délai d’un premier rendez-vous. Six ont un repère publié et daté. L’Assurance Maladie publie les honoraires moyens d’un omnipraticien, ${e(ameli, 'fr')} en ${DATA_YEAR} au niveau national, et la moyenne de ${n(nDeps, 'fr')} départements. L’UNASA donne la structure des comptes de ${n(G.echantillon, 'fr')} cabinets en ${Y} : loyer à ${p(G.loyer, 'fr')} des recettes, personnel à ${p(G.personnel, 'fr')}. Doctolib mesure, chez les chirurgiens-dentistes qui utilisent son agenda, un délai médian de ${n(DL.dentiste_median_jours, 'fr')} jours pour obtenir un rendez-vous en ${DL.annee} et ${p(RN.dentistes_pas_venu, 'fr')} de patients absents sans prévenir en ${RN.annee}. Pour le chiffre d’affaires par fauteuil, aucune statistique n’existe : le cabinet se compare alors à lui-même, mois après mois. Le diagnostic de Dentimètre calcule les sept chiffres et affiche, pour chacun, la source et l’année du repère.`,
    faqs: [
      { q: 'Quels indicateurs un chirurgien-dentiste doit-il suivre chaque mois ?', a: `Le chiffre d’affaires du mois, les heures réellement passées au fauteuil, le nombre de rendez-vous manqués et le délai proposé à un nouveau patient. Ces quatre chiffres sortent du logiciel de cabinet et de l’agenda en quelques minutes. Le loyer, le bénéfice et le chiffre d’affaires par fauteuil bougent lentement : un point par trimestre suffit, puis un bilan complet avec les comptes annuels.` },
      { q: 'Existe-t-il une moyenne officielle du chiffre d’affaires par fauteuil dentaire ?', a: `Non. Ni l’Assurance Maladie, ni l’UNASA, ni la DREES ne comptent les fauteuils des cabinets. Les honoraires publiés le sont par praticien, et les comptes de l’UNASA par cabinet. Un chiffre par fauteuil qui circule sans source vient d’un fournisseur ou d’un cabinet de conseil. Dentimètre calcule le vôtre et l’affiche sans repère, pour le suivre dans le temps.` },
      { q: 'Comment calculer le chiffre d’affaires horaire d’un cabinet dentaire ?', a: `Divisez le chiffre d’affaires de la période par les heures passées au fauteuil sur la même période, pauses et tâches administratives exclues. Sur une année, cela fait jours par semaine × heures par jour × semaines travaillées. L’exemple de ${e(EX.recettes, 'fr')} sur ${n(exHeures, 'fr')} heures donne ${e(exHoraire, 'fr')} de l’heure. Le seul repère public divise les honoraires par le temps de travail total, il est donc plus bas.` },
      { q: 'D’où vient le repère horaire utilisé par Dentimètre ?', a: `Il divise les honoraires moyens ${DATA_YEAR} d’un omnipraticien (Assurance Maladie) par ${n(TT.heures_an, 'fr')} heures, soit ${n(TT.heures_semaine, 'fr', 1)} heures par semaine sur ${n(52 - TT.semaines_conges, 'fr', 1)} semaines. Ce temps de travail vient du panel ORS des Pays de la Loire (${TT.annee_enquete}), la seule enquête publique trouvée. Il compte aussi l’administratif : le repère est régional, ancien et prudent.` },
      { q: 'Quelle part des recettes le loyer d’un cabinet dentaire représente-t-il en moyenne ?', a: `${p(G.loyer, 'fr')} du montant net des recettes dans les comptes ${Y} de ${n(G.echantillon, 'fr')} cabinets suivis par l’UNASA. La part varie selon la taille du cabinet : Dentimètre compare donc votre loyer annuel, charges locatives comprises, au quart de recettes le plus proche du vôtre. Un propriétaire des murs saisit 0 et lit le poste à part, avec ses remboursements d’emprunt.` },
      { q: 'Le bénéfice estimé par le diagnostic remplace-t-il les comptes de l’expert-comptable ?', a: `Non. Il part des comptes moyens UNASA ${Y} du quart de recettes le plus proche, puis remplace le loyer et le coût du personnel par les vôtres. Les achats, la prothèse et les autres charges restent ceux de la moyenne. C’est un ordre de grandeur pour situer le cabinet, pas un résultat comptable : votre déclaration 2035 reste la référence.` },
    ],
    body: (h) => `
<h2>Pourquoi sept indicateurs, et pas trente</h2>
<p>Un logiciel de cabinet produit des dizaines de statistiques : actes par code, patients par tranche d’âge, encaissements par mode de paiement. La plupart décrivent l’activité sans aider à décider. Les sept chiffres retenus ici répondent chacun à une question de gestion : le cabinet produit-il assez, chaque heure rapporte-t-elle ce qu’elle devrait, le fauteuil est-il bien utilisé, les locaux coûtent-ils trop, que reste-t-il au praticien, l’agenda perd-il des créneaux, les nouveaux patients attendent-ils trop longtemps. Ce sont les sept lignes du ${h.a('home', 'diagnostic Dentimètre')}.</p>
<p>Un indicateur ne vaut que par son repère. Pour six d’entre eux, une moyenne datée est publiée, par un organisme public ou, pour l’agenda, par Doctolib sur ses utilisateurs ; le site la reprend avec sa source. Pour le chiffre d’affaires par fauteuil, aucune n’existe, et le site le dit plutôt que d’en inventer une. Le tableau ci-dessous fait le point.</p>
${tableau('fr', h)}
<h2>1. Le chiffre d’affaires annuel</h2>
<p><strong>Ce qu’il mesure.</strong> Tout ce que le praticien a facturé dans l’année, actes remboursables ou non. Dans le logiciel, c’est le total des honoraires de l’exercice, avant rétrocessions éventuelles à un collaborateur.</p>
<p><strong>Le repère.</strong> L’${h.src('ameliHonoraires', 'Assurance Maladie')} publie chaque année les honoraires moyens des praticiens actifs à part entière : ${h.eur(ameli)} pour un omnipraticien en ${DATA_YEAR}, et une moyenne propre à ${n(nDeps, 'fr')} départements. Ces honoraires ne comptent que les actes enregistrés par l’assurance maladie : l’implantologie et la parodontie non remboursables n’y figurent pas. Un cabinet orienté implantologie paraît donc mieux placé qu’il ne l’est. Les écarts entre départements sont détaillés dans le ${h.a('classement-departements', 'classement des départements')}.</p>
<h2>2. Le chiffre d’affaires par heure au fauteuil</h2>
<p><strong>Ce qu’il mesure.</strong> Ce que rapporte une heure de travail clinique. Deux cabinets au même chiffre d’affaires peuvent avoir des heures très différentes : l’un fait ${h.eur(EX.recettes)} en ${n(exHeures, 'fr')} heures, soit ${h.eur(exHoraire)} de l’heure, l’autre a besoin d’une journée de plus chaque semaine. Dans le logiciel, prenez les heures ouvertes de l’agenda et retirez les plages bloquées.</p>
<p><strong>Le repère, et sa limite.</strong> Aucune enquête nationale ne mesure le temps de travail des chirurgiens-dentistes. La seule source publique trouvée est le panel des omnipraticiens des Pays de la Loire (${h.src('orsPdlPanel', 'ORS et URPS, enquête ' + TT.annee_enquete)}) : ${n(TT.heures_semaine, 'fr', 1)} heures par semaine, ${n(TT.semaines_conges, 'fr', 1)} semaines de congés. Rapportés à ${n(TT.heures_an, 'fr')} heures par an, les honoraires moyens donnent ≈ ${h.eur(RH)} par heure de travail. Ce temps comprend l’administratif : comparé à vos seules heures de fauteuil, le repère est prudent, et votre chiffre paraîtra meilleur qu’il n’est.</p>
<h2>3. Le chiffre d’affaires par fauteuil</h2>
<p><strong>Ce qu’il mesure.</strong> Le dimensionnement du cabinet. Un fauteuil coûte en équipement, en surface et en entretien, qu’il tourne ou non. L’exemple de ${h.eur(EX.recettes)} sur ${n(EX.fauteuils, 'fr')} fauteuils donne ${h.eur(exFauteuil)} par fauteuil.</p>
<p><strong>Pas de repère public.</strong> Aucun organisme ne recense les fauteuils des cabinets : les honoraires sont publiés par praticien, les comptes par cabinet. Les moyennes par fauteuil qui circulent viennent de fournisseurs ou de cabinets de conseil, sans méthode publiée. Le diagnostic affiche donc ce chiffre sans pastille, pour le suivre d’une année sur l’autre ; la page ${h.a('ca-par-fauteuil', 'chiffre d’affaires par fauteuil')} détaille le calcul.</p>
<h2>4. Le poids du loyer</h2>
<p><strong>Ce qu’il mesure.</strong> La part du chiffre d’affaires qui part dans les locaux : loyer et charges locatives sur douze mois, divisés par les recettes. Le chiffre est dans le grand livre, au compte des loyers.</p>
<p><strong>Le repère.</strong> Les comptes ${Y} de ${n(G.echantillon, 'fr')} cabinets adhérents de l’${h.src('unasa', 'UNASA')} : ${h.pct(G.loyer)} des recettes nettes en moyenne. La part change avec la taille, et le site compare votre loyer au quart de recettes le plus proche. Le détail des autres postes est sur la page ${h.a('taux-de-charges', 'taux de charges')}.</p>
<h2>5. Le bénéfice</h2>
<p><strong>Ce qu’il mesure.</strong> Ce qui reste au praticien avant impôt sur le revenu : recettes moins charges, cotisations personnelles comprises dans la convention de l’UNASA. Le chiffre exact est celui de la déclaration 2035.</p>
<p><strong>Le repère.</strong> ${h.eur(G.benefice)} par an en moyenne dans l’échantillon UNASA ${Y}. La ${h.src('carcdsfRevenus2024', 'CARCDSF')} mesure un revenu voisin sur un autre champ, le revenu professionnel déclaré par les chirurgiens-dentistes : ${h.eur(KR.moyen)} en moyenne en ${KR.annee}, pour une médiane de ${h.eur(KR.mediane)}. Le diagnostic estime votre bénéfice en partant des comptes UNASA de votre taille, puis en y mettant votre loyer et le coût de votre équipe au minimum de la convention collective. C’est une estimation, signalée comme telle.</p>
<h2>6. Les rendez-vous manqués</h2>
<p><strong>Ce qu’il mesure.</strong> Les patients qui ne viennent pas sans prévenir, rapportés aux rendez-vous inscrits. La plupart des logiciels marquent ces absences ; sinon, un trait dans l’agenda pendant un mois suffit.</p>
<p><strong>Le repère, et sa limite.</strong> Aucune statistique officielle ne mesure les absences chez le chirurgien-dentiste. Le seul chiffre propre à la profession vient de ${h.src('doctolibRdv2024', 'Doctolib')} : en ${RN.annee}, ${h.pct(RN.dentistes_pas_venu, 1)} des patients des chirurgiens-dentistes qui utilisent son agenda ne sont pas venus sans prévenir, ${h.pct(RN.dentistes_nouveaux_patients, 1)} chez les nouveaux patients. Le champ se limite à ses utilisateurs. Le diagnostic affiche ce taux en regard et colore vos absences avec ses propres seuils, publiés sur la page ${h.a('method', 'méthode')}, et la page ${h.a('rendez-vous-manques', 'rendez-vous manqués')} détaille les leviers autorisés.</p>
<h2>7. Le délai du premier rendez-vous</h2>
<p><strong>Ce qu’il mesure.</strong> Le temps qu’attend un nouveau patient qui appelle aujourd’hui. Le plus simple : noter chaque semaine la première date libre pour une consultation de plus de trente minutes.</p>
<p><strong>Le repère.</strong> Les ${h.src('doctolibCartes2026', 'Cartes de France de l’accès aux soins 2026')} de Doctolib et de la Fondation Jean-Jaurès mesurent un délai médian de ${n(DL.dentiste_median_jours, 'fr')} jours chez le chirurgien-dentiste libéral en ${DL.annee} : la moitié des patients obtiennent un rendez-vous en moins de ${n(DL.dentiste_median_jours, 'fr')} jours, ${h.pct(DL.part_moins_48h, 0)} en moins de 48 heures, et ${h.pct(DL.part_plus_7j, 0)} attendent plus d’une semaine. Le champ se limite aux rendez-vous pris sur Doctolib ; la dernière mesure officielle, celle de la ${h.src('dreesDelais', 'DREES')}, date de ${DL.drees.annee_enquete} (${n(DL.drees.dentiste_median_jours, 'fr')} jours). Les leviers sont détaillés sur la page ${h.a('delai-rendez-vous', 'délai de rendez-vous')}.</p>
<h2>Lire les chiffres ensemble</h2>
<p>Un indicateur isolé trompe. Un chiffre d’affaires annuel sous la moyenne du département peut venir d’un cabinet ouvert trois jours par semaine qui rapporte beaucoup à l’heure : le problème n’est pas le rendement, c’est le temps d’ouverture, et c’est peut-être un choix. À l’inverse, un chiffre d’affaires élevé obtenu avec des journées de onze heures cache un chiffre horaire faible. Le loyer se lit avec le chiffre par fauteuil : des locaux chers mais pleins pèsent moins qu’un loyer modeste pour un fauteuil vide la moitié de la semaine. Les absences et le délai se lisent ensemble : un agenda saturé à six semaines qui perd deux patients par jour gagnerait plus à remplir ses trous qu’à chercher de nouveaux patients. C’est pourquoi le diagnostic regroupe les chiffres en cinq axes et classe les priorités par gain estimé, plutôt que de juger chaque ligne séparément.</p>
<h2>La routine du mois, en vingt minutes</h2>
<ol>
<li><strong>Premier lundi du mois</strong> : relever le chiffre d’affaires du mois écoulé et les heures ouvertes de l’agenda. Le mini-simulateur ci-dessus en tire le chiffre d’affaires horaire.</li>
<li><strong>Même jour</strong> : compter les rendez-vous manqués et les nouveaux patients. Une hausse des absences sur deux mois de suite appelle une action, un mois isolé non.</li>
<li><strong>Chaque semaine</strong> : noter la première date libre pour un nouveau patient. Une courbe qui s’allonge annonce une perte de patientèle avant qu’elle se voie dans le chiffre d’affaires.</li>
<li><strong>Chaque trimestre</strong> : rapporter le loyer et les salaires au chiffre d’affaires cumulé.</li>
<li><strong>Chaque année</strong> : refaire le ${h.a('home', 'diagnostic complet')} avec les comptes de l’exercice, et le comparer au précédent grâce au lien de partage.</li>
</ol>
<p>Comparer le cabinet à lui-même est souvent plus parlant que le comparer à une moyenne : les repères publics mélangent des cabinets de taille, de spécialité et de patientèle très différentes. Ils situent ; votre propre courbe dit si vous progressez. Pour la vue d’ensemble de la rubrique, voir ${h.a('organisation-cabinet', 'organisation et performance du cabinet')}.</p>`,
  },
  en: {
    slug: 'dental-practice-kpis',
    nav: 'Practice KPIs',
    card: 'The seven figures to track every month, with the public benchmark that exists for each.',
    title: 'Dental practice KPIs in France 2026: the 7 figures to track',
    description: `Dental practice KPIs in France for 2026: turnover, hourly turnover, rent, profit, no-shows, waiting time. What each means and which public benchmark exists.`,
    h1: 'Dental practice KPIs in France, and the benchmarks that really exist',
    intro: 'Seven figures are enough to run a practice. Six have a dated published benchmark; turnover per chair has none.',
    resume: `A French dental practice can be run on seven indicators: annual turnover, turnover per chairside hour, turnover per chair, the weight of rent, profit, the share of missed appointments and the wait for a first appointment. Six have a dated published benchmark. Assurance Maladie, the national health insurer, publishes average fees for a general dentist, ${e(ameli, 'en')} in ${DATA_YEAR} nationally, with a separate average for ${n(nDeps, 'en')} départements. UNASA, the federation of approved accounting bodies, gives the cost structure of ${n(G.echantillon, 'en')} practices for ${Y}: rent at ${p(G.loyer, 'en')} of receipts and staff at ${p(G.personnel, 'en')}. Doctolib, the online booking platform, measures among dentists using its diary a median wait of ${n(DL.dentiste_median_jours, 'en')} days for an appointment in ${DL.annee} and ${p(RN.dentistes_pas_venu, 'en')} of patients failing to turn up without warning in ${RN.annee}. For turnover per chair no statistic exists, so the practice compares itself with its own past months. The Dentimètre check-up calculates all seven and shows the source and year of each benchmark.`,
    faqs: [
      { q: 'Which figures should a dentist in France review every month?', a: `Turnover for the month, the hours actually spent chairside, the number of no-shows and the first date offered to a new patient. All four come out of the practice software and the diary in a few minutes. Rent, profit and turnover per chair move slowly, so a quarterly check is enough, followed by a full review once the annual accounts are in.` },
      { q: 'Is there an official average turnover per dental chair in France?', a: `No. Neither Assurance Maladie, UNASA nor DREES counts the chairs in a practice. Fees are published per dentist and UNASA accounts per practice. A per-chair figure quoted without a source usually comes from a supplier or a consultancy. Dentimètre calculates yours and shows it without a benchmark, so you can follow it over time.` },
      { q: 'How do I work out a dental practice’s turnover per hour?', a: `Divide turnover for the period by the hours spent chairside over the same period, leaving out breaks and admin. Over a year that is days per week × hours per day × weeks worked. The worked case of ${e(EX.recettes, 'en')} over ${n(exHeures, 'en')} hours gives ${e(exHoraire, 'en')} an hour. The only public benchmark divides fees by total working time, so it sits lower.` },
      { q: 'Where does the Dentimètre hourly benchmark come from?', a: `It divides a general dentist’s average ${DATA_YEAR} fees from Assurance Maladie by ${n(TT.heures_an, 'en')} hours: ${n(TT.heures_semaine, 'en', 1)} hours a week over ${n(52 - TT.semaines_conges, 'en', 1)} weeks. That working time comes from the Pays de la Loire panel of general dentists (${TT.annee_enquete}), the only public survey we found. It includes admin, so the benchmark is regional, dated and cautious.` },
      { q: 'What share of receipts does rent take in a French dental practice?', a: `${p(G.loyer, 'en')} of net receipts in the ${Y} accounts of ${n(G.echantillon, 'en')} practices followed by UNASA. The share varies with size, so Dentimètre compares your annual rent, service charges included, with the receipts quarter closest to yours. A dentist who owns the premises enters 0 and reads that cost separately, alongside loan repayments.` },
      { q: 'Does the estimated profit in the check-up replace my accountant’s figures?', a: `No. It starts from the average UNASA ${Y} accounts of the nearest receipts quarter, then swaps in your own rent and staff cost. Purchases, prosthetics and other costs stay at the average. It is an order of magnitude to place the practice, not an accounting result: your 2035 tax return remains the reference.` },
    ],
    body: (h) => `
<h2>Why seven indicators and not thirty</h2>
<p>Practice software produces dozens of statistics: procedures by code, patients by age band, takings by payment method. Most describe activity without helping anyone decide. The seven figures chosen here each answer a management question. Is the practice producing enough? Does each hour earn what it should? Is the chair well used? Do the premises cost too much? What is left for the dentist? Is the diary losing slots? Do new patients wait too long? They are the seven lines of the ${h.a('home', 'Dentimètre check-up')}.</p>
<p>An indicator is only as useful as its benchmark. For six of them a dated average is published, by a public body or, for the diary, by Doctolib on its users; the site quotes it with its source. For turnover per chair none exists, and the site says so rather than making one up. The table sums it up.</p>
${tableau('en', h)}
<h2>1. Annual turnover</h2>
<p><strong>What it measures.</strong> Everything the dentist billed over the year, reimbursable or not. In the software it is the total fees for the financial year, before any share handed on to an associate.</p>
<p><strong>The benchmark.</strong> ${h.src('ameliHonoraires', 'Assurance Maladie')} publishes each year the average fees of dentists in full activity: ${h.eur(ameli)} for a general dentist in ${DATA_YEAR}, with its own average for ${n(nDeps, 'en')} départements. These fees only cover work recorded by the insurer, so implants and non-reimbursable periodontal treatment are missing. A practice focused on implants therefore looks better placed than it is. Gaps between départements are set out in the ${h.a('classement-departements', 'département ranking')}.</p>
<h2>2. Turnover per chairside hour</h2>
<p><strong>What it measures.</strong> What one hour of clinical work brings in. Two practices with the same turnover can put in very different hours: one takes ${h.eur(EX.recettes)} in ${n(exHeures, 'en')} hours, or ${h.eur(exHoraire)} an hour, the other needs an extra day every week. In the software, take the diary’s open hours and remove blocked slots.</p>
<p><strong>The benchmark and its limit.</strong> No national survey measures how long French dentists work. The only public source we found is the panel of general dentists in Pays de la Loire (${h.src('orsPdlPanel', 'ORS and URPS, ' + TT.annee_enquete + ' survey')}): ${n(TT.heures_semaine, 'en', 1)} hours a week and ${n(TT.semaines_conges, 'en', 1)} weeks off. Spread over ${n(TT.heures_an, 'en')} hours a year, average fees give about ${h.eur(RH)} per working hour. That time includes admin, so against your chairside hours alone the benchmark is cautious and your figure will look better than it really is.</p>
<h2>3. Turnover per chair</h2>
<p><strong>What it measures.</strong> Whether the practice is the right size. A chair costs equipment, floor space and upkeep whether it is used or not. The worked case of ${h.eur(EX.recettes)} over ${n(EX.fauteuils, 'en')} chairs gives ${h.eur(exFauteuil)} per chair.</p>
<p><strong>No public benchmark.</strong> No official body counts the chairs in practices: fees are published per dentist and accounts per practice. Per-chair averages in circulation come from suppliers or consultancies with no published method. The check-up therefore shows this figure without a rating, so you can follow it year on year; the page on ${h.a('ca-par-fauteuil', 'revenue per dental chair')} explains the calculation.</p>
<h2>4. The weight of rent</h2>
<p><strong>What it measures.</strong> The share of turnover that goes on premises: twelve months of rent and service charges divided by receipts. The figure is in the ledger under rent.</p>
<p><strong>The benchmark.</strong> The ${Y} accounts of ${n(G.echantillon, 'en')} practices in the ${h.src('unasa', 'UNASA')} network: ${h.pct(G.loyer)} of net receipts on average. The share changes with size, and the site compares your rent with the closest receipts quarter. Other cost lines are on the ${h.a('taux-de-charges', 'cost ratio')} page.</p>
<h2>5. Profit</h2>
<p><strong>What it measures.</strong> What is left for the dentist before income tax: receipts minus costs, with personal social contributions counted as costs in the UNASA definition. The exact figure is the one on the 2035 return for self-employed professionals.</p>
<p><strong>The benchmark.</strong> ${h.eur(G.benefice)} a year on average in the UNASA ${Y} sample. ${h.src('carcdsfRevenus2024', 'CARCDSF')}, the dentists’ pension fund, measures a close cousin on a different scope, the professional income dentists declare: ${h.eur(KR.moyen)} on average in ${KR.annee}, with a median of ${h.eur(KR.mediane)}. The check-up estimates your profit from the UNASA accounts for your size, then puts in your own rent and the cost of your team at the collective agreement minimum. It is an estimate and labelled as one.</p>
<h2>6. Missed appointments</h2>
<p><strong>What it measures.</strong> Patients who fail to turn up without warning, as a share of booked appointments. Most software flags them; failing that, a mark in the diary for a month is enough.</p>
<p><strong>The benchmark and its limit.</strong> No official statistic measures no-shows at the dentist in France. The only dentist-specific figure comes from ${h.src('doctolibRdv2024', 'Doctolib')}: in ${RN.annee}, ${h.pct(RN.dentistes_pas_venu, 1)} of patients of dentists using its diary failed to turn up without warning, ${h.pct(RN.dentistes_nouveaux_patients, 1)} among new patients. The scope is its own users. The check-up shows that rate alongside and colours your no-shows with its own thresholds, published on the ${h.a('method', 'method page')}, and the page on ${h.a('rendez-vous-manques', 'missed appointments')} covers the levers French law allows.</p>
<h2>7. Wait for a first appointment</h2>
<p><strong>What it measures.</strong> How long a new patient calling today will wait. The simplest method is to note each week the first free date for a consultation of more than thirty minutes.</p>
<p><strong>The benchmark.</strong> The ${h.src('doctolibCartes2026', 'Cartes de France de l’accès aux soins 2026')} by Doctolib and the Fondation Jean-Jaurès measure a median wait of ${n(DL.dentiste_median_jours, 'en')} days for a private dentist in ${DL.annee}: half of patients get an appointment within ${n(DL.dentiste_median_jours, 'en')} days, ${h.pct(DL.part_moins_48h, 0)} within 48 hours, and ${h.pct(DL.part_plus_7j, 0)} wait more than a week. The scope is appointments booked through Doctolib; the latest official measure, by ${h.src('dreesDelais', 'DREES')}, dates from ${DL.drees.annee_enquete} (${n(DL.drees.dentiste_median_jours, 'en')} days). The levers are on the ${h.a('delai-rendez-vous', 'appointment wait')} page.</p>
<h2>Read the figures together</h2>
<p>A single indicator misleads. Annual turnover below the département average may come from a practice open three days a week that earns a lot per hour: the issue is opening time, not output, and it may well be a choice. Conversely, high turnover built on eleven-hour days hides a weak hourly figure. Rent reads alongside turnover per chair: expensive premises that are full weigh less than modest rent for a chair left empty half the week. No-shows and waiting time go together too: a diary booked six weeks ahead that loses two patients a day gains more from filling its gaps than from chasing new patients. That is why the check-up groups the figures into five areas and ranks priorities by estimated gain instead of judging each line on its own.</p>
<h2>The monthly routine, in twenty minutes</h2>
<ol>
<li><strong>First Monday of the month</strong>: note last month’s turnover and the diary’s open hours. The small calculator above turns them into turnover per hour.</li>
<li><strong>Same day</strong>: count no-shows and new patients. A rise in no-shows two months running calls for action; a single bad month does not.</li>
<li><strong>Every week</strong>: note the first free date for a new patient. A lengthening curve warns of lost patients before it shows in turnover.</li>
<li><strong>Every quarter</strong>: set rent and wages against cumulative turnover.</li>
<li><strong>Every year</strong>: run the ${h.a('home', 'full check-up')} again with the year’s accounts and compare it with the last one through the share link.</li>
</ol>
<p>Comparing the practice with itself often says more than comparing it with an average: public benchmarks mix practices of very different size, specialty and patient base. They place you; your own curve tells you whether you are improving. For the whole section, see ${h.a('organisation-cabinet', 'dental practice organisation and performance')}.</p>`,
  },
});
