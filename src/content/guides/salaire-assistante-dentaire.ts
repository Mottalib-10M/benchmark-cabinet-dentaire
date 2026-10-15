import { defineGuide } from '../../lib/guide-types';
import { P } from '../../lib/engine/params';
import { coutEmployeur, brutMinimal, tauxPatronal, coefRgdu } from '../../lib/engine/employeur';
import { reference, UNASA_YEAR } from '../../lib/engine/references';
import raw from '../../data/unasa.json';
import { formatMoney, formatNumber, formatPercent, displayDate } from '../../lib/format';

const S = P.salaires_2026;
const E = P.employeur_2026;
type Emploi = keyof typeof S.horaire;
const EMPLOIS: Emploi[] = ['assistant_dentaire', 'aide_dentaire', 'secretaire_technique', 'receptionniste'];
const NOM: Record<'fr' | 'en', Record<Emploi, string>> = {
  fr: { assistant_dentaire: 'Assistant(e) dentaire', aide_dentaire: 'Aide dentaire', secretaire_technique: 'Secrétaire technique', receptionniste: 'Réceptionniste', personnel_entretien: 'Personnel d’entretien', assistant_formation_moins_26: 'Assistant(e) en formation, moins de 26 ans', assistant_formation_26_plus: 'Assistant(e) en formation, 26 ans et plus' },
  en: { assistant_dentaire: 'Dental nurse (assistant dentaire)', aide_dentaire: 'Dental aide', secretaire_technique: 'Practice secretary', receptionniste: 'Receptionist', personnel_entretien: 'Cleaning staff', assistant_formation_moins_26: 'Trainee dental nurse, under 26', assistant_formation_26_plus: 'Trainee dental nurse, 26 and over' },
};
const horaireApplique = (j: Emploi) => Math.max(S.horaire[j], S.smic_horaire);
const sousSmic = (Object.keys(S.horaire) as Emploi[]).filter((j) => S.horaire[j] < S.smic_horaire);
const sousSmicHorsFormation = sousSmic.filter((j) => !j.startsWith('assistant_formation'));

const brutAD = brutMinimal('assistant_dentaire');
const AD = coutEmployeur(brutAD);
const AIDE = coutEmployeur(brutMinimal('aide_dentaire'));
const ecartAide = AD.cout - AIDE.cout;
const ecartAideBrut = AD.brut - AIDE.brut;
const surcout = ecartAide > ecartAideBrut * (1 + tauxPatronal);
const nomsSousSmic = (l: 'fr' | 'en') => sousSmicHorsFormation.map((j) => NOM[l][j].toLowerCase()).join(l === 'fr' ? ' et ' : ' and ');
const heuresSemaine = (S.heures_mois * 12) / 52;
const PARTIELS = [1, 4 / 5, 3 / 5].map((f) => S.heures_mois * f);
const seuilRgdu = E.rgdu.seuil_smic * S.smic_mensuel;
const NIVEAUX = [S.smic_mensuel, brutAD, 2 * S.smic_mensuel, seuilRgdu];

const UA = (raw as unknown as Record<string, { lignes: Record<string, Array<number | string | null>> }>)[`851EAA_${UNASA_YEAR}`];
const G = reference('omni');
const Q = [1, 2, 3, 4].map((q) => reference('omni', Number(UA.lignes['Montant net des recettes'][q])));
const personnelEur = G.personnel * G.recettes;
const equivalents = personnelEur / AD.coutAnnuel;
const evoPers = Number(UA.lignes['Charges de personnel (évolution, %)'][0]) / 100;
const evoRec = Number(UA.lignes['Montant net des recettes (évolution, %)'][0]) / 100;

const e = (x: number, l: 'fr' | 'en', d = 0) => formatMoney(x, d, l);
const p = (x: number, l: 'fr' | 'en', d = 1) => formatPercent(x, d, l);
const n = (x: number, l: 'fr' | 'en', d = 0) => formatNumber(x, d, l);
const dt = (iso: string, l: 'fr' | 'en') => displayDate(iso, l === 'fr' ? 'fr-FR' : 'en-GB');
const sg = (x: number, l: 'fr' | 'en') => `${x >= 0 ? '+' : '−'}${n(Math.abs(x) * 100, l, 1)}${l === 'fr' ? ' ' : ''}%`;

