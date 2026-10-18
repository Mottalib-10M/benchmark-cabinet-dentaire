import { defineGuide } from '../../lib/guide-types';
import { P } from '../../lib/engine/params';
import { reference, UNASA_YEAR } from '../../lib/engine/references';
import { FR, DATA_YEAR } from '../../lib/engine/data';
import { CADRE_ASSISTANT as K, coutAssistantAnnuel, caHoraireRepere, tempsDelegue } from '../../lib/engine/organisation-equipe';
import { brutMinimal } from '../../lib/engine/employeur';
import { formatMoney, formatNumber, formatPercent } from '../../lib/format';

/* Déléguer à l'assistant dentaire : ce que disent les textes en 2026, et ce que vaut le temps rendu. */
type L = 'fr' | 'en';
const S = P.salaires_2026;
const G = reference('omni');
const tauxAD = Math.max(S.horaire.assistant_dentaire, S.smic_horaire);
const brutAD = brutMinimal('assistant_dentaire');
const coutPlein = coutAssistantAnnuel(1), coutMi = coutAssistantAnnuel(0.5);
const refH = caHoraireRepere() ?? 0;
const TT = P.temps_travail;
const D0 = P.defauts.omni;
const H = P.diagnostic;
// Exemple : deux tâches de quinze minutes par jour reprises par l'assistant.
const ex = tempsDelegue({ taches: 2, minutes: 15, jours: D0.joursSemaine, semaines: D0.semaines, caHoraire: refH });
const personnelEur = G.personnel * G.recettes;
const etpUnasa = personnelEur / coutPlein;

const e = (x: number, l: L, d = 0) => formatMoney(x, d, l);
const p = (x: number, l: L, d = 1) => formatPercent(x, d, l);
const n = (x: number, l: L, d = 0) => formatNumber(x, d, l);

const ACT: Record<L, string[]> = {
  fr: [
    'l’assistance du chirurgien-dentiste avant, pendant et après les soins ;',
    'l’accueil des patients ;',
    'l’information et l’éducation des patients ;',
    'l’entretien de l’environnement de soins et des matériels, et la gestion du risque infectieux ;',
    'la gestion et le suivi du dossier du patient ;',
    'le recueil et la transmission des informations, et la traçabilité ;',
    'l’accueil et l’accompagnement des assistants dentaires en formation.',
  ],
  en: [
    'assisting the dentist before, during and after treatment;',
    'greeting and receiving patients;',
    'informing patients and teaching them oral care;',
    'keeping the treatment area and equipment clean and managing infection risk;',
    'managing and following up patient records;',
    'collecting and passing on information, and traceability;',
    'welcoming and supervising dental assistants in training.',
  ],
};

const tableActes = (l: L, h: { table: (a: string[], b: Array<Array<string | number>>, c?: string, d?: Array<'l' | 'r'>) => string }) => {
  const th = l === 'fr' ? ['Tâche', 'Assistant dentaire en 2026', 'Texte'] : ['Task', 'Dental assistant in 2026', 'Text'];
  const rows = l === 'fr'
    ? [
        ['Aide opératoire au fauteuil', 'Oui, seul autorisé à le faire', 'R4393-8 ; convention collective, annexe I'],
        ['Stérilisation, hygiène de la salle', 'Oui', 'R4393-8, 4°'],
        ['Accueil, prise de rendez-vous', 'Oui', 'R4393-8, 2°'],
        ['Conseils d’hygiène bucco-dentaire', 'Oui, sous le contrôle du praticien', 'L4393-8 ; R4393-8, 3°'],
        ['Dossier patient, traçabilité', 'Oui', 'R4393-8, 5° et 6°'],
        ['Radiographies, prophylaxie, actes orthodontiques', 'Non, pas encore : décret attendu', 'L4393-8 (loi de 2023), sans texte d’application'],
        ['Diagnostic, soins, prescription', 'Non', 'Actes du chirurgien-dentiste'],
      ]
    : [
        ['Chairside assistance', 'Yes, and only an assistant may', 'R4393-8; collective agreement, annex I'],
        ['Sterilisation, surgery hygiene', 'Yes', 'R4393-8, 4°'],
        ['Reception, booking', 'Yes', 'R4393-8, 2°'],
        ['Oral hygiene advice', 'Yes, under the dentist’s control', 'L4393-8; R4393-8, 3°'],
        ['Patient records, traceability', 'Yes', 'R4393-8, 5° and 6°'],
        ['X-rays, preventive and orthodontic procedures', 'Not yet: decree still awaited', 'L4393-8 (2023 law), no implementing text'],
        ['Diagnosis, treatment, prescribing', 'No', 'Reserved to the dentist'],
      ];
  const cap = l === 'fr'
    ? 'Ce que l’assistant dentaire peut faire au cabinet, d’après le Code de la santé publique en vigueur au 18 octobre 2026.'
    : 'What a dental assistant may do in a French practice under the Public Health Code in force on 18 October 2026.';
  return h.table(th, rows, cap, ['l', 'l', 'l']);
};

