import { defineGuide } from '../../lib/guide-types';
import { P } from '../../lib/engine/params';
import { formatMoney, formatNumber, formatPercent } from '../../lib/format';

/* Devis de prothèse et 100 % Santé dentaire : règles de la convention de 2023, chiffres DREES et Cour des comptes. */
type L = 'fr' | 'en';
const C = P.cent_pour_cent_sante;
const CC = C.cour_comptes_2021;
const part100 = C.protheses_100s_meur / C.protheses_total_meur;
const partProtheses = C.protheses_total_meur / C.honoraires_dentaires_meur;
const mdsFr = (meur: number) => `${formatNumber(meur / 1000, 1, 'fr')} milliards d’euros`;
const mdsEn = (meur: number) => `€${formatNumber(meur / 1000, 1, 'en')} billion`;
const p = (x: number, l: L, d = 0) => formatPercent(x, d, l);
const e = (x: number, l: L) => formatMoney(x, 0, l);

const paniers = (l: L, h: { table: (a: string[], b: Array<Array<string | number>>, c?: string, d?: Array<'l' | 'r'>) => string }) => {
  const fr = l === 'fr';
  const th = fr ? ['Panier', 'Prix pour le patient', 'Ce que fixe la convention', 'Part des actes en 2021'] : ['Basket', 'Price for the patient', 'What the agreement sets', 'Share of procedures, 2021'];
  const rows = fr
    ? [
      ['100 % Santé (RAC 0)', 'Aucun reste à charge avec une complémentaire responsable', 'Honoraires limites de facturation, pris en charge en totalité', p(CC.rac0_actes, l)],
      ['Reste à charge maîtrisé (RAC M)', 'Reste à charge possible, plafonné', 'Honoraires limites de facturation', p(CC.modere_actes, l)],
      ['Tarif libre', 'Reste à charge selon le contrat de complémentaire', 'Honoraires fixés librement par le praticien', p(CC.libre_actes, l)],
    ]
    : [
      ['100% Santé (RAC 0)', 'Nothing left to pay with a standard top-up policy', 'Fee ceilings, covered in full', p(CC.rac0_actes, l)],
      ['Controlled out-of-pocket (RAC M)', 'Some out-of-pocket cost, capped', 'Fee ceilings', p(CC.modere_actes, l)],
      ['Free pricing', 'Out-of-pocket cost depends on the top-up policy', 'Fees set freely by the dentist', p(CC.libre_actes, l)],
    ];
  const cap = fr
    ? 'Les trois paniers de prothèses de la convention dentaire. Part des actes : Cour des comptes, année 2021.'
    : 'The three prosthetic baskets in the dental agreement. Share of procedures: Cour des comptes, 2021.';
  return h.table(th, rows, cap, ['l', 'l', 'l', 'r']);
};