type H = { table: (a: string[], b: Array<Array<string | number>>, c?: string, d?: Array<'l' | 'r'>) => string };
const tGrille = (l: 'fr' | 'en', h: H) => h.table(
  l === 'fr' ? ['Emploi', 'Taux de la grille', 'Taux payé au minimum', 'Brut mensuel temps plein', 'Coût employeur mensuel', 'Coût annuel'] : ['Job', 'Pay-scale rate', 'Minimum rate paid', 'Full-time monthly gross', 'Monthly employer cost', 'Annual cost'],
  EMPLOIS.map((j) => { const c = coutEmployeur(brutMinimal(j)); return [NOM[l][j], e(S.horaire[j], l, 2), e(horaireApplique(j), l, 2), e(c.brut, l), e(c.cout, l), e(c.coutAnnuel, l)]; }),
  l === 'fr' ? `Grille IDCC 1619 au 1er janvier 2026, Smic horaire de ${e(S.smic_horaire, l, 2)} depuis le ${dt(S.smic_depuis, l)}, ${n(S.heures_mois, l, 2)} heures par mois. Coût : brut + cotisations patronales − réduction générale.` : `IDCC 1619 pay scale from 1 January 2026, hourly minimum wage (Smic) of ${e(S.smic_horaire, l, 2)} since ${dt(S.smic_depuis, l)}, ${n(S.heures_mois, l, 2)} hours a month. Cost: gross + employer contributions − general relief.`,
  ['l', 'r', 'r', 'r', 'r', 'r'],
);
const tPartiel = (l: 'fr' | 'en', h: H) => h.table(
  l === 'fr' ? ['Heures par semaine', 'Heures par mois', 'Brut mensuel', 'Coût mensuel', 'Coût annuel'] : ['Hours a week', 'Hours a month', 'Monthly gross', 'Monthly cost', 'Annual cost'],
  PARTIELS.map((hm) => { const c = coutEmployeur(brutMinimal('assistant_dentaire', hm), hm); return [n((hm * 12) / 52, l), n(hm, l, 2), e(c.brut, l), e(c.cout, l), e(c.coutAnnuel, l)]; }),
  l === 'fr' ? 'Assistant(e) dentaire au minimum de la grille 2026.' : 'Dental nurse at the 2026 pay-scale minimum.',
  ['l', 'r', 'r', 'r', 'r'],
);
const tNiveaux = (l: 'fr' | 'en', h: H) => {
  const lab = l === 'fr' ? ['Smic', 'Minimum assistant(e) dentaire', '2 Smic', 'Fin de la réduction générale'] : ['Smic', 'Dental nurse minimum', '2 × Smic', 'End of general relief'];
  return h.table(
    l === 'fr' ? ['Niveau', 'Brut mensuel', 'Coefficient RGDU', 'Coût mensuel', 'Coût / brut'] : ['Level', 'Monthly gross', 'RGDU coefficient', 'Monthly cost', 'Cost / gross'],
    NIVEAUX.map((b, i) => { const c = coutEmployeur(b); return [lab[i], e(b, l), p(coefRgdu(b), l, 2), e(c.cout, l), n(c.cout / b, l, 3)]; }),
    l === 'fr' ? 'Temps plein, cabinet de moins de 11 salariés, entreprise de moins de 50 salariés pour la réduction générale, hors accident du travail et prévoyance.' : 'Full time, practice with fewer than 11 employees, general relief at the rate for employers under 50 staff, excluding workplace-accident rate and sector insurance.',
    ['l', 'r', 'r', 'r', 'r'],
  );
};

