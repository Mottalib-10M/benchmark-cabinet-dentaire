import { defineGuide } from '../../lib/guide-types';
import { reference, UNASA_YEAR } from '../../lib/engine/references';
import { FR, DATA_YEAR, DEP_CODES } from '../../lib/engine/data';
import { depsCompares, heuresAn, refHoraire } from '../../lib/engine/diagnostic';
import { P } from '../../lib/engine/params';
import { formatMoney, formatNumber, formatPercent } from '../../lib/format';

/*
 * Page d'entrée de la rubrique « Organisation et performance du cabinet ». Chaque chiffre vient des
 * fichiers de données : honoraires Assurance Maladie (ameli.json), comptes UNASA (unasa.json), temps de
 * travail ORS, délais DREES, 100 % Santé DREES (params-2026.json).
 */
type L = 'fr' | 'en';
const o = FR.p.omni!;
const U = reference('omni');
const TT = P.temps_travail;
const DL = P.delais_rdv;
const CS = P.cent_pour_cent_sante;
const D = P.revenus.drees;
const H = P.diagnostic;
const refH = refHoraire({ value: o.tot!, level: 'fr' })!;
const def = P.defauts.omni;
const hDef = heuresAn({ jours: def.joursSemaine, heures: def.heuresJour, semaines: def.semaines });
const caHDef = def.recettes / hDef;
const creneau = (caHDef * H.duree_rdv_min) / 60;
const nDeps = depsCompares('omni');
const part100 = CS.protheses_100s_meur / CS.protheses_total_meur;

const e = (x: number, l: L) => formatMoney(x, 0, l);
const p = (x: number, l: L, d = 1) => formatPercent(x, d, l);
const n = (x: number, l: L, d = 0) => formatNumber(x, d, l);

const tableau = (l: L, h: { table: (a: string[], b: Array<Array<string | number>>, c?: string, d?: Array<'l' | 'r'>) => string }) => {
  const fr = l === 'fr';
  const th = fr ? ['Indicateur', 'Repère publié', 'Source', 'Année'] : ['Indicator', 'Published benchmark', 'Source', 'Year'];
  const rows: Array<Array<string | number>> = fr
    ? [
        ['Chiffre d’affaires annuel', `${e(o.tot!, l)} (omnipraticien, France)`, 'Assurance Maladie', String(DATA_YEAR)],
        ['Chiffre d’affaires horaire', `≈ ${e(refH, l)} par heure de travail`, 'Assurance Maladie et ORS Pays de la Loire', `${DATA_YEAR} et ${TT.annee_enquete}`],
        ['Chiffre d’affaires par fauteuil', 'Aucune moyenne publiée', 'Aucune', '–'],
        ['Poids du loyer', p(U.loyer, l), 'UNASA', String(UNASA_YEAR)],
        ['Bénéfice', `${e(U.benefice, l)} par an`, 'UNASA', String(UNASA_YEAR)],
        ['Rendez-vous manqués', 'Aucune statistique publique pour les dentistes', 'Aucune', '–'],
        ['Délai du premier rendez-vous', `${n(DL.dentiste_median_jours, l)} jours (médiane)`, 'DREES', DL.annee_enquete],
      ]
    : [
        ['Annual turnover', `${e(o.tot!, l)} (general dentist, France)`, 'Assurance Maladie', String(DATA_YEAR)],
        ['Turnover per hour', `≈ ${e(refH, l)} per working hour`, 'Assurance Maladie and ORS Pays de la Loire', `${DATA_YEAR} and ${TT.annee_enquete}`],
        ['Turnover per chair', 'No published average', 'None', '–'],
        ['Weight of rent', p(U.loyer, l), 'UNASA', String(UNASA_YEAR)],
        ['Profit', `${e(U.benefice, l)} a year`, 'UNASA', String(UNASA_YEAR)],
        ['Missed appointments', 'No public statistic for dentists', 'None', '–'],
        ['Wait for a first appointment', `${n(DL.dentiste_median_jours, l)} days (median)`, 'DREES', DL.annee_enquete],
      ];
  const cap = fr
    ? 'Les sept indicateurs du diagnostic Dentimètre et le repère public qui existe pour chacun. Là où aucune statistique n’est publiée, le diagnostic affiche votre chiffre sans le comparer.'
    : 'The seven indicators in the Dentimètre check-up and the public benchmark available for each. Where no statistic is published, the check-up shows your figure without comparing it.';
  return h.table(th, rows, cap, ['l', 'l', 'l', 'r']);
};

