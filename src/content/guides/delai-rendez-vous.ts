import { defineGuide } from '../../lib/guide-types';
import { P } from '../../lib/engine/params';
import { delaiFile } from '../../lib/engine/organisation-agenda';
import { formatNumber } from '../../lib/format';

/* Délai du premier rendez-vous chez le chirurgien-dentiste : la mesure DREES (enquête 2016-2017, la
   seule publiée), la loi de Little appliquée à l'agenda, les leviers. Les exemples sont des calculs
   sur des valeurs choisies pour l'illustration, signalées comme telles. */
type L = 'fr' | 'en';
const R = P.delais_rdv;
const H = P.diagnostic;
const MED = R.dentiste_median_jours;
/* Exemple d'illustration (pas une statistique) : demandes, créneaux et file d'un cabinet fictif. */
const EX = { demandes: 6, creneaux: 5, file: 15 };
const ex = delaiFile(EX);
const ex2 = delaiFile({ ...EX, creneaux: EX.creneaux + 3 });
const cible = Math.ceil(ex.creneauxPourCible(MED));
const n = (x: number, l: L, d = 0) => formatNumber(x, d, l);
const J = P.defauts.omni.joursSemaine;
const demiJ = Math.ceil(cible / (J * 2));

const tableau = (l: L, h: { table: (a: string[], b: Array<Array<string | number>>, c?: string, d?: Array<'l' | 'r'>) => string }) => {
  const j = l === 'fr' ? 'jours' : 'days';
  const rows = l === 'fr'
    ? [['Délai médian', `${n(MED, l)} ${j}`], ['Délai moyen', `${n(R.dentiste_moyen_jours, l)} ${j}`], ['Un quart des demandes obtient un rendez-vous en moins de', `${n(R.dentiste_q1_jours, l)} ${j}`], ['Un quart attend plus de', `${n(R.dentiste_q3_jours, l)} ${j}`], ['Délai médian quand le patient a des symptômes', `${n(R.median_symptomes_jours, l)} ${j}`], ['Délai médian pour un autre motif', `${n(R.median_autre_motif_jours, l)} ${j}`]]
    : [['Median wait', `${n(MED, l)} ${j}`], ['Average wait', `${n(R.dentiste_moyen_jours, l)} ${j}`], ['A quarter of requests are seen within', `${n(R.dentiste_q1_jours, l)} ${j}`], ['A quarter wait longer than', `${n(R.dentiste_q3_jours, l)} ${j}`], ['Median wait with symptoms', `${n(R.median_symptomes_jours, l)} ${j}`], ['Median wait for another reason', `${n(R.median_autre_motif_jours, l)} ${j}`]];
  const cap = l === 'fr'
    ? `DREES, Études et résultats n° 1085, enquête ${R.annee_enquete} : ${R.champ}.`
    : `DREES, Études et résultats no. 1085, ${R.annee_enquete} survey: appointment requests to a dentist in the Constances cohort (adults aged 20 to 71, general scheme, mainland France).`;
  return h.table(l === 'fr' ? ['Mesure', 'Chirurgien-dentiste'] : ['Measure', 'Dentist'], rows, cap, ['l', 'r']);
};