export default defineGuide({
  id: 'salaire-assistante-dentaire',
  group: 'gestion',
  order: 40,
  mini: 'coutAssistante',
  related: ['taux-de-charges', 'ca-par-fauteuil', 'selarl-ou-bnc', 'omnipraticien', 'revenu-dentiste'],
  sources: ['ccn1619Salaires', 'spSmic', 'urssafTaux', 'urssafRgdu', 'unasa'],
  fr: {
    slug: 'salaire-assistante-dentaire',
    nav: 'Salaire d’une assistante dentaire',
    card: 'Grille 2026 des cabinets dentaires, brut minimum et coût réel pour l’employeur.',
    title: 'Salaire assistante dentaire 2026 : grille et coût employeur',
    description: `Assistante dentaire en 2026 : ${e(S.horaire.assistant_dentaire, 'fr', 2)} brut de l'heure au minimum de la grille IDCC 1619, ${e(AD.brut, 'fr')} par mois à temps plein, ${e(AD.cout, 'fr')} de coût pour le cabinet.`,
    h1: 'Salaire d’une assistante dentaire : la grille 2026 et ce qu’elle coûte',
    intro: 'Le minimum conventionnel de chaque emploi du cabinet, puis le coût complet une fois les cotisations et la réduction générale passées.',
    resume: `En 2026, une assistante dentaire ne peut pas être payée moins de ${e(S.horaire.assistant_dentaire, 'fr', 2)} brut de l'heure, selon la grille de la convention collective des cabinets dentaires (IDCC 1619) fixée par l'accord du 12 février 2026 et étendue le 15 juillet 2026. À temps plein, ${n(S.heures_mois, 'fr', 2)} heures par mois, cela donne ${e(AD.brut, 'fr')} brut. Pour le cabinet, le coût atteint ${e(AD.cout, 'fr')} par mois et ${e(AD.coutAnnuel, 'fr')} par an : ${e(AD.cotisations, 'fr')} de cotisations patronales s'ajoutent, puis la réduction générale dégressive unique (RGDU) retire ${e(AD.rgdu, 'fr')}. Une aide dentaire coûte ${e(AIDE.cout, 'fr')} par mois au minimum. Ces montants sont des planchers : ils n'incluent ni le taux accident du travail notifié au cabinet, ni la prévoyance et la mutuelle de branche, ni les primes. Dans les comptes UNASA ${UNASA_YEAR}, le personnel pèse ${p(G.personnel, 'fr')} des recettes d'un cabinet de chirurgien-dentiste.`,
    faqs: [
      { q: 'Quel est le salaire minimum d’une assistante dentaire en 2026 ?', a: `${e(S.horaire.assistant_dentaire, 'fr', 2)} brut de l'heure, soit ${e(AD.brut, 'fr')} brut par mois pour ${n(S.heures_mois, 'fr', 2)} heures. C'est le taux de la grille IDCC 1619 au 1er janvier 2026, au-dessus du Smic horaire de ${e(S.smic_horaire, 'fr', 2)} en vigueur depuis le ${dt(S.smic_depuis, 'fr')}. L'accord a été étendu le 15 juillet 2026 : il s'impose à tous les cabinets, adhérents d'un syndicat ou non.` },
      { q: 'Combien coûte une assistante dentaire à temps plein pour le cabinet ?', a: `Au minimum de la grille, ${e(AD.cout, 'fr')} par mois, ${e(AD.coutAnnuel, 'fr')} par an. Le calcul part de ${e(AD.brut, 'fr')} brut, ajoute ${p(tauxPatronal, 'fr')} de cotisations patronales (taux Urssaf d'un cabinet de moins de 11 salariés) et retire la RGDU, ${p(AD.coefRgdu, 'fr')} du brut à ce niveau. Le taux accident du travail, la prévoyance et la mutuelle viennent en plus.` },
      { q: 'Une réceptionniste de cabinet dentaire peut-elle être payée au taux de la grille si celui-ci est sous le Smic ?', a: `Non. La grille 2026 fixe ${e(S.horaire.receptionniste, 'fr', 2)} de l'heure pour la réceptionniste, moins que le Smic de ${e(S.smic_horaire, 'fr', 2)} applicable depuis le ${dt(S.smic_depuis, 'fr')}. Le Smic l'emporte : ${e(brutMinimal('receptionniste'), 'fr')} brut par mois à temps plein. ${sousSmicHorsFormation.length > 1 ? `Le personnel d'entretien est dans le même cas.` : ''} La grille avait été négociée avant la revalorisation du Smic.` },
      { q: 'Quelle différence de coût entre une aide dentaire et une assistante dentaire ?', a: `Au minimum de la grille 2026 et à temps plein, ${e(ecartAideBrut, 'fr')} de brut par mois, ${e(ecartAide, 'fr')} de coût pour le cabinet, soit ${e(ecartAide * 12, 'fr')} par an. ${surcout ? `L'écart de coût dépasse l'écart de brut augmenté des cotisations : à ce niveau, la réduction générale diminue en euros quand le salaire monte.` : `L'écart de coût reste sous l'écart de brut augmenté des cotisations : à ce niveau, la réduction générale continue de croître en euros avec le salaire.`}` },
      { q: 'Quelle part des recettes d’un cabinet dentaire part en salaires ?', a: `${p(G.personnel, 'fr')} en moyenne, salaires nets et charges sociales compris, dans les comptes UNASA ${UNASA_YEAR} de ${n(G.echantillon, 'fr')} cabinets de chirurgiens-dentistes. La part va de ${p(Q[0].personnel, 'fr')} dans le quart des plus petites recettes à ${p(Q[2].personnel, 'fr')} dans le troisième quart. Sur les recettes moyennes, ce poste représente ${e(personnelEur, 'fr')} par an.` },
      { q: 'Le temps partiel change-t-il le coût horaire d’une assistante dentaire ?', a: `Non, pas au minimum de la grille. La réduction générale se calcule sur un Smic ramené au temps de travail, si bien que le coefficient reste le même : une assistante à ${n(heuresSemaine * 3 / 5, 'fr')} heures par semaine coûte exactement les trois cinquièmes d'un temps plein, ${e(coutEmployeur(brutMinimal('assistant_dentaire', PARTIELS[2]), PARTIELS[2]).cout, 'fr')} par mois au lieu de ${e(AD.cout, 'fr')}.` },
    ],
    body: (h) => `
<h2>La grille 2026 des cabinets dentaires</h2>
<p>Les salaires minimaux du personnel des cabinets dentaires sont fixés par la convention collective nationale des cabinets dentaires (IDCC 1619). L'accord du 12 février 2026, étendu par arrêté du 15 juillet 2026, les a relevés au 1er janvier (${h.src('ccn1619Salaires', 'texte sur Légifrance')}). Chaque emploi reçoit un taux horaire brut ; le salaire mensuel s'obtient en le multipliant par ${h.num(S.heures_mois, 2)} heures pour un temps plein de ${h.num(heuresSemaine)} heures par semaine.</p>
${tGrille('fr', h)}
<p>Hors formation, ${h.num(sousSmicHorsFormation.length)} taux de la grille passent sous le Smic horaire de ${h.eur(S.smic_horaire, 2)} depuis la revalorisation du ${dt(S.smic_depuis, 'fr')} (${h.src('spSmic', 'Service-public.gouv.fr')}) : ${nomsSousSmic('fr')}. Le Smic s'applique alors. La grille prévoit aussi ${h.eur(S.horaire.assistant_formation_moins_26, 2)} et ${h.eur(S.horaire.assistant_formation_26_plus, 2)} de l'heure pour l'assistant en formation selon son âge ; ces contrats suivent des règles de rémunération propres que la page ne calcule pas.</p>
<h2>Du salaire brut au coût pour le cabinet</h2>
<p>Le coût employeur se construit en trois étapes. On ajoute au brut les cotisations patronales d'un cabinet de moins de 11 salariés, ${h.pct(tauxPatronal)} au total sous le plafond de la sécurité sociale (${h.eur(E.plafond_mensuel)} par mois) : maladie, vieillesse, allocations familiales, chômage, retraite complémentaire, part mutualisée des accidents du travail, formation et taxe d'apprentissage, aux taux sur lesquels l'Urssaf calcule la réduction générale (${h.src('urssafTaux', 'barème Urssaf')}). On retire ensuite la réduction générale dégressive unique (RGDU) : son coefficient vaut ${h.pct(AD.coefRgdu, 2)} du brut au minimum d'une assistante et s'annule à ${h.num(E.rgdu.seuil_smic, 4)} Smic (${h.src('urssafRgdu', 'Urssaf')}). Pour une assistante au minimum, cela fait ${h.eur(AD.brut)} + ${h.eur(AD.cotisations)} − ${h.eur(AD.rgdu)} = ${h.eur(AD.cout)} par mois.</p>
<p>La réduction pèse lourd au bas de l'échelle et fond à mesure que le salaire monte. Le tableau suit le rapport entre coût et brut à quatre niveaux de rémunération.</p>
${tNiveaux('fr', h)}
<p>Au voisinage du Smic, la réduction générale efface l'essentiel des cotisations patronales : le coût dépasse à peine le brut. Le taux accident du travail notifié au cabinet par la Carsat remplace la seule part mutualisée retenue ici, et la prévoyance de branche s'ajoute, si bien que le coût réel est un peu plus élevé que le chiffre affiché. Concrètement, chaque euro de salaire accordé au-dessus du minimum coûte au cabinet plus qu'un euro chargé au taux affiché, puisque la réduction recule en même temps. Le mini-simulateur ci-dessus fait le calcul pour un supplément mensuel de votre choix.</p>
<h2>Temps partiel : un coût strictement proportionnel</h2>
<p>Un cabinet peut employer son assistante à temps partiel, ou partager une secrétaire avec un confrère. Au minimum de la grille, le coût suit exactement les heures, parce que le Smic de référence de la réduction est lui-même proratisé.</p>
${tPartiel('fr', h)}
<h2>Le poids du personnel dans les comptes</h2>
<p>Dans l'échantillon UNASA ${UNASA_YEAR}, les charges de personnel représentent ${h.pct(G.personnel)} des recettes, ${h.eur(personnelEur)} sur ${h.eur(G.recettes)} de recettes moyennes. Rapporté au coût annuel d'une assistante au minimum, ce montant équivaut à ${h.num(equivalents, 1)} poste à temps plein : un ordre de grandeur, puisque l'UNASA ne publie pas les effectifs et que les salaires versés peuvent dépasser la grille. Selon les évolutions publiées par l'UNASA, ce poste varie de ${sg(evoPers, 'fr')} en ${UNASA_YEAR}, les recettes de ${sg(evoRec, 'fr')}.</p>
<p>La part du personnel monte avec la taille : ${h.pct(Q[0].personnel)} dans le premier quart de recettes, ${h.pct(Q[3].personnel)} dans le dernier. La page sur le ${h.a('taux-de-charges', 'taux de charges')} met ce poste en regard des achats et du loyer ; celle sur le ${h.a('ca-par-fauteuil', 'chiffre d’affaires par fauteuil')} aide à juger si un deuxième fauteuil, donc souvent une deuxième assistante, se rentabilise.</p>
<h2>Ce que ce calcul laisse de côté</h2>
<ul>
<li>Le taux accident du travail et maladie professionnelle, notifié chaque année par la Carsat à chaque cabinet.</li>
<li>La prévoyance et la complémentaire santé de branche, dont la part patronale s'ajoute.</li>
<li>Les primes, l'ancienneté, les heures supplémentaires et les mentions complémentaires de qualification prévues par la convention.</li>
<li>La taxe sur les salaires, qui dépend de la situation fiscale du cabinet et n'est pas modélisée.</li>
</ul>
<p>Le résultat est donc un plancher, utile pour budgéter un recrutement, pas un bulletin de paie. Le site n'est ni un gestionnaire de paie ni un expert-comptable.</p>`,
  },
  en: {
    slug: 'dental-nurse-salary',
    nav: 'Dental nurse salary',
    card: 'The 2026 French pay scale for dental staff and what each job really costs.',
    title: 'Dental nurse salary in France 2026: pay scale, real cost',
    description: `A dental nurse in France earns at least ${e(S.horaire.assistant_dentaire, 'en', 2)} gross an hour in 2026 under the IDCC 1619 scale, ${e(AD.brut, 'en')} a month full time, costing the practice ${e(AD.cout, 'en')} a month.`,
    h1: 'What a dental nurse earns in France, and what she costs',
    intro: 'The 2026 minimum for every job in a French dental practice, then the full employer cost after contributions and relief.',
    resume: `In 2026 a dental nurse in France (assistante dentaire) cannot be paid less than ${e(S.horaire.assistant_dentaire, 'en', 2)} gross an hour. That is the rate in the collective agreement for dental practices, known by its number IDCC 1619, set by the deal of 12 February 2026 and made binding on every employer on 15 July 2026. Full time, ${n(S.heures_mois, 'en', 2)} hours a month, it comes to ${e(AD.brut, 'en')} gross. The practice pays ${e(AD.cout, 'en')} a month, ${e(AD.coutAnnuel, 'en')} a year: ${e(AD.cotisations, 'en')} of employer contributions go on top, then the RGDU, France’s general relief on low wages, takes off ${e(AD.rgdu, 'en')}. A dental aide costs at least ${e(AIDE.cout, 'en')} a month. Treat these as floors, since they leave out the practice’s own workplace-accident rate, sector insurance and bonuses. In UNASA’s ${UNASA_YEAR} accounts, staff take ${p(G.personnel, 'en')} of a dental practice’s receipts.`,
    faqs: [
      { q: 'What is the minimum wage for a dental nurse in France in 2026?', a: `${e(S.horaire.assistant_dentaire, 'en', 2)} gross an hour, or ${e(AD.brut, 'en')} a month for ${n(S.heures_mois, 'en', 2)} hours. That is the IDCC 1619 pay-scale rate from 1 January 2026, above the national hourly minimum wage (Smic) of ${e(S.smic_horaire, 'en', 2)} in force since ${dt(S.smic_depuis, 'en')}. Because the agreement was extended on 15 July 2026, it binds every practice, union member or not.` },
      { q: 'How much does a full-time dental nurse cost an employer in France?', a: `At the pay-scale minimum, ${e(AD.cout, 'en')} a month and ${e(AD.coutAnnuel, 'en')} a year. Start from ${e(AD.brut, 'en')} gross, add ${p(tauxPatronal, 'en')} of employer contributions (Urssaf rates for a practice under 11 staff), then subtract the RGDU relief, worth ${p(AD.coefRgdu, 'en')} of gross pay at that level. The workplace-accident rate, sector insurance and health cover come on top.` },
      { q: 'Can a dental receptionist in France be paid the pay-scale rate when it falls below the Smic?', a: `No. The 2026 scale sets ${e(S.horaire.receptionniste, 'en', 2)} an hour for receptionists, less than the ${e(S.smic_horaire, 'en', 2)} Smic that has applied since ${dt(S.smic_depuis, 'en')}. The Smic wins, giving ${e(brutMinimal('receptionniste'), 'en')} gross a month full time. ${sousSmicHorsFormation.length > 1 ? 'Cleaning staff are in the same position.' : ''} The scale was agreed before the minimum wage went up.` },
      { q: 'How much more does a dental nurse cost than a dental aide?', a: `At the 2026 minimum and full time, ${e(ecartAideBrut, 'en')} more gross pay a month and ${e(ecartAide, 'en')} more cost to the practice, ${e(ecartAide * 12, 'en')} a year. ${surcout ? 'The cost gap is wider than the gross gap plus contributions, because at this level the general relief loses euros as pay rises.' : 'The cost gap is narrower than the gross gap plus contributions, because at this level the general relief still grows in euros with pay.'}` },
      { q: 'What share of a French dental practice’s takings goes on staff?', a: `${p(G.personnel, 'en')} on average, net wages and social charges together, in UNASA’s ${UNASA_YEAR} accounts for ${n(G.echantillon, 'en')} dental practices. It ranges from ${p(Q[0].personnel, 'en')} in the quarter with the smallest receipts to ${p(Q[2].personnel, 'en')} in the third quarter. On average receipts the line comes to ${e(personnelEur, 'en')} a year.` },
      { q: 'Is a part-time dental nurse dearer per hour than a full-time one?', a: `Not at the pay-scale minimum. The general relief is worked out against a minimum wage scaled to the hours worked, so the coefficient does not change. A nurse on ${n(heuresSemaine * 3 / 5, 'en')} hours a week costs exactly three fifths of a full-timer: ${e(coutEmployeur(brutMinimal('assistant_dentaire', PARTIELS[2]), PARTIELS[2]).cout, 'en')} a month against ${e(AD.cout, 'en')}.` },
    ],
    body: (h) => `
<h2>The 2026 pay scale</h2>
<p>Minimum pay for staff in French dental practices comes from the national collective agreement for dental practices, number IDCC 1619. A wage deal signed on 12 February 2026 and extended by ministerial order on 15 July 2026 raised it from 1 January (${h.src('ccn1619Salaires', 'text on Légifrance')}). Each job has an hourly gross rate; monthly pay is that rate times ${h.num(S.heures_mois, 2)} hours, the full-time equivalent of ${h.num(heuresSemaine)} hours a week.</p>
${tGrille('en', h)}
<p>Leaving trainees aside, ${h.num(sousSmicHorsFormation.length)} rates on the scale now sit below the ${h.eur(S.smic_horaire, 2)} hourly Smic that took effect on ${dt(S.smic_depuis, 'en')} (${h.src('spSmic', 'Service-public.gouv.fr')}): ${nomsSousSmic('en')}. Those employees get the Smic. The scale also lists ${h.eur(S.horaire.assistant_formation_moins_26, 2)} and ${h.eur(S.horaire.assistant_formation_26_plus, 2)} an hour for trainee nurses by age band; training contracts have pay rules of their own that this page does not compute.</p>
<h2>From gross pay to employer cost</h2>
<p>Three steps take you there. First add employer contributions for a practice with fewer than 11 staff: ${h.pct(tauxPatronal)} in total below the social security ceiling of ${h.eur(E.plafond_mensuel)} a month, covering health, state pension, family benefits, unemployment insurance, the Agirc-Arrco top-up pension, the pooled share of workplace-accident cover, training and apprenticeship tax, at the rates Urssaf uses for the general relief (${h.src('urssafTaux', 'Urssaf rates')}). Then subtract the RGDU (réduction générale dégressive unique), a sliding relief on employer contributions for modest wages. Its coefficient is ${h.pct(AD.coefRgdu, 2)} of gross pay at the dental nurse minimum and reaches zero at ${h.num(E.rgdu.seuil_smic, 4)} times the Smic (${h.src('urssafRgdu', 'Urssaf')}). For a nurse on the minimum: ${h.eur(AD.brut)} + ${h.eur(AD.cotisations)} − ${h.eur(AD.rgdu)} = ${h.eur(AD.cout)} a month.</p>
<p>The relief is heavy at the bottom of the scale and melts away as pay rises. The table tracks the ratio of cost to gross pay at four pay levels.</p>
${tNiveaux('en', h)}
<p>Close to the Smic the general relief wipes out most employer contributions, so the cost is barely above gross pay. The workplace-accident rate the Carsat notifies to the practice replaces the pooled share used here, and the sector insurance scheme comes on top, so the real cost is somewhat higher than the figure shown. In practice every euro paid above the minimum costs the practice more than one euro plus the headline contribution rate, because the relief falls at the same time. The small calculator above shows the effect for any monthly top-up you enter.</p>
<h2>Part time costs exactly pro rata</h2>
<p>A practice may employ its nurse part time, or share a secretary with a neighbouring dentist. At the pay-scale minimum the cost tracks hours precisely, since the minimum wage used for the relief is itself scaled to the contract.</p>
${tPartiel('en', h)}
<h2>Staff in the practice accounts</h2>
<p>In the ${UNASA_YEAR} UNASA sample, staff costs take ${h.pct(G.personnel)} of receipts: ${h.eur(personnelEur)} out of ${h.eur(G.recettes)} on average. Divided by the yearly cost of a nurse on the minimum, that is about ${h.num(equivalents, 1)} full-time posts, a rough figure because UNASA does not publish headcounts and actual wages may sit above the scale. UNASA’s published year-on-year changes put the staff line at ${sg(evoPers, 'en')} for ${UNASA_YEAR}, against ${sg(evoRec, 'en')} for receipts.</p>
<p>The share grows with practice size: ${h.pct(Q[0].personnel)} in the bottom quarter of receipts, ${h.pct(Q[3].personnel)} in the top one. The ${h.a('taux-de-charges', 'cost ratio')} page sets this line against purchases and rent, and the one on ${h.a('ca-par-fauteuil', 'revenue per dental chair')} helps judge whether a second chair, and usually a second nurse, pays its way.</p>
<h2>What the figure leaves out</h2>
<ul>
<li>The workplace-accident and occupational-disease rate, notified to each practice every year by the regional insurer (Carsat).</li>
<li>The sector’s compulsory protection and health insurance schemes, whose employer share is extra.</li>
<li>Bonuses, seniority, overtime and the extra qualification allowances in the agreement.</li>
<li>Payroll tax (taxe sur les salaires), which depends on the practice’s tax position and is not modelled.</li>
</ul>
<p>So the result is a floor for budgeting a hire, not a payslip. This site is not a payroll bureau or an accountant.</p>`,
  },
});