export default defineGuide({
  id: 'deleguer-assistante',
  group: 'organisation',
  order: 30,
  mini: 'tempsDelegue',
  related: ['salaire-assistante-dentaire', 'taux-de-charges', 'organisation-cabinet', 'indicateurs-cabinet', 'ca-par-fauteuil'],
  sources: ['cspL4393_8', 'cspR4393_8', 'arreteFormationAD', 'loiRist2023', 'qeAn8893', 'pplAssistantSenat', 'ccn1619Classification', 'ccn1619Salaires'],
  fr: {
    slug: 'deleguer-assistante-dentaire',
    nav: 'Déléguer à l’assistante',
    card: 'Ce que l’assistant dentaire peut faire en 2026 et ce que vaut le temps rendu au fauteuil.',
    title: 'Déléguer à l’assistante dentaire en 2026 : ce que dit la loi',
    description: `Déléguer à l'assistante dentaire en 2026 : les 7 activités du Code de la santé publique, les radios encore en attente de décret et le temps rendu au fauteuil.`,
    h1: 'Déléguer à l’assistante dentaire : ce qui est permis, ce que cela rapporte',
    intro: 'Les tâches que la loi confie à l’assistant dentaire, celles qui attendent encore un décret, et le calcul du temps rendu.',
    resume: `Depuis la loi du 26 janvier 2016, l'assistant dentaire exerce une profession de santé réglementée : il assiste le chirurgien-dentiste « sous sa responsabilité et son contrôle effectif » (article L4393-8 du Code de la santé publique) et l'article R4393-8 liste ${n(K.activitesR4393_8, 'fr')} activités, de l'aide au fauteuil à la stérilisation, à l'accueil et au dossier du patient. La loi du 19 mai 2023 a ouvert la voie à un assistant formé en plus pour les radiographies et la prophylaxie, mais aucun décret ne l'a encore mis en œuvre : en juillet 2026, le ministère indiquait un projet en cours de finalisation. Au minimum de la convention collective 2026, ${e(tauxAD, 'fr', 2)} de l'heure, un temps plein coûte ${e(coutPlein, 'fr')} par an au cabinet, un mi-temps ${e(coutMi, 'fr')}. Deux tâches de quinze minutes par jour reprises par l'assistant rendent environ ${n(ex.heuresAn, 'fr')} heures de fauteuil par an au praticien.`,
    faqs: [
      { q: 'Une assistante dentaire peut-elle faire des radios en 2026 ?', a: `Pas encore. La loi du 19 mai 2023 permet à un assistant titulaire d'une formation complémentaire de contribuer aux actes d'imagerie, mais ni le décret ni l'arrêté de formation ne sont parus. En juillet 2026, le ministère répondait à l'Assemblée nationale que le projet de décret était « en cours de finalisation ». Jusque-là, la radiographie reste un acte du praticien.` },
      { q: 'Quelles tâches un dentiste peut-il confier à son assistante ?', a: `Les ${n(K.activitesR4393_8, 'fr')} activités de l'article R4393-8 : assistance pendant les soins, accueil, information et éducation des patients, entretien de la salle et gestion du risque infectieux, dossier du patient, traçabilité, accueil des assistants en formation. Toujours sous la responsabilité et le contrôle effectif du praticien, qui reste seul à poser le diagnostic et à réaliser les soins.` },
      { q: 'Faut-il un diplôme pour travailler comme assistante dentaire ?', a: `Oui. Depuis 2016, l'exercice est réservé aux titulaires du titre de formation d'assistant dentaire, ou aux étudiants en chirurgie dentaire autorisés individuellement, et l'enregistrement est obligatoire avant de commencer. La formation dure ${n(K.formationMois, 'fr')} mois, dont ${n(K.formationTheorieH, 'fr')} heures de théorie, souvent en contrat de professionnalisation ou en apprentissage au cabinet.` },
      { q: 'L’assistant dentaire de niveau 2 existe-t-il déjà ?', a: `Non. L'expression ne figure dans aucun texte en vigueur. La loi de 2023 parle d'un « titre de formation complémentaire » sans texte d'application, et le Sénat a adopté en novembre 2025 une proposition de loi créant une profession d'assistant en santé bucco-dentaire, qui n'était pas inscrite à l'ordre du jour de l'Assemblée nationale en juin 2026. La grille de salaires 2026 n'a pas de catégorie propre.` },
      { q: 'Combien d’heures de fauteuil gagne-t-on en déléguant la stérilisation ?', a: `Cela dépend du temps que vous y passez vraiment. À quinze minutes par jour, sur ${n(D0.joursSemaine, 'fr', 1)} jours par semaine et ${n(D0.semaines, 'fr')} semaines, une tâche représente ${n(ex.heuresAn / 2, 'fr')} heures par an. Le mini-simulateur fait le calcul avec vos durées et compare la production possible au coût d'un mi-temps au minimum conventionnel.` },
      { q: 'Une assistante dentaire doit-elle suivre une formation en stérilisation ?', a: `Oui. La convention collective des cabinets dentaires impose à tout assistant et aide dentaire une formation continue en stérilisation, à renouveler tous les ${n(K.sterilisationTousLesAns, 'fr')} ans, d'une durée de ${n(K.sterilisationHeures, 'fr')} heures. La gestion du risque infectieux fait partie des activités de l'assistant listées par le Code de la santé publique.` },
    ],
    body: (h) => `
<h2>Une profession réglementée depuis 2016</h2>
<p>Avant 2016, l'assistante dentaire était une salariée qualifiée par la convention collective, sans statut dans le Code de la santé publique. L'article 120 de la loi du 26 janvier 2016 en a fait une profession de santé à part entière, inscrite à l'${h.src('cspL4393_8', 'article L4393-8')} : l'assistant dentaire assiste le chirurgien-dentiste, ou le médecin qui exerce dans le champ de la chirurgie dentaire, « sous sa responsabilité et son contrôle effectif ». Il contribue aux activités de prévention et d'éducation pour la santé bucco-dentaire, et il est tenu au secret professionnel.</p>
<p>Deux conséquences pratiques pour le cabinet. D'abord, seul un titulaire du titre de formation peut exercer, et il doit être enregistré avant de commencer. Ensuite, la délégation ne transfère pas la responsabilité : le praticien répond de ce que fait son assistant, et il doit pouvoir le contrôler, ce qui suppose d'être présent au cabinet pendant les soins.</p>
<h2>Les sept activités de l'article R4393-8</h2>
<p>Le ${h.src('cspR4393_8', 'décret du 1er décembre 2016')} précise le contenu du métier. L'article R4393-8 confie à l'assistant dentaire, dans le respect des règles d'hygiène et de sécurité :</p>
<ul>${ACT.fr.map((x) => `<li>${x}</li>`).join('')}</ul>
<p>La ${h.src('ccn1619Classification', 'classification de la convention collective')} ajoute une précision qui compte pour l'organisation : l'assistant dentaire est « seul autorisé à seconder le chirurgien-dentiste dans l'aide opératoire au fauteuil ». Une aide dentaire ou une secrétaire peuvent prendre l'accueil, une partie de la stérilisation ou la facturation, pas le travail à quatre mains.</p>
${tableActes('fr', h)}
<h2>Radios et prophylaxie : la loi existe, le décret manque</h2>
<p>La ${h.src('loiRist2023', 'loi du 19 mai 2023')} a modifié l'article L4393-8 : un assistant titulaire d'un titre de formation complémentaire pourra contribuer aux actes d'imagerie à visée diagnostique, aux actes prophylactiques, aux actes orthodontiques et aux soins post-chirurgicaux. Son article 6 a créé l'article L4393-18, qui limite le nombre d'assistants contribuant à l'imagerie sur un site au nombre de praticiens effectivement présents.</p>
<p>Rien de cela ne s'applique encore. Le décret qui doit lister les actes et l'arrêté qui doit créer la formation complémentaire n'ont pas été publiés. Dans sa ${h.src('qeAn8893', 'réponse à la question écrite n° 8893')}, publiée le 7 juillet 2026, le ministère indique qu'un projet de décret est « en cours de finalisation », bloqué parce que la loi ne permet pas d'inscrire cette formation au répertoire national des certifications au niveau visé. Le correctif passe par la ${h.src('pplAssistantSenat', 'proposition de loi adoptée par le Sénat le 6 novembre 2025')}, qui crée une profession d'assistant en santé bucco-dentaire ; elle n'avait pas encore été inscrite à l'ordre du jour de l'Assemblée nationale en juin 2026. Les listes d'actes du type « polissage, fluor, scellement de sillons » qui circulent ne viennent d'aucun texte publié. En 2026, un cabinet qui confie des radiographies à son assistant sort du cadre légal.</p>
<h2>Ce que coûte un assistant en 2026</h2>
<p>L'${h.src('ccn1619Salaires', 'accord de salaires du 12 février 2026')}, étendu en juillet et applicable au 1er janvier 2026, fixe le minimum de l'assistant dentaire à ${h.eur(tauxAD, 2)} brut de l'heure, soit ${h.eur(brutAD)} par mois pour ${h.num(S.heures_mois, 2)} heures. Cotisations patronales et réduction générale comprises, le cabinet débourse au moins ${h.eur(coutPlein)} par an pour un temps plein et ${h.eur(coutMi)} pour un mi-temps. La page sur la ${h.a('salaire-assistante-dentaire', 'rémunération d’une assistante dentaire')} détaille le calcul et les autres emplois de la grille.</p>
<p>Dans les comptes ${UNASA_YEAR} de l'UNASA, le personnel pèse ${h.pct(G.personnel)} des recettes d'un cabinet moyen, soit ${h.eur(personnelEur)} : de quoi payer environ ${h.num(etpUnasa, 1)} temps plein au minimum conventionnel. C'est un ordre de grandeur, car les salaires réels dépassent souvent la grille et la moyenne mélange des cabinets sans salarié et des cabinets à plusieurs assistants. La page sur le ${h.a('taux-de-charges', 'taux de charges')} montre comment ce poste varie avec la taille du cabinet.</p>
<h2>Ce que rapporte le temps rendu</h2>
<p>Déléguer n'a d'intérêt que si le temps libéré revient au fauteuil. Le calcul tient en une ligne : tâches reprises × minutes par jour × jours travaillés × semaines. Deux tâches de quinze minutes par jour, sur ${h.num(D0.joursSemaine, 1)} jours et ${h.num(D0.semaines)} semaines, font ${h.num(ex.heuresAn)} heures par an.</p>
<p>Pour donner une valeur à ces heures, le site prend un chiffre d'affaires horaire de repère : la moyenne ${DATA_YEAR} des honoraires d'un omnipraticien (${h.eur(FR.p.omni!.tot!)}, Assurance Maladie) divisée par ${h.num(TT.heures_an)} heures de travail par an, tirées de l'enquête ${TT.annee_enquete} de l'ORS des Pays de la Loire, la seule publiée sur le sujet. Cela donne ${h.eur(refH)} de l'heure, un chiffre prudent puisque ce temps de travail comprend la gestion et pas seulement le fauteuil. Dentimètre suppose ensuite qu'une heure libérée sur deux (${h.pct(H.part_convertie_temps, 0)}) redevient de la production : c'est une hypothèse, publiée sur la page Méthode, pas une statistique. Avec ces chiffres, les ${h.num(ex.heuresAn)} heures valent ${h.eur(ex.production)} par an, à comparer aux ${h.eur(coutMi)} d'un mi-temps. Saisissez vos propres durées dans le mini-simulateur en haut de page : c'est votre agenda qui dit si l'écart est positif.</p>
<h2>Par où commencer</h2>
<ul>
<li><strong>Chronométrer une semaine</strong> : noter, chaque jour, le temps passé à préparer la salle, stériliser, répondre au téléphone, encaisser, ranger les dossiers. On sous-estime presque toujours ces minutes.</li>
<li><strong>Classer les tâches</strong> selon le tableau ci-dessus : ce qui relève de l'assistant, ce qu'une aide dentaire ou une secrétaire peut prendre, ce qui reste au praticien.</li>
<li><strong>Former sur une tâche à la fois</strong> : la formation continue de la branche couvre la stérilisation, obligatoire tous les ${h.num(K.sterilisationTousLesAns)} ans pour ${h.num(K.sterilisationHeures)} heures, et l'accueil des patients.</li>
<li><strong>Former un assistant au cabinet</strong> : la formation dure ${h.num(K.formationMois)} mois, ${h.num(K.formationTheorieH)} heures de théorie et ${h.num(K.formationPratiqueH)} heures de pratique (${h.src('arreteFormationAD', 'arrêté du 8 juin 2018')}), en contrat de professionnalisation ou en apprentissage, avec des minima de salaire plus bas pendant le contrat.</li>
<li><strong>Remplir les heures libérées</strong> : sans patients pour les occuper, elles ne rapportent rien. Le ${h.a('home', 'diagnostic du cabinet')} met la délégation en regard de votre délai de rendez-vous et de vos créneaux vides.</li>
</ul>
<h2>Les limites du calcul</h2>
<p>Le temps rendu n'est pas toujours facturable. Un praticien dont l'agenda est déjà plein gagne en confort ou en heures de vie, pas en chiffre d'affaires ; à l'inverse, un cabinet qui refuse des patients transforme chaque heure libérée en soins. Le coût retenu est un plancher : il ne compte ni la prévoyance et la mutuelle de branche, ni les primes, ni un salaire au-dessus de la grille. Enfin, déléguer suppose d'encadrer : le contrôle effectif que demande la loi prend lui aussi du temps, surtout les premiers mois. Pour suivre l'effet dans la durée, notez chaque mois vos heures au fauteuil et votre chiffre d'affaires horaire, deux des ${h.a('indicateurs-cabinet', 'indicateurs du tableau de bord')} du cabinet, et replacez la délégation parmi les autres leviers de la rubrique ${h.a('organisation-cabinet', 'organisation et performance')}.</p>`,
  },
  en: {
    slug: 'dental-assistant-delegation',
    nav: 'Delegating to your assistant',
    card: 'What a dental assistant may do in France in 2026, and what the freed chair time is worth.',
    title: 'Dental assistant delegation in France 2026: the legal limits',
    description: 'Delegating to a dental assistant in France in 2026: the 7 duties in the Public Health Code, X-rays still awaiting a decree, and the chair time you get back.',
    h1: 'Delegating to your dental assistant: what the law allows, what it pays',
    intro: 'The duties French law gives a dental assistant, the ones still waiting for a decree, and how to price the time you get back.',
    resume: `Since the law of 26 January 2016, the dental assistant (assistant dentaire) has been a regulated health profession in France: they assist the dentist “under their responsibility and effective control” (article L4393-8 of the Public Health Code), and article R4393-8 lists ${n(K.activitesR4393_8, 'en')} duties, from chairside assistance to sterilisation, reception and patient records. A law of 19 May 2023 opened the way for an assistant with extra training to take X-rays and preventive care, but no decree has brought it into force: in July 2026 the ministry said a draft was still being finalised. At the 2026 collective agreement minimum of ${e(tauxAD, 'en', 2)} an hour, a full-timer costs the practice ${e(coutPlein, 'en')} a year and a half-timer ${e(coutMi, 'en')}. Two fifteen-minute daily tasks handed over give the dentist back about ${n(ex.heuresAn, 'en')} chair hours a year.`,
    faqs: [
      { q: 'Can a dental assistant take X-rays in France in 2026?', a: `Not yet. The law of 19 May 2023 lets an assistant with a complementary qualification contribute to diagnostic imaging, but neither the decree listing the procedures nor the training order has been published. In July 2026 the ministry told the National Assembly the draft decree was “being finalised”. Until then, radiographs remain the dentist’s own work.` },
      { q: 'Which tasks can a French dentist hand to the dental assistant?', a: `The ${n(K.activitesR4393_8, 'en')} duties in article R4393-8: chairside assistance, reception, patient information and oral health teaching, cleaning and infection control, patient records, traceability, and supervising trainees. Always under the dentist’s responsibility and effective control; diagnosis and treatment stay with the dentist alone.` },
      { q: 'Does a dental assistant in France need a qualification?', a: `Yes. Since 2016 the work is reserved to holders of the dental assistant training title, or to dental students given individual permission, and registration is required before starting. The course lasts ${n(K.formationMois, 'en')} months with ${n(K.formationTheorieH, 'en')} hours of theory, usually on a work-study contract inside a practice.` },
      { q: 'Is there already a “level 2” dental assistant in France?', a: `No. The term appears in no text in force. The 2023 law speaks of a “complementary training title” that has no implementing rules, and in November 2025 the Senate passed a bill creating an oral health assistant profession, which was still not on the National Assembly’s agenda in June 2026. The 2026 pay scale has no separate grade for it.` },
      { q: 'How many chair hours does delegating sterilisation free up?', a: `It depends on the time you actually spend on it. At fifteen minutes a day, over ${n(D0.joursSemaine, 'en', 1)} days a week and ${n(D0.semaines, 'en')} weeks, one task comes to ${n(ex.heuresAn / 2, 'en')} hours a year. The small calculator runs the sum with your own timings and sets the possible output against a half-timer at the pay-scale minimum.` },
      { q: 'Must French dental assistants take sterilisation training?', a: `Yes. The dental practices collective agreement requires every dental assistant and dental aide to take continuing training in sterilisation, renewed every ${n(K.sterilisationTousLesAns, 'en')} years and lasting ${n(K.sterilisationHeures, 'en')} hours. Infection control is also one of the assistant’s duties listed in the Public Health Code.` },
    ],
    body: (h) => `
<h2>A regulated profession since 2016</h2>
<p>Before 2016 the French dental assistant was a skilled employee defined by the collective agreement, with no standing in the Public Health Code. Article 120 of the law of 26 January 2016 made it a health profession in its own right, written into ${h.src('cspL4393_8', 'article L4393-8')}: the assistant supports the dentist, or a doctor working in dental surgery, “under their responsibility and effective control”. They take part in oral health prevention and education, and they are bound by professional secrecy.</p>
<p>Two practical consequences follow. Only holders of the training title may do the job, and they must be registered before starting. And delegation does not move responsibility: the dentist answers for what the assistant does and must be able to supervise it, which means being on the premises while patients are treated.</p>
<h2>The seven duties in article R4393-8</h2>
<p>The ${h.src('cspR4393_8', 'decree of 1 December 2016')} spells out the job. Article R4393-8 gives the dental assistant, within hygiene and safety rules:</p>
<ul>${ACT.en.map((x) => `<li>${x}</li>`).join('')}</ul>
<p>The ${h.src('ccn1619Classification', 'collective agreement’s job classification')} adds a point that shapes how a surgery runs: the dental assistant is “alone authorised to assist the dentist chairside”. A dental aide or a receptionist can take the front desk, part of sterilisation or the billing, but not four-handed dentistry.</p>
${tableActes('en', h)}
<h2>X-rays and preventive care: the law exists, the decree does not</h2>
<p>The ${h.src('loiRist2023', 'law of 19 May 2023')} amended article L4393-8 so that an assistant holding a complementary training title may contribute to diagnostic imaging, preventive procedures, orthodontic procedures and post-surgical care. Its article 6 created article L4393-18, which caps the number of assistants doing imaging on a site at the number of dentists actually present.</p>
<p>None of it applies yet. The decree meant to list the procedures and the order meant to create the extra training have not been published. In its ${h.src('qeAn8893', 'answer to written question no. 8893')}, published on 7 July 2026, the ministry said a draft decree was “being finalised” but stuck, because the law does not allow the training to be registered at the qualification level intended. The fix is a ${h.src('pplAssistantSenat', 'bill passed by the Senate on 6 November 2025')} creating an oral health assistant profession; it was still not on the National Assembly’s agenda in June 2026. Lists of tasks such as polishing, fluoride or fissure sealing that circulate online come from no published text. In 2026 a practice that lets its assistant take radiographs is outside the law.</p>
<h2>What an assistant costs in 2026</h2>
<p>The ${h.src('ccn1619Salaires', 'pay agreement of 12 February 2026')}, extended in July and applying from 1 January 2026, sets the dental assistant minimum at ${h.eur(tauxAD, 2)} gross an hour, or ${h.eur(brutAD)} a month for ${h.num(S.heures_mois, 2)} hours. With employer contributions and the general relief on low wages, the practice pays at least ${h.eur(coutPlein)} a year for a full-timer and ${h.eur(coutMi)} for a half-timer. Our page on ${h.a('salaire-assistante-dentaire', 'dental nurse pay')} sets out the calculation and the other grades.</p>
<p>In the ${UNASA_YEAR} UNASA accounts staff takes ${h.pct(G.personnel)} of an average practice’s receipts, or ${h.eur(personnelEur)}: enough for about ${h.num(etpUnasa, 1)} full-timers at the pay-scale minimum. Treat it as a rough guide, since real wages often sit above the scale and the average blends practices with no employee and practices with several. The page on the ${h.a('taux-de-charges', 'cost ratio')} shows how this line changes with practice size.</p>
<h2>What the freed time is worth</h2>
<p>Delegation only pays if the time goes back to the chair. The sum is one line: tasks handed over × minutes a day × days worked × weeks. Two fifteen-minute tasks a day, over ${h.num(D0.joursSemaine, 1)} days and ${h.num(D0.semaines)} weeks, make ${h.num(ex.heuresAn)} hours a year.</p>
<p>To put a value on those hours the site uses a benchmark hourly turnover: the ${DATA_YEAR} average fees of a general dentist (${h.eur(FR.p.omni!.tot!)}, Assurance Maladie) divided by ${h.num(TT.heures_an)} working hours a year, taken from the ${TT.annee_enquete} survey by the ORS of Pays de la Loire, the only published one. That gives ${h.eur(refH)} an hour, a cautious figure because the working time includes admin as well as chairside work. Dentimètre then assumes that one freed hour in two (${h.pct(H.part_convertie_temps, 0)}) becomes treatment time again: an assumption, published on the Method page, not a statistic. On those figures the ${h.num(ex.heuresAn)} hours are worth ${h.eur(ex.production)} a year, against ${h.eur(coutMi)} for a half-timer. Enter your own timings in the calculator at the top of the page: your diary decides whether the gap is positive.</p>
<h2>Where to start</h2>
<ul>
<li><strong>Time one week</strong>: note each day the minutes spent setting up, sterilising, answering the phone, taking payment, filing records. Almost everyone underestimates them.</li>
<li><strong>Sort the tasks</strong> using the table above: what belongs to the assistant, what a dental aide or receptionist can take, what stays with you.</li>
<li><strong>Train one task at a time</strong>: the sector’s continuing training covers sterilisation, compulsory every ${h.num(K.sterilisationTousLesAns)} years for ${h.num(K.sterilisationHeures)} hours, and patient reception.</li>
<li><strong>Train an assistant in-house</strong>: the course lasts ${h.num(K.formationMois)} months, ${h.num(K.formationTheorieH)} hours of theory and ${h.num(K.formationPratiqueH)} hours of practice (${h.src('arreteFormationAD', 'order of 8 June 2018')}), on a work-study contract with lower pay minima while it runs.</li>
<li><strong>Fill the hours you free</strong>: without patients to use them they bring in nothing. The ${h.a('home', 'practice check-up')} weighs delegation against your appointment wait and your empty slots.</li>
</ul>
<h2>Who does what in a two-chair practice</h2>
<p>Take a dentist working four days a week with one full-time assistant. The assistant prepares the trays and the room between patients, assists chairside during longer treatments, runs the sterilisation cycle, keeps the traceability log and updates the record after each visit. Reception, phone booking and payment can go to the same person between patients or, in a busier practice, to a receptionist paid on a lower grade. What stays with the dentist is the clinical decision, the treatment itself, the explanation of a quote and, for now, every radiograph. Drawing this split on paper, task by task, is often enough to show where the dentist’s own minutes go.</p>
<h2>Where the sum stops</h2>
<p>Freed time is not always billable. A dentist whose diary is already full gains comfort or free evenings, not turnover; a practice turning patients away turns every freed hour into treatment. The cost used is a floor: it leaves out the sector’s insurance and health cover, bonuses and any pay above the scale. And delegating means supervising: the effective control the law requires takes time too, above all in the first months. To track the effect, note your chair hours and hourly turnover each month, two of the ${h.a('indicateurs-cabinet', 'practice dashboard indicators')}, and set delegation beside the other levers in the ${h.a('organisation-cabinet', 'organisation and performance')} section.</p>`,
  },
});