export default defineGuide({
  id: 'delai-rendez-vous',
  group: 'organisation',
  order: 50,
  mini: 'delaiAttente',
  related: ['rendez-vous-manques', 'indicateurs-cabinet', 'organisation-cabinet', 'ca-par-fauteuil', 'deleguer-assistante'],
  sources: ['dreesDelais', 'orsPdlPanel2012', 'ameliEffectifs'],
  fr: {
    slug: 'delai-rendez-vous-dentiste',
    nav: 'Délai du premier rendez-vous',
    card: 'Combien de temps attend un nouveau patient, et comment raccourcir ce délai.',
    title: 'Délai de rendez-vous chez le dentiste 2026 : les repères',
    description: `Délai d'un premier rendez-vous chez le dentiste : ${MED} jours en médiane selon la DREES, calculer le vôtre en 2026 et réserver des créneaux aux nouveaux patients.`,
    h1: 'Le délai du premier rendez-vous : le mesurer, le comparer, le raccourcir',
    intro: 'Un nouveau patient qui attend trop longtemps va ailleurs : le délai se calcule et se pilote.',
    resume: `La DREES a mesuré le délai d'obtention d'un rendez-vous chez le chirurgien-dentiste sur ${R.champ}, lors d'une enquête menée en ${R.annee_enquete} : le délai médian est de ${n(MED, 'fr')} jours et le délai moyen de ${n(R.dentiste_moyen_jours, 'fr')} jours, tiré vers le haut par les longues attentes. Un quart des demandes obtient un rendez-vous en moins de ${n(R.dentiste_q1_jours, 'fr')} jours, un quart attend plus de ${n(R.dentiste_q3_jours, 'fr')} jours. Le motif change tout : ${n(R.median_symptomes_jours, 'fr')} jours en médiane quand le patient a des symptômes, ${n(R.median_autre_motif_jours, 'fr')} jours sinon. C'est la mesure officielle la plus récente, et elle date : aucune enquête publique n'a été refaite depuis. Dans un cabinet, le délai obéit à une règle simple, la loi de Little : il égale la file des patients en attente divisée par le nombre de nouveaux patients reçus chaque semaine. Réserver chaque jour quelques créneaux aux nouveaux patients et aux urgences, puis les rendre au planning la veille s'ils restent vides, est le levier le plus direct.`,
    faqs: [
      { q: 'Quel est le délai moyen pour obtenir un rendez-vous chez le dentiste ?', a: `D'après la DREES, ${n(R.dentiste_moyen_jours, 'fr')} jours en moyenne et ${n(MED, 'fr')} jours en médiane, sur des demandes faites en ${R.annee_enquete}. La moyenne dépasse la médiane parce qu'une minorité de patients attend très longtemps : un quart des demandes attend plus de ${n(R.dentiste_q3_jours, 'fr')} jours. Ces chiffres sont les plus récents publiés ; aucune enquête nationale ne les a actualisés depuis.` },
      { q: 'Un délai de rendez-vous long est-il le signe d’un cabinet performant ?', a: `Pas forcément. Un agenda plein prouve que la demande existe, mais un délai long fait perdre des nouveaux patients, qui appellent un autre cabinet, et retarde des soins qui s'aggravent. Ce qui compte est l'équilibre entre la file d'attente et le nombre de créneaux ouverts aux nouveaux patients chaque semaine : c'est lui qui fixe le délai, pas le taux de remplissage.` },
      { q: 'Comment calculer le délai d’attente de son propre cabinet ?', a: `Comptez les nouveaux patients qui attendent un premier rendez-vous et divisez par le nombre de premiers rendez-vous que vous donnez chaque semaine : vous obtenez le délai en semaines, multipliez par sept pour l'avoir en jours. C'est la loi de Little. Le mini-simulateur de cette page fait le calcul et indique combien de créneaux il faudrait pour revenir au délai médian.` },
      { q: 'Faut-il réserver des créneaux d’urgence dans l’agenda d’un dentiste ?', a: `Oui, chaque jour, en quantité réglée sur la demande observée. Un patient qui souffre ne peut pas attendre ${n(R.median_autre_motif_jours, 'fr')} jours, et le recevoir vite en fait souvent un patient fidèle. Les créneaux non utilisés la veille sont rendus au planning ou proposés à la liste d'attente, si bien qu'ils ne restent pas vides.` },
      { q: 'L’agenda en ligne réduit-il le délai de rendez-vous ?', a: `Il ne crée pas de créneau, donc il ne réduit pas le délai par lui-même. Il libère en revanche du temps de secrétariat, rend visibles les créneaux qui se libèrent après une annulation et permet au patient de choisir sans attendre un rappel. Couplé à des créneaux réservés aux nouveaux patients, il raccourcit le temps entre l'appel et la première séance.` },
    ],
    body: (h) => `
<h2>La seule mesure officielle : DREES, enquête ${R.annee_enquete}</h2>
<p>La ${h.src('dreesDelais', 'DREES a publié dans ses Études et résultats n° 1085')} la seule mesure nationale du délai d'obtention d'un rendez-vous chez le chirurgien-dentiste. Elle repose sur des demandes réelles de rendez-vous déclarées par les membres de la cohorte Constances, et non sur des appels test. Le champ exact : ${R.champ}. Les résultats sont les suivants.</p>
${tableau('fr', h)}
<p>Trois enseignements. D'abord, l'écart entre la médiane (${n(MED, 'fr')} jours) et la moyenne (${n(R.dentiste_moyen_jours, 'fr')} jours) montre que la plupart des patients obtiennent un rendez-vous en deux à trois semaines, mais qu'une partie attend beaucoup plus. Ensuite, le motif fait varier le délai du simple au triple : ${n(R.median_symptomes_jours, 'fr')} jours avec symptômes, ${n(R.median_autre_motif_jours, 'fr')} jours sinon, ce qui montre que les cabinets trient déjà les demandes. Enfin, l'enquête a été menée en ${R.annee_enquete} : la démographie des chirurgiens-dentistes a changé depuis, avec des départs en retraite et une répartition inégale sur le territoire, et aucune enquête publique n'a refait la mesure. Le diagnostic de Dentimètre affiche ce repère avec son année, faute de mieux.</p>
<p>Pour situer votre territoire, les ${h.src('ameliEffectifs', 'effectifs et densités de l’Assurance Maladie')} donnent le nombre de chirurgiens-dentistes par habitant dans chaque département. Une densité faible annonce une demande soutenue de nouveaux patients ; le diagnostic vous compare d'ailleurs aux confrères de votre département pour le chiffre d'affaires.</p>

<h2>La loi de Little appliquée à l'agenda</h2>
<p>En gestion des files d'attente, la loi de Little relie trois grandeurs : le nombre de personnes en attente, le débit auquel on les sert et le temps d'attente moyen. Pour un cabinet dentaire, elle s'écrit simplement : le délai moyen du premier rendez-vous, en semaines, égale le nombre de nouveaux patients en attente divisé par le nombre de premiers rendez-vous donnés chaque semaine. Le calcul suppose une demande à peu près régulière ; il donne un ordre de grandeur, pas une prévision au jour près.</p>
<p>Prenons un exemple chiffré pour l'illustration, et non une statistique : ${n(EX.demandes, 'fr')} nouveaux patients appellent chaque semaine, le cabinet leur ouvre ${n(EX.creneaux, 'fr')} créneaux et ${n(EX.file, 'fr')} attendent déjà. Le délai est de ${n(ex.delaiJours ?? 0, 'fr')} jours, et la file s'allonge de ${n(ex.variation, 'fr')} patient par semaine : sans changement, le délai ne cesse de croître. Avec ${n(EX.creneaux + 3, 'fr')} créneaux par semaine au lieu de ${n(EX.creneaux, 'fr')}, le délai tombe à ${n(ex2.delaiJours ?? 0, 'fr')} jours et la file se résorbe en ${n(ex2.semainesResorption ?? 0, 'fr', 1)} semaines. Pour revenir à la médiane de la DREES avec la file actuelle, il faudrait ${n(cible, 'fr')} créneaux par semaine.</p>
<p>La leçon tient en une phrase : le délai ne dépend pas de la taille de l'agenda, il dépend du nombre de créneaux réservés aux nouveaux patients. Un cabinet très rempli peut avoir un délai court s'il garde chaque jour quelques créneaux pour les premières consultations ; un cabinet à moitié vide peut faire attendre un mois s'il remplit ses créneaux par des séances de suivi fixées des semaines à l'avance.</p>

<h2>Les leviers pour raccourcir le délai</h2>
<ol>
<li><strong>Des créneaux réservés chaque jour.</strong> Bloquez un ou deux créneaux par demi-journée pour les nouveaux patients et les urgences. La veille, ceux qui restent libres sont rendus au planning ou proposés à la liste d'attente : ils ne coûtent rien s'ils restent pleins.</li>
<li><strong>Le tri au téléphone.</strong> La DREES montre que les symptômes accélèrent déjà le rendez-vous. Formalisez-le : douleur, gonflement, traumatisme et saignement passent dans les créneaux d'urgence ; un bilan ou un détartrage peut attendre un créneau de première consultation. L'accueil fait partie des activités de l'assistante dentaire, à qui ce tri peut être confié avec une grille écrite.</li>
<li><strong>L'agenda en ligne.</strong> Il ne crée pas de créneau, mais il montre au patient les places disponibles, y compris celles qui se libèrent après une annulation, et soulage le standard.</li>
<li><strong>Des séances plus complètes.</strong> Regrouper les actes d'un plan de traitement en séances plus longues réduit le nombre de rendez-vous de suivi qui occupent l'agenda, et libère des créneaux pour les premières consultations.</li>
<li><strong>Moins d'absences.</strong> Chaque ${h.a('rendez-vous-manques', 'rendez-vous manqué')} est un créneau qui aurait pu accueillir un nouveau patient. Le rappel la veille et la liste d'attente servent les deux objectifs.</li>
</ol>
<p>Le choix de la durée des rendez-vous joue aussi. La plupart des omnipraticiens interrogés par le ${h.src('orsPdlPanel2012', 'panel des Pays de la Loire')} travaillent avec des créneaux de base de ${H.duree_rdv_min} minutes, la durée que retient le diagnostic de Dentimètre. Une première consultation qui en prend deux réduit d'autant le débit : comptez vos créneaux de première consultation en temps, pas seulement en nombre.</p>

<h2>Construire une semaine type qui tient le délai</h2>
<p>Le calcul de la loi de Little devient un outil de pilotage dès qu'on le traduit en agenda. Reprenons l'exemple : pour revenir à la médiane de ${n(MED, 'fr')} jours avec ${n(EX.file, 'fr')} patients en attente, il faut ${n(cible, 'fr')} premiers rendez-vous par semaine. Sur ${n(J, 'fr', 1)} jours d'activité, soit ${n(J * 2, 'fr')} demi-journées, cela représente ${n(demiJ, 'fr')} créneau${demiJ > 1 ? 'x' : ''} réservé${demiJ > 1 ? 's' : ''} par demi-journée. Une fois la file résorbée, le nombre de créneaux peut redescendre au niveau de la demande hebdomadaire, ${n(EX.demandes, 'fr')} dans l'exemple : au-dessous, la file recommence à s'allonger ; au-dessus, des créneaux restent libres et doivent être rendus au planning la veille.</p>
<p>Trois règles rendent ce découpage robuste. La première : placer les créneaux réservés à des heures différentes selon les jours, en début de matinée un jour, en fin d'après-midi le lendemain, pour convenir aux patients qui travaillent. La deuxième : fixer une heure limite, par exemple la veille à midi, après laquelle un créneau réservé non attribué est proposé à la liste d'attente ou à un patient en cours de traitement ; ainsi la réserve ne crée jamais de temps mort. La troisième : distinguer les créneaux d'urgence, courts, des créneaux de première consultation, plus longs, car un bilan complet avec examen et explication du plan de traitement ne tient pas dans le même temps qu'une prise en charge de la douleur.</p>
<p>Revoyez le réglage chaque trimestre. Si le prochain créneau libre pour un nouveau patient recule de mois en mois, ajoutez un créneau réservé par semaine ; s'il reste souvent vide la veille, retirez-en un. Le nombre de premières consultations du mois et le délai relevé le premier lundi suffisent à décider. Ce pilotage ne demande aucun outil particulier : un tableau tenu par l'assistante ou l'export du logiciel de cabinet donne les deux chiffres en quelques minutes.</p>
<p>Un dernier point, souvent oublié : chaque nouveau patient reçu vite engage le cabinet sur des séances de suivi. Si le plan de traitement ne trouve pas de place dans les semaines qui suivent, le délai se déplace simplement du premier rendez-vous vers le deuxième. Ouvrir des créneaux aux nouveaux patients va donc de pair avec des séances de soins regroupées et des absences réduites.</p>

<h2>Ce que le délai coûte au cabinet</h2>
<p>Un délai long ne se voit pas dans les comptes : le patient qui renonce ne laisse aucune trace. Il se lit pourtant dans deux indicateurs. Le nombre de nouveaux patients par mois, d'abord : s'il baisse alors que les appels ne baissent pas, des patients vont ailleurs. Le ${h.a('ca-par-fauteuil', 'chiffre d’affaires par fauteuil')}, ensuite : les premières consultations débouchent sur des plans de traitement, et un cabinet qui en reçoit moins voit sa production future se réduire.</p>
<p>Le ${h.a('home', 'diagnostic du cabinet')} vous demande quand vous pouvez recevoir un nouveau patient qui appelle aujourd'hui, le compare à la médiane de la DREES et en fait une priorité si l'attente dépasse un mois. Suivez ensuite deux chiffres dans votre ${h.a('indicateurs-cabinet', 'tableau de bord mensuel')} : le délai du prochain créneau libre pour un nouveau patient, relevé le premier lundi du mois, et le nombre de premières consultations du mois.</p>
<p>Ce délai n'est qu'un des leviers de l'agenda. La rubrique ${h.a('organisation-cabinet', 'Organisation et performance du cabinet')} réunit les autres : absences, délégation à l'assistante, charges et indicateurs à suivre.</p>`,
  },
  en: {
    slug: 'dentist-appointment-wait',
    nav: 'Wait for a first appointment',
    card: 'How long a new patient waits for a dentist in France, and how to shorten it.',
    title: 'Dentist appointment wait times in France 2026: benchmarks',
    description: `How long new patients wait for a French dentist: a ${MED}-day median according to DREES, how to work out your own wait in 2026 and why reserved slots shorten it.`,
    h1: 'The wait for a first appointment: measure it, compare it, shorten it',
    intro: 'A new patient who waits too long goes elsewhere: the wait can be calculated and managed.',
    resume: `DREES, the French health ministry's statistics office, measured how long people wait for a dentist appointment using real requests from the Constances cohort, adults aged 20 to 71 in mainland France, in a survey run in ${R.annee_enquete}. The median wait was ${n(MED, 'en')} days and the average ${n(R.dentiste_moyen_jours, 'en')} days, pulled up by long waits. A quarter of requests got an appointment within ${n(R.dentiste_q1_jours, 'en')} days, while a quarter waited more than ${n(R.dentiste_q3_jours, 'en')} days. The reason for the visit changes everything: ${n(R.median_symptomes_jours, 'en')} days at the median with symptoms, ${n(R.median_autre_motif_jours, 'en')} days otherwise. It is the latest official measure, and it is dated: no public survey has repeated it since. Inside a practice the wait follows a simple rule, Little's law: it equals the queue of patients waiting divided by the number of new patients seen each week. Keeping a few slots free every day for new patients and emergencies, then releasing them the day before if unused, is the most direct lever.`,
    faqs: [
      { q: 'How long is the average wait for a dentist appointment in France?', a: `According to DREES, ${n(R.dentiste_moyen_jours, 'en')} days on average and ${n(MED, 'en')} days at the median, for requests made in ${R.annee_enquete}. The average is above the median because a minority wait a very long time: a quarter of requests waited more than ${n(R.dentiste_q3_jours, 'en')} days. These are the latest published figures; no national survey has updated them since.` },
      { q: 'Does a long wait mean a dental practice is doing well?', a: `Not necessarily. A full diary shows demand exists, but a long wait loses new patients, who call another practice, and delays care that gets worse. What matters is the balance between the queue and the number of slots open to new patients each week: that sets the wait, not how full the diary looks.` },
      { q: 'How can a dentist work out their own waiting time?', a: `Count the new patients waiting for a first appointment and divide by the number of first appointments you give each week: that is the wait in weeks, multiply by seven for days. This is Little's law. The small calculator on this page does the sum and shows how many weekly slots you would need to get back to the median wait.` },
      { q: 'Should a dentist keep emergency slots free in the diary?', a: `Yes, every day, in a number set by the demand you actually see. A patient in pain cannot wait ${n(R.median_autre_motif_jours, 'en')} days, and seeing them quickly often wins a loyal patient. Slots still free the day before go back into the diary or to the waiting list, so they do not stay empty.` },
      { q: 'Does online booking cut dental waiting times?', a: `It creates no new slot, so it does not shorten the wait on its own. It does free reception time, shows slots that open up after a cancellation and lets patients pick a time without waiting for a call back. Combined with slots reserved for new patients, it shortens the time between the first call and the first visit.` },
    ],
    body: (h) => `
<h2>The only official measure: DREES, ${R.annee_enquete} survey</h2>
<p>${h.src('dreesDelais', 'DREES published in its Études et résultats no. 1085')} the only national measure of how long it takes to get a dentist appointment in France. It rests on real appointment requests reported by members of the Constances cohort, not on mystery-shopper calls. The results are below.</p>
${tableau('en', h)}
<p>Three lessons stand out. First, the gap between the median (${n(MED, 'en')} days) and the average (${n(R.dentiste_moyen_jours, 'en')} days) shows that most patients are seen within two to three weeks, while some wait much longer. Second, the reason for the visit makes the wait vary threefold: ${n(R.median_symptomes_jours, 'en')} days with symptoms, ${n(R.median_autre_motif_jours, 'en')} days otherwise, a sign that practices already triage requests. Third, the survey dates from ${R.annee_enquete}: the dental workforce has changed since, with retirements and an uneven spread across the country, and no public survey has repeated the measure. The Dentimètre check-up shows this benchmark with its year, for want of anything newer.</p>
<p>To place your own area, ${h.src('ameliEffectifs', 'Assurance Maladie workforce data')} gives the number of dentists per head of population in each département. Low density points to strong demand from new patients; the check-up also compares your turnover with dentists in your département.</p>

<h2>Little's law applied to the diary</h2>
<p>In queueing theory, Little's law links three quantities: the number of people waiting, the rate at which they are served and the average wait. For a dental practice it reads simply: the average wait for a first appointment, in weeks, equals the number of new patients waiting divided by the number of first appointments given each week. It assumes fairly steady demand and gives an order of magnitude, not a forecast to the day.</p>
<p>Take a worked example, chosen for illustration and not a statistic: ${n(EX.demandes, 'en')} new patients call each week, the practice opens ${n(EX.creneaux, 'en')} slots for them and ${n(EX.file, 'en')} are already waiting. The wait is ${n(ex.delaiJours ?? 0, 'en')} days, and the queue grows by ${n(ex.variation, 'en')} patient a week: with no change the wait keeps rising. With ${n(EX.creneaux + 3, 'en')} slots a week instead of ${n(EX.creneaux, 'en')}, the wait drops to ${n(ex2.delaiJours ?? 0, 'en')} days and the queue clears in ${n(ex2.semainesResorption ?? 0, 'en', 1)} weeks. To get back to the DREES median with today's queue, the practice would need ${n(cible, 'en')} slots a week.</p>
<p>The lesson fits in one sentence: the wait depends not on the size of the diary but on the number of slots kept for new patients. A very busy practice can offer a short wait if it holds a few first-visit slots every day; a half-empty one can make people wait a month if it fills its slots with follow-ups booked weeks ahead.</p>

<h2>Levers to shorten the wait</h2>
<ol>
<li><strong>Slots reserved every day.</strong> Block one or two slots per half-day for new patients and emergencies. The day before, those still free go back into the diary or to the waiting list, so they cost nothing.</li>
<li><strong>Triage on the phone.</strong> DREES shows symptoms already speed up appointments. Make it formal: pain, swelling, injury and bleeding go into emergency slots; a check-up or scale and polish can wait for a first-visit slot. Reception is one of the duties French law gives the dental nurse, who can handle this triage with a written grid.</li>
<li><strong>Online booking.</strong> It creates no slot, but it shows patients what is free, including slots released after a cancellation, and takes pressure off the phone.</li>
<li><strong>Fuller sessions.</strong> Grouping the steps of a treatment plan into longer sessions cuts the number of follow-up visits filling the diary and frees slots for first appointments.</li>
<li><strong>Fewer no-shows.</strong> Each ${h.a('rendez-vous-manques', 'missed appointment')} is a slot that could have taken a new patient. Reminders the day before and a waiting list serve both aims.</li>
</ol>
<p>Appointment length matters too. Most general dentists surveyed by the ${h.src('orsPdlPanel2012', 'Pays de la Loire panel')} work with ${H.duree_rdv_min}-minute base slots, the length the Dentimètre check-up uses. A first visit that takes two slots halves the throughput: count first-visit capacity in time, not just in appointments.</p>

<h2>Building a typical week that holds the wait</h2>
<p>Little's law becomes a management tool once it is turned into a diary. Back to the example: to return to the ${n(MED, 'en')}-day median with ${n(EX.file, 'en')} patients waiting, the practice needs ${n(cible, 'en')} first appointments a week. Over ${n(J, 'en', 1)} working days, that is ${n(J * 2, 'en')} half-days, it comes to ${n(demiJ, 'en')} reserved slot${demiJ > 1 ? 's' : ''} per half-day. Once the queue has cleared, the number of slots can come back down to weekly demand, ${n(EX.demandes, 'en')} in the example: below that the queue starts growing again; above it some slots stay free and must be released the day before.</p>
<p>Three rules make this split robust. First, put the reserved slots at different times on different days, early morning one day and late afternoon the next, to suit patients who work. Second, set a cut-off, say noon the day before, after which an unassigned reserved slot goes to the waiting list or to a patient already in treatment, so the reserve never creates dead time. Third, keep emergency slots, which are short, apart from first-visit slots, which are longer: a full assessment with an examination and an explanation of the treatment plan does not fit in the time needed to deal with pain.</p>
<p>Review the setting every quarter. If the next free slot for a new patient slips further back month after month, add one reserved slot a week; if one is often still empty the day before, remove it. The number of first visits in the month and the wait checked on the first Monday are enough to decide. This needs no special tool: a sheet kept by the dental nurse or an export from the practice software gives both figures in a few minutes.</p>
<p>One last point, often overlooked: every new patient seen quickly commits the practice to follow-up sessions. If the treatment plan finds no room in the following weeks, the wait simply moves from the first appointment to the second. Opening slots to new patients therefore goes hand in hand with grouped treatment sessions and fewer no-shows, the two levers that free the most chair time without adding hours to the week.</p>
<p>Finally, the wait is also a message to patients. A practice that can say “we will see you this week” when someone calls in pain, and “within a fortnight” for a check-up, earns trust that shows later in accepted treatment plans. The benchmark from DREES gives a sense of what patients have come to expect; your own diary decides whether you meet it.</p>

<h2>What a long wait costs the practice</h2>
<p>A long wait never shows in the accounts: a patient who gives up leaves no trace. It does show in two indicators. The number of new patients each month, first: if it falls while calls do not, people are going elsewhere. ${h.a('ca-par-fauteuil', 'Turnover per chair')}, second: first visits lead to treatment plans, so a practice that sees fewer of them shrinks its future work.</p>
<p>The ${h.a('home', 'practice check-up')} asks when you could see a new patient who calls today, compares the answer with the DREES median and makes it a priority if the wait passes a month. Then track two figures in your ${h.a('indicateurs-cabinet', 'monthly dashboard')}: the next free slot for a new patient, checked on the first Monday of the month, and the number of first visits in the month.</p>
<p>The wait is one lever among several. The ${h.a('organisation-cabinet', 'Organisation and performance')} section brings the others together: no-shows, delegation to the dental nurse, costs and the indicators worth tracking.</p>`,
  },
});