export default defineGuide({
  id: 'devis-100-sante',
  group: 'organisation',
  order: 60,
  mini: 'devisAcceptation',
  related: ['indicateurs-cabinet', 'taux-de-charges', 'omnipraticien', 'organisation-cabinet', 'ca-par-fauteuil'],
  sources: ['ameli100s', 'convention2023', 'conventionAnnexes', 'ameliCalendrier', 'cspL1111_3_2', 'arreteInfo2018', 'dreesCns2025', 'ccomptes100s'],
  fr: {
    slug: 'devis-prothese-dentaire',
    nav: 'Devis et 100 % Santé',
    card: 'Les règles du devis de prothèse, les trois paniers et ce qui change au 1er janvier 2026.',
    title: 'Devis prothèse dentaire 2026 : règles et 100 % Santé',
    description: `Devis de prothèse dentaire en 2026 : devis écrit obligatoire, alternative 100 % Santé à proposer, trois paniers, affichage des tarifs, nouveautés de janvier.`,
    h1: 'Le devis de prothèse et le 100 % Santé dentaire, côté cabinet',
    intro: 'Ce que la convention impose avant chaque prothèse, et ce que pèse aujourd’hui le panier sans reste à charge.',
    resume: `Avant toute prothèse ou tout traitement d’orthodontie facturé avec dépassement, le chirurgien-dentiste doit remettre un devis écrit, daté et signé, établi sur le modèle de l’annexe III de la convention nationale de 2023. Ce devis doit indiquer, chaque fois qu’une alternative thérapeutique existe, une solution du panier 100 % Santé, sans reste à charge, ou à défaut du panier à reste à charge maîtrisé, et préciser si le praticien la réalise lui-même. Le 100 % Santé dentaire est entré en vigueur le 1er avril 2019, pour les couronnes et bridges en 2020 et les prothèses amovibles en 2021. En ${C.annee}, les prothèses de ce panier représentent ${p(part100, 'fr', 1)} des dépenses de prothèses dentaires selon la DREES, soit ${mdsFr(C.protheses_100s_meur)}. Au 1er janvier 2026, la couronne zircone monolithique sur molaire et le bridge zircone de trois éléments rejoignent le panier sans reste à charge. La loi ne fixe aucune durée de validité du devis : le praticien l’indique lui-même.`,
    faqs: [
      { q: 'Un devis est-il obligatoire avant une couronne ou un bridge ?', a: `Oui, dès que l’acte peut être facturé au-delà du tarif de remboursement, ce qui est le cas des prothèses et de l’orthodontie. L’article 18.4 de la convention de 2023 impose un devis descriptif écrit, daté et signé, remis avant le traitement, sur le modèle de l’annexe III. Il n’y a pas de seuil en euros : l’obligation tient à l’entente directe sur les honoraires, pas au montant.` },
      { q: 'Le chirurgien-dentiste doit-il toujours proposer une prothèse 100 % Santé ?', a: `Il doit proposer une alternative sans reste à charge, ou à défaut à reste à charge maîtrisé, chaque fois qu’une alternative thérapeutique existe, et l’inscrire dans la partie du devis prévue pour cela. Il précise aussi s’il réalise lui-même cette alternative. Le patient reste libre de choisir le panier qu’il veut ; le devis garde la trace de l’information donnée.` },
      { q: 'Combien de temps un devis dentaire reste-t-il valable ?', a: `Aucun texte ne fixe de durée. La notice du modèle de devis de la convention précise que le chirurgien-dentiste indique la date du devis et sa date de fin de validité : c’est donc au cabinet de la choisir. Une durée courte protège contre la hausse du prix des matériaux ; une durée trop courte oblige à refaire le devis quand la complémentaire tarde à répondre.` },
      { q: 'Qu’est-ce qui change dans le panier 100 % Santé dentaire au 1er janvier 2026 ?', a: `D’après le calendrier de la convention publié par l’Assurance Maladie, la couronne zircone monolithique sur molaire (code HBLD073) et le bridge zircone de trois éléments (HBLD099) entrent dans le panier sans reste à charge. Le mainteneur d’espace (HBLD006) rejoint le panier maîtrisé. Les honoraires limites de facturation sont revalorisés de 3 %. Les devis en cours méritent une relecture.` },
      { q: 'Quels tarifs un cabinet dentaire doit-il afficher en salle d’attente ?', a: `L’arrêté du 30 mai 2018 impose un affichage lisible dans le lieu d’attente et d’encaissement : la situation conventionnelle, le tarif de la consultation et d’au moins cinq soins conservateurs, chirurgicaux ou de prévention parmi les plus pratiqués, et d’au moins cinq traitements prothétiques ou d’orthodontie, avec leur base de remboursement. Une information écrite préalable est due dès 70 € de dépassement.` },
      { q: 'Quelle part des prothèses dentaires relève du panier sans reste à charge ?', a: `Selon la Cour des comptes, ${p(CC.rac0_actes, 'fr')} des actes de prothèse en 2021 relevaient du panier 100 % Santé, ${p(CC.modere_actes, 'fr')} du panier maîtrisé et ${p(CC.libre_actes, 'fr')} du tarif libre, contre ${p(CC.libre_actes_2019, 'fr')} au tarif libre en 2019. En dépense, la DREES compte ${p(part100, 'fr', 1)} des prothèses dans le panier 100 % Santé en ${C.annee}.` },
    ],
    body: (h) => `
<h2>Le devis : ce que la convention impose</h2>
<p>La règle tient en une phrase de l’article 18.4 de la convention nationale des chirurgiens-dentistes de 2023 : avant tout traitement qui peut faire l’objet d’une entente directe sur les honoraires, le praticien remet à l’assuré un devis descriptif écrit, daté et signé. La convention a été signée le 21 juillet 2023 et approuvée par l’${h.src('convention2023', 'arrêté du 23 août 2023')}, pour cinq ans. Le modèle de devis figure en annexe III, publiée avec les ${h.src('conventionAnnexes', 'annexes consolidées par l’Assurance Maladie')}.</p>
<p>Le Code de la santé publique va dans le même sens. L’${h.src('cspL1111_3_2', 'article L1111-3-2')} prévoit l’information du patient par devis préalable et un devis normalisé qui distingue le prix de chaque dispositif. Un manquement aux règles d’information sur les tarifs relève d’une amende administrative prononcée par la DGCCRF. En pratique, trois éléments comptent :</p>
<ul>
<li><strong>Le moment</strong> : le devis précède le traitement. Un devis signé après la préparation de la dent ne protège ni le patient ni le cabinet.</li>
<li><strong>Le contenu</strong> : les actes, leur code, le prix de la prothèse et celui des soins, la base de remboursement et, pour chaque prothèse, l’information sur l’alternative thérapeutique.</li>
<li><strong>La validité</strong> : aucun texte n’en fixe la durée. La notice du modèle précise que le praticien indique lui-même la date de fin de validité.</li>
</ul>
<h2>L’alternative 100 % Santé, une obligation d’information</h2>
<p>La même clause ajoute que le praticien s’engage à proposer une alternative sans reste à charge, ou à défaut avec un reste à charge maîtrisé, chaque fois qu’une alternative thérapeutique existe. Le devis comporte une rubrique dédiée, où le praticien indique aussi s’il réalise lui-même cette alternative. Ce n’est pas une obligation de poser une prothèse du panier 100 % Santé : c’est une obligation d’informer, dont le devis garde la preuve.</p>
<p>Pour le cabinet, c’est aussi un outil de vente honnête. Un patient qui voit côte à côte la couronne sans reste à charge et la couronne au tarif libre comprend ce que paie la différence : un matériau, une teinte, un rendu esthétique. Présenter les deux options dès la première consultation évite le devis refusé en silence, qui ne revient jamais.</p>
<h2>Les trois paniers et ce qu’ils pèsent</h2>
<p>La réforme du 100 % Santé dentaire a été négociée dans la convention du 21 juin 2018. L’${h.src('ameli100s', 'Assurance Maladie')} en rappelle le calendrier : honoraires limites de facturation à partir du 1er avril 2019, prothèses fixes (couronnes et bridges) dans le panier sans reste à charge en 2020, prothèses amovibles en 2021. La convention de 2023 a repris l’architecture à trois paniers.</p>
${paniers('fr', h)}
<p>Les chiffres de dépense confirment le poids du panier. Selon la ${h.src('dreesCns2025', 'DREES')}, les prothèses dentaires représentent ${mdsFr(C.protheses_total_meur)} en ${C.annee}, soit ${p(partProtheses, 'fr', 1)} des honoraires dentaires ; celles du panier 100 % Santé en font ${mdsFr(C.protheses_100s_meur)}, soit ${p(part100, 'fr', 1)}. Les organismes complémentaires financent ${p(C.part_complementaires, 'fr', 1)} de la dépense de prothèses du panier 100 % Santé. La ${h.src('ccomptes100s', 'Cour des comptes')} a mesuré le basculement en nombre d’actes : ${p(CC.libre_actes_2019, 'fr')} des prothèses étaient au tarif libre en 2019, ${p(CC.libre_actes, 'fr')} en 2021.</p>
<h2>Ce qui change au 1er janvier 2026</h2>
<p>Le ${h.src('ameliCalendrier', 'calendrier des mesures de la convention')} publié par l’Assurance Maladie prévoit plusieurs changements au 1er janvier 2026 :</p>
<ul>
<li>la couronne zircone monolithique sur molaire (code HBLD073) entre dans le panier sans reste à charge ;</li>
<li>le bridge zircone de trois éléments (HBLD099) y entre aussi ;</li>
<li>le mainteneur d’espace (HBLD006) rejoint le panier à reste à charge maîtrisé ;</li>
<li>les honoraires limites de facturation sont revalorisés de 3 %.</li>
</ul>
<p>Deux conséquences pour le cabinet. Les devis émis en 2025 et signés en 2026 pour ces actes doivent être relus : le panier et le plafond ont pu changer. Et la grille interne de prix, celle que l’assistante utilise pour préparer les devis, doit être mise à jour, faute de quoi le cabinet facture sous le nouveau plafond ou présente une alternative qui n’existe plus sous cette forme.</p>
<h2>L’affichage des tarifs au cabinet</h2>
<p>L’${h.src('arreteInfo2018', 'arrêté du 30 mai 2018')} fixe ce que le patient doit voir avant même le devis. L’affichage se fait de façon lisible sur un même support, dans le lieu d’attente et dans le lieu d’encaissement. Pour un chirurgien-dentiste, il comprend la situation conventionnelle, le tarif de la consultation et d’au moins cinq soins conservateurs, chirurgicaux ou de prévention parmi les plus pratiqués, puis au moins cinq traitements prothétiques ou d’orthodontie, avec leur base de remboursement. Une information écrite préalable est due dès que les dépassements atteignent 70 €. L’affiche se met à jour en même temps que la grille de prix, donc au 1er janvier 2026.</p>
<h2>Le circuit du devis au cabinet</h2>
<p>Un devis bien fait se prépare en trois temps. Au fauteuil, le praticien explique le plan de traitement et les options ; c’est le moment où le patient pose ses questions, et où il décide le plus souvent. À l’accueil, l’assistante ou la secrétaire édite le devis depuis le logiciel, vérifie les codes, le panier de chaque acte et la base de remboursement, puis le remet au patient avec une copie pour sa complémentaire. Dans les jours qui suivent, le cabinet suit le devis : une colonne « remis », une colonne « signé », une date de relance. Ce suivi, souvent absent, est ce qui distingue un cabinet qui convertit ses plans de traitement d’un cabinet qui les perd.</p>
<p>Le devis signé se conserve au dossier du patient. En cas de désaccord sur le prix ou sur l’information donnée, c’est la seule pièce qui montre que l’alternative a été proposée et que le patient a choisi en connaissance de cause. Un devis modifié en cours de traitement, parce qu’une dent supplémentaire doit être couronnée par exemple, donne lieu à un nouveau devis, lui aussi signé avant l’acte.</p>
<h2>Le taux d’acceptation, l’indicateur que personne ne publie</h2>
<p>Le devis est aussi un chiffre de gestion. Rapporter les devis signés aux devis remis donne un taux d’acceptation ; multiplier par le montant moyen donne la production qui entre dans l’agenda. Aucune statistique publique ne donne ce taux pour les cabinets dentaires : la DREES mesure la dépense, la Cour des comptes la répartition entre paniers, pas les devis refusés. Le mini-simulateur ci-dessus part donc de vos propres chiffres, à relever dans le logiciel sur trois à six mois.</p>
<p>Trois habitudes font souvent monter ce taux sans changer les prix. Présenter le devis au fauteuil, avec les deux options, plutôt que de le remettre à l’accueil. Proposer un étalement des séances quand le plan de traitement est long. Rappeler le patient une semaine après la remise, quand la complémentaire a répondu. Suivez ce taux chaque mois avec les autres ${h.a('indicateurs-cabinet', 'indicateurs du cabinet')}, et rapprochez la production signée de la moyenne des ${h.a('omnipraticien', 'omnipraticiens')} et du ${h.a('taux-de-charges', 'taux de charges')} : une prothèse ne rapporte qu’après le laboratoire.</p>
<p>Le ${h.a('home', 'diagnostic du cabinet')} place ces chiffres dans le rapport complet ; la rubrique ${h.a('organisation-cabinet', 'organisation et performance')} réunit les autres leviers.</p>`,
  },
  en: {
    slug: 'dental-prosthesis-quote',
    nav: 'Quotes and 100% Santé',
    card: 'The rules for prosthetic quotes, the three baskets and what changed on 1 January 2026.',
    title: 'Dental prosthesis quotes and 100% Santé in France 2026',
    description: `Dental prosthesis quotes in France for 2026: written quote required, a 100% Santé option to offer, the three baskets, fee display rules and the January changes.`,
    h1: 'Prosthetic quotes and 100% Santé dental, from the practice side',
    intro: 'What the national agreement requires before every prosthesis, and how much the no-cost basket now weighs.',
    resume: `Before any prosthesis or orthodontic treatment billed above the reimbursement rate, a French dentist must hand over a written, dated and signed quote drawn up on the template in annex III of the 2023 national agreement with Assurance Maladie, the national health insurer. Whenever an alternative treatment exists, the quote must show an option from the 100% Santé basket, with nothing left to pay, or failing that from the controlled out-of-pocket basket, and state whether the dentist provides it. 100% Santé dental came into force on 1 April 2019, for crowns and bridges in 2020 and for dentures in 2021. In ${C.annee} prostheses in that basket made up ${p(part100, 'en', 1)} of prosthetic spending according to DREES, the health ministry’s statistics office, or ${mdsEn(C.protheses_100s_meur)}. On 1 January 2026 the monolithic zirconia crown on a molar and the three-unit zirconia bridge joined the no-cost basket. No law sets how long a quote stays valid: the dentist states it.`,
    faqs: [
      { q: 'Does a French dentist have to give a quote before a crown or bridge?', a: `Yes, whenever the work can be billed above the reimbursement rate, which covers prostheses and orthodontics. Article 18.4 of the 2023 agreement requires a written, dated and signed descriptive quote before treatment, on the annex III template. There is no euro threshold: the duty comes from the dentist setting the fee directly with the patient, not from the amount.` },
      { q: 'Must the dentist always offer a 100% Santé prosthesis?', a: `The dentist must offer a no-cost option, or failing that a controlled out-of-pocket one, whenever an alternative treatment exists, and record it in the section of the quote set aside for it, stating whether they provide it themselves. The patient remains free to pick any basket; the quote keeps a record of the information given.` },
      { q: 'How long is a French dental quote valid for?', a: `No text sets a period. The notes to the agreement’s quote template say the dentist states the date of the quote and the date it expires, so the practice chooses. A short period protects against rising material costs; one that is too short means redoing the quote when the patient’s top-up insurer is slow to reply.` },
      { q: 'What changed in the 100% Santé dental basket on 1 January 2026?', a: `According to the agreement timetable published by Assurance Maladie, the monolithic zirconia crown on a molar (code HBLD073) and the three-unit zirconia bridge (HBLD099) moved into the no-cost basket. The space maintainer (HBLD006) joined the controlled basket, and fee ceilings rose by 3%. Quotes issued before the change are worth checking again.` },
      { q: 'Which fees must a French dental practice display in the waiting room?', a: `The order of 30 May 2018 requires a legible display in the waiting and payment areas: contract status, the consultation fee and at least five of the most common conservative, surgical or preventive treatments, plus at least five prosthetic or orthodontic treatments, each with its reimbursement base. Prior written information is due once fees exceed the base by €70.` },
      { q: 'What share of dental prostheses falls in the no-cost basket?', a: `The Cour des comptes, France’s public audit court, found that ${p(CC.rac0_actes, 'en')} of prosthetic procedures in 2021 were in the 100% Santé basket, ${p(CC.modere_actes, 'en')} in the controlled basket and ${p(CC.libre_actes, 'en')} at free prices, against ${p(CC.libre_actes_2019, 'en')} at free prices in 2019. By spending, DREES puts ${p(part100, 'en', 1)} of prostheses in the 100% Santé basket in ${C.annee}.` },
    ],
    body: (h) => `
<h2>The quote: what the agreement requires</h2>
<p>The rule fits in one sentence of article 18.4 of the 2023 national agreement between dentists and Assurance Maladie: before any treatment whose fee may be set directly with the patient, the dentist hands over a written, dated and signed descriptive quote. The agreement was signed on 21 July 2023 and approved by the ${h.src('convention2023', 'order of 23 August 2023')} for five years. The quote template is annex III, published with the ${h.src('conventionAnnexes', 'annexes consolidated by Assurance Maladie')}.</p>
<p>The Public Health Code points the same way. ${h.src('cspL1111_3_2', 'Article L1111-3-2')} provides for patient information through a prior quote and a standard quote that lists the price of each device separately. Breaches of the fee information rules can lead to an administrative fine from the DGCCRF, the consumer protection authority. In practice three things matter:</p>
<ul>
<li><strong>Timing</strong>: the quote comes before treatment. A quote signed after the tooth has been prepared protects neither the patient nor the practice.</li>
<li><strong>Content</strong>: the procedures, their codes, the price of the prosthesis and of the care, the reimbursement base and, for each prosthesis, the information on the alternative treatment.</li>
<li><strong>Validity</strong>: no text sets a period. The template notes say the dentist states the expiry date.</li>
</ul>
<h2>The 100% Santé option, a duty to inform</h2>
<p>The same clause adds that the dentist undertakes to offer a no-cost option, or failing that one with a controlled out-of-pocket cost, whenever an alternative treatment exists. The quote has a dedicated section for it, where the dentist also says whether they provide that option. It is not a duty to fit a 100% Santé prosthesis: it is a duty to inform, and the quote is the proof.</p>
<p>For the practice it is also a fair way to sell. A patient who sees the no-cost crown next to the free-price crown understands what the difference pays for: a material, a shade, an aesthetic result. Presenting both options at the first appointment avoids the quote that is quietly turned down and never comes back.</p>
<h2>The three baskets and their weight</h2>
<p>The 100% Santé dental reform was negotiated in the agreement of 21 June 2018. ${h.src('ameli100s', 'Assurance Maladie')} sets out the timetable: fee ceilings from 1 April 2019, fixed prostheses (crowns and bridges) in the no-cost basket in 2020, dentures in 2021. The 2023 agreement kept the three-basket design.</p>
${paniers('en', h)}
<p>Spending figures confirm the basket’s weight. According to ${h.src('dreesCns2025', 'DREES')}, dental prostheses came to ${mdsEn(C.protheses_total_meur)} in ${C.annee}, or ${p(partProtheses, 'en', 1)} of dental fees; those in the 100% Santé basket accounted for ${mdsEn(C.protheses_100s_meur)}, or ${p(part100, 'en', 1)}. Top-up insurers fund ${p(C.part_complementaires, 'en', 1)} of spending on 100% Santé prostheses. The ${h.src('ccomptes100s', 'Cour des comptes')} measured the shift in number of procedures: ${p(CC.libre_actes_2019, 'en')} of prostheses were at free prices in 2019, ${p(CC.libre_actes, 'en')} in 2021.</p>
<h2>What changed on 1 January 2026</h2>
<p>The ${h.src('ameliCalendrier', 'agreement timetable')} published by Assurance Maladie lists several changes on 1 January 2026:</p>
<ul>
<li>the monolithic zirconia crown on a molar (code HBLD073) moves into the no-cost basket;</li>
<li>the three-unit zirconia bridge (HBLD099) moves in as well;</li>
<li>the space maintainer (HBLD006) joins the controlled out-of-pocket basket;</li>
<li>fee ceilings rise by 3%.</li>
</ul>
<p>Two consequences for the practice. Quotes issued in 2025 and signed in 2026 for these procedures need checking, since the basket and the ceiling may have changed. And the internal price list the dental nurse uses to prepare quotes needs updating; otherwise the practice bills under the new ceiling or offers an alternative that no longer exists in that form.</p>
<h2>Displaying fees in the practice</h2>
<p>The ${h.src('arreteInfo2018', 'order of 30 May 2018')} sets out what the patient must see before any quote. The display must be legible, on a single board, in both the waiting area and the payment area. For a dentist it covers contract status, the consultation fee and at least five of the most common conservative, surgical or preventive treatments, then at least five prosthetic or orthodontic treatments, each with its reimbursement base. Prior written information is due once fees exceed the base by €70. The board is updated together with the price list, so on 1 January 2026.</p>
<h2>How a quote moves through the practice</h2>
<p>A good quote is prepared in three stages. At the chair, the dentist explains the treatment plan and the options; this is when the patient asks questions, and usually when the decision is made. At reception, the dental nurse or secretary prints the quote from the software, checks the codes, the basket of each procedure and the reimbursement base, then gives it to the patient with a copy for the top-up insurer. In the days that follow, the practice tracks it: one column for quotes given, one for quotes signed, a date for a follow-up call. That tracking, often missing, is what separates a practice that turns treatment plans into work from one that loses them.</p>
<p>The signed quote is kept in the patient’s record. If there is a dispute over the price or the information given, it is the only document showing that the alternative was offered and that the patient chose knowingly. When the plan changes during treatment, because another tooth needs a crown for instance, a new quote is issued and signed before the work, like the first one.</p>
<p>Practices that handle many prosthetic cases often give one person ownership of the quote file. That person checks each morning which quotes have passed their follow-up date, calls the patients concerned, and updates the diary as soon as a quote is signed so that the long sessions are booked while the patient is still motivated. The method costs a few minutes a day and needs no new software, only a column in the existing one or a shared spreadsheet.</p>
<h2>Acceptance rate, the indicator nobody publishes</h2>
<p>A quote is also a management figure. Dividing quotes signed by quotes given yields an acceptance rate; multiplying by the average amount gives the work entering the diary. No public statistic gives that rate for dental practices: DREES measures spending and the Cour des comptes the split between baskets, not quotes turned down. The small calculator above therefore uses your own figures, taken from the software over three to six months.</p>
<p>Three habits often lift the rate without touching prices. Present the quote at the chair, with both options, rather than handing it over at reception. Offer to spread sessions when the treatment plan is long. Call the patient a week later, once the top-up insurer has replied. Track the rate monthly with the other ${h.a('indicateurs-cabinet', 'practice KPIs')}, and set the work signed against the average for ${h.a('omnipraticien', 'general dentists')} and the ${h.a('taux-de-charges', 'cost ratio')}: a prosthesis only pays once the laboratory has been paid.</p>
<p>The ${h.a('home', 'practice check-up')} puts these figures in the full report; the ${h.a('organisation-cabinet', 'organisation and performance')} section gathers the other levers.</p>`,
  },
});