export default defineGuide({
  id: 'organisation-cabinet',
  group: 'organisation',
  order: 5,
  mini: 'valeurHeure',
  related: ['indicateurs-cabinet', 'rendez-vous-manques', 'deleguer-assistante', 'delai-rendez-vous', 'devis-100-sante', 'collaboration-liberale'],
  sources: ['ameliHonoraires', 'unasa', 'orsPdlPanel', 'dreesDelais', 'dreesCns2025'],
  fr: {
    slug: 'organisation-cabinet-dentaire',
    nav: 'Vue d’ensemble',
    card: 'Les leviers d’organisation d’un cabinet dentaire, chiffrés avec les données publiques.',
    title: 'Organisation du cabinet dentaire 2026 : repères et leviers',
    description: `Organiser son cabinet dentaire en 2026 : agenda, équipe, loyer, devis et délais, avec les repères officiels (Assurance Maladie ${DATA_YEAR}, UNASA, DREES) et un calcul.`,
    h1: 'Organisation et performance du cabinet dentaire',
    intro: 'Ce qui fait la différence entre deux cabinets au même chiffre d’affaires, et les chiffres publics pour s’y comparer.',
    resume: `Deux cabinets dentaires qui encaissent la même somme ne vivent pas de la même façon : l’un remplit ses heures, délègue l’accueil et la stérilisation, garde un loyer léger et reçoit vite les nouveaux patients ; l’autre perd des créneaux, fait tout lui-même et paie des locaux trop grands. Les repères publics permettent de situer chacun. Un omnipraticien actif à part entière facture en moyenne ${e(o.tot!, 'fr')} par an d’après l’Assurance Maladie (${DATA_YEAR}). Les comptes UNASA ${UNASA_YEAR} montrent un loyer de ${p(U.loyer, 'fr')} des recettes et un personnel de ${p(U.personnel, 'fr')}. La dernière enquête publique sur le temps de travail, régionale, compte ${n(TT.heures_semaine, 'fr', 1)} heures par semaine (${TT.annee_enquete}). La DREES mesure un délai médian de ${n(DL.dentiste_median_jours, 'fr')} jours pour un rendez-vous chez le dentiste. Cette rubrique reprend chaque levier, avec ses textes et ses chiffres, et renvoie au diagnostic pour les appliquer à votre cabinet.`,
    faqs: [
      { q: 'Par quoi commencer pour mieux organiser un cabinet dentaire ?', a: `Par la mesure. Notez sur quatre semaines les heures réellement passées au fauteuil, les rendez-vous manqués et le délai proposé à un nouveau patient. Rapportez ensuite votre chiffre d’affaires à ces heures : à ${e(def.recettes, 'fr')} sur ${n(hDef, 'fr')} heures, une heure vaut ${e(caHDef, 'fr')}. Ce chiffre dit ce que coûte chaque créneau vide et ce que rapporte une tâche confiée à l’assistante.` },
      { q: 'Pourquoi le diagnostic n’affiche-t-il aucun repère pour le chiffre par fauteuil ?', a: 'Non. L’Assurance Maladie publie des honoraires par praticien, l’UNASA des comptes par cabinet, mais aucune source publique ne rapporte l’activité au nombre de fauteuils. Les chiffres qui circulent viennent d’enquêtes commerciales sans méthode publiée. Le diagnostic calcule donc votre chiffre par fauteuil et le laisse sans comparaison, plutôt que d’afficher un repère inventé.' },
      { q: 'Combien d’heures par semaine travaille un chirurgien-dentiste libéral ?', a: `Aucune statistique nationale ne le dit. La seule enquête publique trouvée vient du panel des omnipraticiens des Pays de la Loire (ORS et URPS, ${TT.annee_enquete}) : ${n(TT.heures_semaine, 'fr', 1)} heures par semaine, sur ${n(TT.jours_semaine, 'fr')} jours en moyenne, avec ${n(TT.semaines_conges, 'fr', 1)} semaines de congés. Ces heures comprennent l’administratif, pas seulement le temps au fauteuil.` },
      { q: 'Quelle part des recettes un cabinet dentaire consacre-t-il à son loyer ?', a: `${p(U.loyer, 'fr')} en moyenne dans les comptes UNASA ${UNASA_YEAR} des cabinets de chirurgiens-dentistes, loyer et charges locatives réunis. La part varie avec la taille du cabinet : la page sur le taux de charges la détaille par quart de recettes. Au-delà d’un tiers de plus que ce repère, le diagnostic signale le loyer comme une piste d’économie.` },
      { q: 'Le diagnostic Dentimètre remplace-t-il un expert-comptable ou un consultant ?', a: 'Non. Il compare quelques chiffres que vous connaissez à des moyennes publiques et en tire des pistes prudentes, avec leurs hypothèses écrites sur la page Méthode. Il ne voit ni vos comptes, ni votre patientèle, ni vos contrats. Pour décider d’un recrutement, d’un déménagement ou d’une association, appuyez-vous sur vos comptes réels et sur vos conseils habituels.' },
    ],
    body: (h) => `
<h2>Quatre leviers, un même chiffre d’affaires</h2>
<p>Le chiffre d’affaires dit combien le cabinet produit ; il ne dit pas comment. Deux omnipraticiens à ${h.eur(o.tot!)}, la moyenne ${DATA_YEAR} publiée par l’${h.src('ameliHonoraires', 'Assurance Maladie')}, peuvent avoir des semaines très différentes. Le premier travaille ${n(TT.jours_semaine, 'fr')} jours avec une assistante qui prépare, stérilise et accueille ; le second travaille cinq jours seul, perd deux rendez-vous par jour et paie un loyer conçu pour trois fauteuils. Leur revenu, leur fatigue et la valeur de leur cabinet à la revente n’ont rien à voir.</p>
<p>Le diagnostic de l’accueil regroupe ces différences en cinq axes : la production (le chiffre d’affaires face aux confrères du département), le rendement (ce que rapporte une heure), la maîtrise des charges (le loyer d’abord), l’équipe (le personnel et ce qui lui est confié) et l’organisation (rendez-vous manqués et délai d’accès). Les articles de cette rubrique reprennent chaque levier un par un, avec les textes qui l’encadrent et les chiffres publics qui permettent de se situer.</p>
<ul>
<li><strong>L’agenda</strong> : ${h.a('rendez-vous-manques', 'les rendez-vous manqués')}, ${h.a('delai-rendez-vous', 'le délai du premier rendez-vous')} et le remplissage des heures.</li>
<li><strong>L’équipe</strong> : ${h.a('deleguer-assistante', 'ce que l’on peut confier à l’assistante dentaire')} et ${h.a('salaire-assistante-dentaire', 'ce qu’elle coûte')}.</li>
<li><strong>Les locaux et le matériel</strong> : ${h.a('taux-de-charges', 'le poids du loyer et des charges')}, ${h.a('ca-par-fauteuil', 'le chiffre d’affaires par fauteuil')} et ${h.a('collaboration-liberale', 'la collaboration libérale')} pour faire travailler un fauteuil en trop.</li>
<li><strong>Le pilotage</strong> : ${h.a('indicateurs-cabinet', 'les indicateurs à suivre chaque mois')} et ${h.a('devis-100-sante', 'les devis de prothèse et le 100 % Santé')}.</li>
</ul>
<h2>Ce que vaut une heure de fauteuil</h2>
<p>Tous les leviers se ramènent à la même unité : l’heure. Un cabinet qui encaisse ${h.eur(def.recettes)} en travaillant ${n(def.joursSemaine, 'fr', 1)} jours par semaine, ${n(def.heuresJour, 'fr')} heures au fauteuil par jour et ${n(def.semaines, 'fr')} semaines par an passe ${n(hDef, 'fr')} heures au fauteuil. Chaque heure vaut donc ${h.eur(caHDef)}, et un créneau de ${H.duree_rdv_min} minutes ${h.eur(creneau)}. Ce sont ces montants qu’un rendez-vous manqué fait perdre, et qu’une tâche déléguée peut rendre au soin.</p>
<p>Pour comparer, il faut un temps de travail de référence. Aucune statistique nationale ne le donne : la DREES, l’Insee, l’Ordre et la CARCDSF publient des effectifs et des revenus, pas des heures. La seule enquête publique trouvée est le panel des omnipraticiens des Pays de la Loire, mené par l’${h.src('orsPdlPanel', 'Observatoire régional de la santé et l’URPS')} : ${n(TT.heures_semaine, 'fr', 1)} heures par semaine en ${TT.annee_enquete}, sur ${n(TT.jours_semaine, 'fr')} jours, avec ${n(TT.semaines_conges, 'fr', 1)} semaines de congés. Cela fait environ ${n(TT.heures_an, 'fr')} heures par an, calcul de Dentimètre. Rapportées à la moyenne nationale des honoraires, elles donnent un repère de ${h.eur(refH)} par heure de travail.</p>
<p>Ce repère a deux limites, que le diagnostic affiche. Il vient d’une seule région et d’une enquête de ${TT.annee_enquete}. Surtout, il compte tout le temps de travail, administratif compris, alors que vous saisissez vos heures au fauteuil : votre chiffre horaire sort donc mécaniquement au-dessus du repère. Un écart favorable de quelques dizaines de pour cent ne signifie pas que le cabinet est plus productif que la moyenne ; un chiffre en dessous du repère, lui, est un signal net.</p>
<h2>Les repères publics, indicateur par indicateur</h2>
<p>Le diagnostic suit sept indicateurs. Pour chacun, le tableau ci-dessous donne le repère public qui existe, sa source et son année. Deux n’en ont pas : le chiffre d’affaires par fauteuil et les rendez-vous manqués. Plutôt que de reprendre des chiffres d’enquêtes commerciales sans méthode, le site affiche votre valeur seule et le dit.</p>
${tableau('fr', h)}
<p>Les honoraires moyens existent pour ${n(nDeps, 'fr')} des ${n(DEP_CODES.length, 'fr')} départements chez les omnipraticiens ; ailleurs, le secret statistique impose la moyenne régionale. Les comptes de l’${h.src('unasa', 'UNASA')} portent sur ${n(U.echantillon, 'fr')} cabinets adhérents d’un organisme de gestion, ce qui exclut les sociétés à l’impôt sur les sociétés et les centres de santé. Le délai d’accès vient d’une étude de la ${h.src('dreesDelais', 'DREES')} menée en ${DL.annee_enquete} : c’est la mesure officielle la plus récente, et elle date.</p>
<h2>L’agenda : ce qui se perd sans bruit</h2>
<p>Un rendez-vous manqué ne laisse aucune trace dans les comptes : le chiffre d’affaires est simplement plus bas. Aucune statistique publique ne mesure ces absences chez les chirurgiens-dentistes. Le seul ordre de grandeur officiel concerne les médecins : l’Académie nationale de médecine et l’Ordre des médecins l’estimaient en 2023 entre ${p(P.rdv_non_honores.part_hebdo_min, 'fr', 0)} et ${p(P.rdv_non_honores.part_hebdo_max, 'fr', 0)} des rendez-vous. La « taxe lapin » de la loi de financement de la sécurité sociale pour 2025 a été censurée par le Conseil constitutionnel, et un praticien conventionné ne peut pas facturer un rendez-vous manqué : les leviers sont donc dans l’organisation, rappel la veille, liste d’attente et confirmation des soins longs.</p>
<p>Le délai d’accès joue en sens inverse. Un agenda plein plusieurs semaines à l’avance paraît rassurant, mais un nouveau patient qui attend plus d’un mois va souvent ailleurs. La DREES mesurait un délai médian de ${n(DL.dentiste_median_jours, 'fr')} jours, ${n(DL.median_symptomes_jours, 'fr')} jours seulement quand le patient signale des symptômes. Garder chaque jour quelques créneaux pour les nouveaux patients et les urgences, rendus au planning la veille s’ils restent vides, raccourcit ce délai sans faire baisser le remplissage.</p>
<h2>L’équipe et les locaux</h2>
<p>Le personnel pèse ${h.pct(U.personnel)} des recettes dans les comptes UNASA ${UNASA_YEAR}, le loyer ${h.pct(U.loyer)}. Ces deux postes se pilotent ensemble. Un cabinet sans assistante paie moins de salaires mais passe au fauteuil des heures de préparation, de stérilisation et d’accueil qui ne produisent rien. Depuis 2016, l’assistant dentaire est une profession de santé réglementée : le Code de la santé publique lui confie l’aide au fauteuil, l’accueil, la gestion du risque infectieux, le dossier patient et l’éducation à l’hygiène. Les actes d’imagerie et de prophylaxie prévus par la loi de 2023 attendent encore leur décret.</p>
<p>Un loyer trop lourd se corrige rarement vite, mais il se partage. Un troisième fauteuil peu occupé peut accueillir un collaborateur libéral, qui reverse au titulaire une redevance sur ses honoraires ; aucun barème officiel n’en fixe le taux, il se négocie et s’écrit dans un contrat communiqué à l’Ordre. Le diagnostic signale le loyer quand il dépasse d’un tiers le repère des cabinets de votre taille, et chiffre prudemment ce qu’un partage pourrait rendre.</p>
<h2>Les devis et le 100 % Santé</h2>
<p>La prothèse pèse lourd dans la production d’un omnipraticien. Depuis 2020 pour les prothèses fixes et 2021 pour les amovibles, le chirurgien-dentiste doit proposer une solution sans reste à charge ou à reste à charge maîtrisé chaque fois qu’elle existe, sur un devis écrit, daté et signé. D’après la ${h.src('dreesCns2025', 'DREES')}, les prothèses du panier 100 % Santé représentent ${p(part100, 'fr', 0)} des dépenses de prothèses dentaires en ${CS.annee}. Le taux d’acceptation des devis n’est publié nulle part : c’est un chiffre à suivre dans votre propre logiciel, mois après mois.</p>
<h2>Comment utiliser cette rubrique</h2>
<p>Commencez par le ${'<a href="/fr/">diagnostic en quatre étapes</a>'} : trois minutes, sans inscription, et vos réponses ne quittent pas votre navigateur tant que vous ne demandez pas d’échange. Le rapport classe vos trois priorités par gain estimé et renvoie chacune vers l’article qui l’explique. Chaque article a son propre calcul, pour tester une hypothèse sur vos chiffres : coût de vos absences, heures rendues par la délégation, poids du loyer, délai d’attente, redevance d’un collaborateur. La page ${h.a('method', 'Méthode et sources')} publie toutes les hypothèses et formules, pour que chaque chiffre puisse être vérifié.</p>
<p>Le revenu, enfin, reste la mesure qui compte. La DREES mesure un revenu libéral moyen de ${h.eur(D.liberal_moyen)} pour les chirurgiens-dentistes en ${D.annee}, avec une médiane de ${h.eur(D.quantiles.mediane)}. Les leviers de cette rubrique ne promettent pas de changer de décile ; ils montrent où le temps et l’argent du cabinet partent, pour choisir où agir en premier.</p>`,
  },
  en: {
    slug: 'dental-practice-management',
    nav: 'Overview',
    card: 'How a French dental practice is organised, benchmarked against public data.',
    title: 'Dental practice management in France 2026: key benchmarks',
    description: `Running a French dental practice in 2026: diary, team, rent, quotes and waiting times, with official benchmarks (Assurance Maladie ${DATA_YEAR}, UNASA, DREES).`,
    h1: 'Organising and running a dental practice in France',
    intro: 'What separates two practices with the same turnover, and the public figures to compare yours with.',
    resume: `Two dental practices that take the same amount of money do not run the same way. One fills its hours, hands reception and sterilisation to a dental nurse, keeps rent light and sees new patients quickly; the other loses slots, does everything itself and pays for premises that are too large. Public benchmarks let you place each one. A full-time general dentist in France bills ${e(o.tot!, 'en')} a year on average according to Assurance Maladie, the national health insurer (${DATA_YEAR}). The ${UNASA_YEAR} UNASA accounts put rent at ${p(U.loyer, 'en')} of receipts and staff at ${p(U.personnel, 'en')}. The only public survey of working time, a regional one, counts ${n(TT.heures_semaine, 'en', 1)} hours a week (${TT.annee_enquete}). DREES, the health ministry’s statistics office, measured a median wait of ${n(DL.dentiste_median_jours, 'en')} days for a dental appointment. This section takes each lever in turn, with its rules and figures, and points to the check-up to apply them to your practice.`,
    faqs: [
      { q: 'Where should a dentist start when reorganising a practice?', a: `With measurement. Over four weeks, record the hours actually spent chairside, the missed appointments and the wait offered to a new patient. Then divide turnover by those hours: at ${e(def.recettes, 'en')} over ${n(hDef, 'en')} hours, one hour is worth ${e(caHDef, 'en')}. That figure tells you what each empty slot costs and what a task handed to the dental nurse brings back.` },
      { q: 'Why does the check-up show no benchmark for turnover per chair?', a: 'No. Assurance Maladie publishes fees per dentist and UNASA publishes accounts per practice, but no public source relates activity to the number of chairs. Figures that circulate come from commercial surveys with no published method. The check-up therefore works out your turnover per chair and leaves it uncompared rather than show an invented benchmark.' },
      { q: 'How many hours a week does a self-employed French dentist work?', a: `No national statistic says. The only public survey found is the panel of general dentists in Pays de la Loire (ORS and URPS, ${TT.annee_enquete}): ${n(TT.heures_semaine, 'en', 1)} hours a week over ${n(TT.jours_semaine, 'en')} days on average, with ${n(TT.semaines_conges, 'en', 1)} weeks of leave. Those hours include admin, not only chairside time, so compare them with care.` },
      { q: 'What share of receipts goes on rent in a French dental practice?', a: `${p(U.loyer, 'en')} on average in the ${UNASA_YEAR} UNASA accounts for dental practices, rent and service charges together. The share changes with practice size, and the cost ratio page breaks it down by receipts quarter. When your rent runs more than a third above that benchmark, the check-up flags it as a saving to look at.` },
      { q: 'Does the Dentimètre check-up replace an accountant or a consultant?', a: 'No. It compares a few figures you know with public averages and draws cautious leads from them, with every assumption written up on the Method page. It sees neither your accounts, nor your patient list, nor your contracts. For a hire, a move or a partnership, rely on your real accounts and your usual advisers.' },
    ],
    body: (h) => `
<h2>Four levers, one turnover</h2>
<p>Turnover tells you how much a practice produces, not how. Two general dentists on ${h.eur(o.tot!)}, the ${DATA_YEAR} average published by ${h.src('ameliHonoraires', 'Assurance Maladie')}, can have very different weeks. The first works ${n(TT.jours_semaine, 'en')} days with a dental nurse who sets up, sterilises and greets patients; the second works five days alone, loses two appointments a day and pays rent on premises built for three chairs. Their income, their fatigue and what their practice will sell for have little in common.</p>
<p>The check-up on the home page groups those differences into five areas: production (turnover against peers in the département), output (what one hour brings in), cost control (rent first), team (staff and what they are trusted with) and organisation (missed appointments and access time). The articles in this section take each lever one by one, with the rules that frame it and the public figures that let you place yourself.</p>
<ul>
<li><strong>The diary</strong>: ${h.a('rendez-vous-manques', 'missed appointments')}, ${h.a('delai-rendez-vous', 'the wait for a first appointment')} and how full the hours are.</li>
<li><strong>The team</strong>: ${h.a('deleguer-assistante', 'what a dental assistant may legally take on')} and ${h.a('salaire-assistante-dentaire', 'what one costs')}.</li>
<li><strong>Premises and equipment</strong>: ${h.a('taux-de-charges', 'the weight of rent and costs')}, ${h.a('ca-par-fauteuil', 'turnover per chair')} and ${h.a('collaboration-liberale', 'associate contracts')} to put a spare chair to work.</li>
<li><strong>Steering</strong>: ${h.a('indicateurs-cabinet', 'the indicators to track each month')} and ${h.a('devis-100-sante', 'prosthetic quotes under 100% Santé')}.</li>
</ul>
<h2>What a chairside hour is worth</h2>
<p>Every lever comes back to one unit: the hour. A practice taking ${h.eur(def.recettes)} on ${n(def.joursSemaine, 'en', 1)} days a week, ${n(def.heuresJour, 'en')} chairside hours a day and ${n(def.semaines, 'en')} weeks a year spends ${n(hDef, 'en')} hours in the chair. Each hour is therefore worth ${h.eur(caHDef)}, and a ${H.duree_rdv_min}-minute slot ${h.eur(creneau)}. Those are the sums a missed appointment loses and a delegated task can give back to treatment.</p>
<p>A comparison needs a reference working time, and no national statistic provides one: DREES, Insee, the dental council and the CARCDSF pension fund publish headcounts and incomes, not hours. The only public survey found is the panel of general dentists in Pays de la Loire run by the ${h.src('orsPdlPanel', 'regional health observatory and the dentists’ URPS')}: ${n(TT.heures_semaine, 'en', 1)} hours a week in ${TT.annee_enquete}, over ${n(TT.jours_semaine, 'en')} days, with ${n(TT.semaines_conges, 'en', 1)} weeks of leave. That makes about ${n(TT.heures_an, 'en')} hours a year, our own arithmetic. Set against the national fee average, it gives a benchmark of ${h.eur(refH)} per working hour.</p>
<p>The benchmark has two limits, and the check-up shows both. It comes from a single region and a ${TT.annee_enquete} survey. More importantly, it counts all working time, admin included, while you enter chairside hours, so your hourly figure will naturally come out above it. Being a few tens of per cent above does not prove the practice outperforms the average; being below it is a clear signal.</p>
<h2>Public benchmarks, indicator by indicator</h2>
<p>The check-up follows seven indicators. For each, the table gives the public benchmark that exists, its source and its year. Two have none: turnover per chair and missed appointments. Rather than borrow figures from commercial surveys with no stated method, the site shows your value alone and says so.</p>
${tableau('en', h)}
<p>Average fees exist for ${n(nDeps, 'en')} of the ${n(DEP_CODES.length, 'en')} départements for general dentists; elsewhere statistical confidentiality means the regional average is used. The ${h.src('unasa', 'UNASA')} accounts cover ${n(U.echantillon, 'en')} practices filed through approved accounting bodies, which leaves out incorporated practices paying corporation tax and health centres. The access time comes from a ${h.src('dreesDelais', 'DREES')} study carried out in ${DL.annee_enquete}: the latest official measure, and an old one.</p>
<h2>The diary: what disappears quietly</h2>
<p>A missed appointment leaves no line in the accounts; turnover is simply lower. No public statistic measures no-shows among French dentists. The only official order of magnitude concerns doctors: in 2023 the Académie nationale de médecine and the doctors’ council put it between ${p(P.rdv_non_honores.part_hebdo_min, 'en', 0)} and ${p(P.rdv_non_honores.part_hebdo_max, 'en', 0)} of appointments. The no-show penalty in the 2025 social security financing act was struck down by the Constitutional Council, and a contracted practitioner may not bill a missed appointment, so the levers lie in organisation: a reminder the day before, a waiting list and confirmation of long sessions.</p>
<p>Access time works the other way. A diary full weeks ahead looks reassuring, yet a new patient told to wait more than a month often goes elsewhere. DREES measured a median of ${n(DL.dentiste_median_jours, 'en')} days, only ${n(DL.median_symptomes_jours, 'en')} when the patient reported symptoms. Keeping a few slots free each day for new patients and emergencies, released the day before if still empty, shortens the wait without emptying the diary.</p>
<h2>Team and premises</h2>
<p>Staff takes ${h.pct(U.personnel)} of receipts in the ${UNASA_YEAR} UNASA accounts, rent ${h.pct(U.loyer)}. The two are best managed together. A dentist with no nurse pays less in wages but spends chair time on set-up, sterilisation and reception that produce nothing. Since 2016 the dental assistant has been a regulated health profession in France: the Public Health Code gives it chairside assistance, reception, infection control, patient records and oral hygiene education. The imaging and preventive work allowed by a 2023 law still awaits its implementing decree.</p>
<p>Heavy rent is rarely fixed quickly, but it can be shared. A third chair that sits idle can host a self-employed associate, who pays the principal a fee on the fees collected; no official scale sets the rate, which is negotiated and written into a contract sent to the dental council. The check-up flags rent when it runs a third above the benchmark for practices of your size, and gives a cautious figure for what sharing might bring back.</p>
<h2>Quotes and 100% Santé</h2>
<p>Prosthetics weigh heavily in a general dentist’s production. Since 2020 for fixed work and 2021 for removable work, a dentist must offer a solution with no out-of-pocket cost, or a capped one, whenever it exists, on a written, dated and signed quote. According to ${h.src('dreesCns2025', 'DREES')}, prostheses in the 100% Santé basket made up ${p(part100, 'en', 0)} of dental prosthetic spending in ${CS.annee}. Quote acceptance rates are published nowhere: track yours in your own software, month after month.</p>
<h2>How to use this section</h2>
<p>Start with the ${'<a href="/en/">four-step check-up</a>'}: three minutes, no sign-up, and your answers stay in your browser unless you ask for a call. The report ranks your three priorities by estimated gain and links each one to the article that explains it. Every article has its own calculator to test an idea on your figures: the cost of no-shows, the hours delegation gives back, the weight of rent, the waiting time, an associate’s fee. The ${h.a('method', 'Method and sources')} page publishes every assumption and formula so that each figure can be checked.</p>
<p>Income, in the end, is what counts. DREES measured average self-employed income of ${h.eur(D.liberal_moyen)} for dentists in ${D.annee}, with a median of ${h.eur(D.quantiles.mediane)}. The levers in this section do not promise a jump of several deciles; they show where the practice’s time and money go, so you can choose where to act first.</p>`,
  },
});
