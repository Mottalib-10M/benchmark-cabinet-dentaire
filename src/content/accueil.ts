/**
 * Accueil (page pilier, RECETTE §5) : le texte des deux langues. Chaque chiffre vient des fichiers de
 * données (ameli.json, unasa.json, params-2026.json) par le code ; aucun n'est tapé à la main.
 */
import type { PageText } from '../lib/guide-types';
import { FR, DEPS, REGS, DATA_YEAR, depName, DEP_CODES } from '../lib/engine/data';
import { classement, densiteHonoraires, depShare } from '../lib/engine/benchmark';
import { reference, UNASA_YEAR } from '../lib/engine/references';
import { DEP_PAGES, SEUIL } from '../lib/departements';
import { regLabel } from '../lib/dep-fr';
import { P } from '../lib/engine/params';
import { formatMoney, formatPercent, formatNumber, formatDecimal } from '../lib/format';

type Home = Omit<PageText, 'slug' | 'nav' | 'card'>;
type L = 'fr' | 'en';
const Y = DATA_YEAR;
const o = FR.p.omni!, d = FR.p.odf!, s = FR.p.stomato!;
const co = classement('omni');
const corr = densiteHonoraires('omni');
const U = reference('omni'), UO = reference('odf');
const Q = P.revenus.drees.quantiles;
const e = (x: number, l: L) => formatMoney(x, 0, l);
const p = (x: number, l: L, dd = 0) => formatPercent(x, dd, l);
const n = (x: number, l: L, dd = 0) => formatNumber(x, dd, l);
const r2 = (x: number, l: L) => formatDecimal(x, 2, l);
const evol = (a: number, b: number) => b / a - 1;
const sg = (x: number, l: L) => `${x >= 0 ? '+' : '−'}${p(Math.abs(x), l, 1)}`;
const paris = DEPS['75'].p.omni!, haut = co[0];

/** Liste des pages département, groupées par région (bloc de liens : mobilier, data-chrome). */
function depLinks(l: L): string {
  const byReg = new Map<string, typeof DEP_PAGES>();
  for (const dp of DEP_PAGES) { const r = DEPS[dp.code].region ?? ''; byReg.set(r, [...(byReg.get(r) ?? []), dp]); }
  const regs = [...byReg.keys()].sort((a, b) => regLabel(REGS[a]?.name ?? '').localeCompare(regLabel(REGS[b]?.name ?? ''), 'fr'));
  return `<div class="not-prose my-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3" data-chrome>${regs.map((r) => `<div><p class="text-sm font-semibold text-navy-900">${regLabel(REGS[r]?.name ?? '')}</p><p class="mt-1 text-sm leading-7">${byReg.get(r)!.map((dp) => `<a class="text-accent-700 underline" href="/${l}/${dp.slug[l]}/">${dp.name}</a>`).join(' · ')}</p></div>`).join('')}</div>`;
}

const tableSpecs = (l: L) => {
  const rows = ([['omni', l === 'fr' ? 'Omnipraticiens' : 'General dentists', o], ['odf', l === 'fr' ? 'Orthodontistes (ODF)' : 'Orthodontists (ODF)', d], ['stomato', l === 'fr' ? 'Stomatologues (médecins)' : 'Stomatologists (doctors)', s]] as const)
    .map(([, lab, x]) => [lab, n(x.eff!, l), e(x.hsd!, l), e(x.dep!, l), `<strong>${e(x.tot!, l)}</strong>`, n(x.patients!, l), p(x.p60!, l)]);
  const th = l === 'fr' ? ['Spécialité', 'Praticiens libéraux', 'Au tarif de convention', 'Dépassements', 'Honoraires moyens', 'Patients par an', '60 ans et plus'] : ['Specialty', 'Private practitioners', 'At agreed tariff', 'Extra fees', 'Average fees', 'Patients a year', 'Aged 60+'];
  return { th, rows };
};
const hist = (l: L) => ['2015', '2019', '2020', '2021', '2023', String(Y)].map((y) => [y, e(o.hist[y], l), e(d.hist[y], l), e(s.hist[y], l)]);

export const HOME: Record<L, Home> = {
  fr: {
    title: `Honoraires dentiste ${Y} : votre cabinet face au département`,
    description: `Comparez honoraires, bénéfice et ratios de votre cabinet dentaire aux moyennes ${Y} de l'Assurance Maladie de votre département. Gratuit, sans inscription.`,
    h1: 'Votre cabinet face aux autres, et quoi faire pour progresser',
    intro: `Vos chiffres face aux moyennes ${Y} de l'Assurance Maladie et aux comptes de la profession, puis vos trois priorités chiffrées et un plan d'action.`,
    resume: `En ${Y}, un chirurgien-dentiste omnipraticien libéral a perçu ${e(o.tot!, 'fr')} d'honoraires en moyenne, un orthodontiste ${e(d.tot!, 'fr')} et un stomatologue ${e(s.tot!, 'fr')}, selon l'open data de l'Assurance Maladie publié le 12 octobre 2026. Ces moyennes varient fortement d'un département à l'autre : de ${e(co[co.length - 1].tot, 'fr')} à ${e(co[0].tot, 'fr')} pour les omnipraticiens. Le comparateur place vos propres honoraires face à la moyenne de votre spécialité dans votre département, votre région et la France, après avoir retiré les actes non remboursables que ces statistiques ignorent. Il estime ensuite votre bénéfice et votre taux de charges à partir des comptes ${UNASA_YEAR} de ${n(U.echantillon, 'fr')} cabinets dentaires (UNASA), situe ce bénéfice dans la distribution des revenus des dentistes publiée par la DREES, et calcule vos honoraires par fauteuil, par jour et par salarié. Aucune donnée ne quitte votre navigateur.`,
    faqs: [
      { q: 'Quel est le chiffre d’affaires moyen d’un cabinet dentaire en France ?', a: `L'Assurance Maladie publie des honoraires par praticien, pas par cabinet : ${e(o.tot!, 'fr')} en moyenne pour un omnipraticien actif à part entière en ${Y}, dont ${e(o.dep!, 'fr')} de dépassements. Les comptes ${UNASA_YEAR} de ${n(U.echantillon, 'fr')} chirurgiens-dentistes adhérents de l'UNASA donnent ${e(U.recettes, 'fr')} de recettes nettes moyennes, actes non remboursables compris. Un cabinet de groupe additionne les recettes de chacun de ses praticiens.` },
      { q: 'Mes honoraires sont sous la moyenne de mon département : est-ce un mauvais signe ?', a: `Pas forcément. La moyenne porte sur des praticiens actifs toute l'année et de moins de 65 ans, souvent à temps plein. Un exercice sur quatre jours, une activité salariée en parallèle ou une installation récente expliquent un écart. Les implants et la parodontie ne figurent pas dans ces statistiques : le comparateur les retire de vos honoraires avant de comparer, sinon un cabinet orienté implantologie paraîtrait au-dessus de la moyenne pour une mauvaise raison.` },
      { q: 'Le comparateur donne-t-il un percentile de mes honoraires ?', a: `Non, parce que l'Assurance Maladie ne publie que des moyennes par territoire, aucune distribution des honoraires. Le site compte en revanche combien de départements ont une moyenne inférieure à la vôtre, et situe votre bénéfice dans la distribution des revenus 2021 des dentistes libéraux publiée par la DREES : médiane ${e(Q.mediane, 'fr')}, premier décile ${e(Q.d1, 'fr')}, neuvième décile ${e(Q.d9, 'fr')}.` },
      { q: 'Quel taux de charges pour un cabinet dentaire ?', a: `${p(U.taux, 'fr', 1)} des recettes en moyenne, cotisations sociales personnelles comprises, d'après les comptes ${UNASA_YEAR} de ${n(U.echantillon, 'fr')} cabinets de chirurgiens-dentistes suivis par les organismes de gestion de l'UNASA. Il reste donc un bénéfice de ${p(1 - U.taux, 'fr', 1)}, soit ${e(U.benefice, 'fr')} en moyenne. Les orthodontistes affichent ${p(UO.taux, 'fr', 1)}, sur un échantillon de ${n(UO.echantillon, 'fr')} cabinets seulement.` },
      { q: 'D’où viennent les chiffres du comparateur ?', a: `Les moyennes par département viennent de l'open data de l'Assurance Maladie (data.ameli.fr, système national des données de santé, année ${Y}). Les charges viennent des statistiques professionnelles ${UNASA_YEAR} de l'UNASA, les revenus de la DREES (2021) et de l'Insee (2022), les cotisations de la CARCDSF et de l'Urssaf, les salaires de la convention collective des cabinets dentaires. La page méthode détaille chaque source et chaque limite.` },
      { q: 'Mes saisies sont-elles enregistrées quelque part ?', a: 'Non, tant que vous ne le demandez pas. Le diagnostic et le comparateur calculent tout dans votre navigateur, sans compte. Le lien de partage garde vos réponses dans l’adresse de la page, et seulement si vous le copiez. Une seule chose part vers un serveur : la demande d’échange, si vous la remplissez, avec vos coordonnées et votre rapport. La page Confidentialité dit ce qui en est fait et combien de temps.' },
      { q: 'Combien de chirurgiens-dentistes libéraux exercent en France ?', a: `${n(o.eff!, 'fr')} omnipraticiens et ${n(d.eff!, 'fr')} orthodontistes libéraux étaient actifs fin ${Y} selon l'Assurance Maladie, soit ${n(FR.p.ensemble!.eff!, 'fr')} chirurgiens-dentistes, auxquels s'ajoutent ${n(s.eff!, 'fr')} médecins stomatologues. L'effectif des omnipraticiens a progressé de ${p(evol(o.eff5!, o.eff!), 'fr', 1)} en cinq ans, quand celui des orthodontistes est resté presque stable.` },
    ],
    body: (h) => `
<h2>Ce que le comparateur compare, et avec quoi</h2>
<p>Le point de départ est votre activité personnelle de l'année : les honoraires que vous avez encaissés, tous actes confondus, tels qu'ils figurent sur votre relevé de recettes ou la ligne des recettes de votre déclaration 2035. L'Assurance Maladie ne connaît pas tout ce chiffre. Elle enregistre les actes inscrits à la classification commune des actes médicaux, au tarif de convention et avec leurs dépassements, mais pas les soins totalement libres : implants, parodontie non prise en charge, orthodontie commencée après 16 ans, blanchiment. La DREES le rappelle dans les comptes de la santé : ces actes sont « très mal mesurés par la statistique publique ». Le comparateur vous demande donc leur part, la retire, et compare le reste, à périmètre égal, avec trois moyennes : celle de votre spécialité dans votre département, dans votre région et en France.</p>
<p>Les moyennes sont celles des praticiens « actifs à part entière » : moins de 65 ans, une année complète d'exercice libéral dans le cadre de la convention. Les nouveaux installés de l'année, les plus de 65 ans et les praticiens hospitaliers qui consultent en libéral à l'hôpital n'y figurent pas. C'est une population plutôt à plein régime, ce qu'il faut garder en tête quand on exerce à temps partiel.</p>
<p>Viennent ensuite les ratios de gestion : honoraires par fauteuil, par jour travaillé, par salarié en équivalent temps plein, part du personnel, du laboratoire de prothèse et du loyer dans les recettes. Si vous saisissez vos charges, le bénéfice est le vôtre ; sinon, il est estimé avec le taux de charges des cabinets de taille comparable, tiré des comptes ${UNASA_YEAR} des adhérents de l'UNASA, la fédération des organismes de gestion agréés. Enfin, ce bénéfice est situé dans la distribution des revenus des dentistes libéraux publiée par la DREES.</p>

<h2>Pourquoi le département change tout</h2>
<p>Deux omnipraticiens qui facturent exactement la même chose ne sont pas au même endroit selon leur département. Avec ${e(paris.tot!, 'fr')} d'honoraires moyens, Paris a la moyenne la plus basse de France ; ${depName(haut.code)} a la plus haute, ${e(haut.tot, 'fr')}, ${r2(haut.tot / paris.tot!, 'fr')} fois plus. Un cabinet à ${e(o.tot!, 'fr')} est donc ${p(o.tot! / paris.tot! - 1, 'fr')} au-dessus de la moyenne parisienne et ${p(1 - o.tot! / haut.tot, 'fr')} en dessous de celle de ${depName(haut.code)}.</p>
<p>La raison principale n'est pas la richesse des patients mais le nombre de praticiens. Nous avons calculé, sur les ${n(corr.n, 'fr')} départements de métropole, le coefficient de corrélation entre la densité d'omnipraticiens pour 100 000 habitants et leurs honoraires moyens : ${r2(corr.r, 'fr')}. Plus un département est dense, plus la demande se partage, plus la moyenne par praticien baisse. Paris compte ${n(paris.dens!, 'fr')} omnipraticiens pour 100 000 habitants, la France ${n(o.dens!, 'fr')}. C'est aussi pour cela qu'une comparaison avec une moyenne nationale, la seule que donnent la plupart des articles sur le sujet, renseigne si peu : elle mélange des marchés qui n'ont rien à voir.</p>
<p>Les ${n(DEP_PAGES.length, 'fr')} départements qui comptent au moins ${n(SEUIL, 'fr')} chirurgiens-dentistes libéraux ont leur propre page, avec la répartition des honoraires, l'âge des praticiens, l'historique depuis 2015 et le comparateur réglé sur le territoire. Les autres restent dans le comparateur et dans le ${h.a('classement-departements', 'classement des 101 départements')}.</p>

<h2>Trois spécialités, trois échelles</h2>
${h.table(tableSpecs('fr').th, tableSpecs('fr').rows, `France entière, ${Y}. Honoraires moyens par praticien actif à part entière. Source : Assurance Maladie, data.ameli.fr.`, ['l', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>L'orthodontie est un autre métier économique : les dépassements y représentent ${p(depShare(d)!, 'fr')} des honoraires, contre ${p(depShare(o)!, 'fr')} chez les omnipraticiens, parce que les traitements se facturent largement au-dessus de la base de remboursement. Les stomatologues sont des médecins spécialistes de la bouche et des mâchoires ; leur population vieillit (${p(s.p60!, 'fr')} ont 60 ans ou plus) et diminue. La chirurgie orale et la médecine bucco-dentaire, spécialités de chirurgiens-dentistes, n'ont pas de statistique propre : l'Assurance Maladie les compte avec les omnipraticiens. Le détail de chaque spécialité est sur les pages ${h.a('omnipraticien', 'omnipraticien')}, ${h.a('orthodontiste', 'orthodontiste')} et ${h.a('stomatologue', 'stomatologue et chirurgie orale')}.</p>

<h2>Des honoraires au bénéfice</h2>
<p>Sur ${e(U.recettes, 'fr')} de recettes nettes moyennes, les ${n(U.echantillon, 'fr')} cabinets de chirurgiens-dentistes de l'échantillon UNASA ${UNASA_YEAR} gardent ${e(U.benefice, 'fr')} de bénéfice, ${p(1 - U.taux, 'fr', 1)}. Les achats (fournitures, et vraisemblablement la prothèse sous-traitée) pèsent ${p(U.achats, 'fr', 1)} des recettes, le personnel ${p(U.personnel, 'fr', 1)}, le loyer ${p(U.loyer, 'fr', 1)}, les cotisations sociales personnelles et la CSG déductible ${p(U.cotisPerso, 'fr', 1)}. Le comparateur compare votre taux à celui des cabinets du même quart de recettes, car la structure change avec la taille : les plus petits cabinets paient proportionnellement plus de loyer et de cotisations, les plus gros plus de personnel. Le guide sur le ${h.a('taux-de-charges', 'taux de charges')} en donne le détail, celui sur la ${h.a('salaire-assistante-dentaire', 'rémunération d’une assistante dentaire')} chiffre le poste le plus lourd après les achats.</p>
<!--mini:tauxCharges-->

<h2>Situer son revenu</h2>
<p>Pour le revenu, une distribution existe. La DREES a publié en septembre 2026 les revenus d'activité ${P.revenus.drees.annee} des chirurgiens-dentistes libéraux : moyenne ${e(P.revenus.drees.moyen, 'fr')}, médiane ${e(Q.mediane, 'fr')}, un quart des praticiens sous ${e(Q.q1, 'fr')}, un quart au-dessus de ${e(Q.q3, 'fr')}, un sur dix au-delà de ${e(Q.d9, 'fr')}. L'écart entre femmes (${e(P.revenus.drees.femmes, 'fr')}) et hommes (${e(P.revenus.drees.hommes, 'fr')}) reste large. Le comparateur interpole entre ces points publiés pour situer votre bénéfice ; au-delà du neuvième décile ou sous le premier, il ne dit rien de plus, faute de source. Le guide sur le ${h.a('revenu-dentiste', 'revenu des dentistes')} détaille ces chiffres et ceux de l'Insee.</p>

<h2>Dix ans d'honoraires moyens</h2>
${h.table(['Année', 'Omnipraticiens', 'Orthodontistes', 'Stomatologues'], hist('fr'), 'France entière, honoraires totaux moyens par praticien actif à part entière, euros courants.', ['l', 'r', 'r', 'r'])}
<p>Entre 2015 et ${Y}, les honoraires moyens ont progressé de ${sg(evol(o.hist['2015'], o.tot!), 'fr')} chez les omnipraticiens et de ${sg(evol(d.hist['2015'], d.tot!), 'fr')} chez les orthodontistes, en euros courants. La baisse de 2020 coïncide avec la fermeture des cabinets au printemps, hors urgences ; le rebond de 2021 avec la montée en charge du 100 % Santé dentaire, qui a encadré les prix de nombreuses prothèses. Depuis, la moyenne des omnipraticiens progresse lentement : ${sg(evol(o.hist['2023'], o.tot!), 'fr')} entre 2023 et ${Y}.</p>

<h2>Ce que ces chiffres ne disent pas</h2>
<p>Une moyenne n'est pas une norme. Elle ne dit ni la dispersion, que l'Assurance Maladie ne publie pas pour les honoraires, ni la qualité des soins, ni la rentabilité d'un cabinet en particulier. Quand un département compte moins de cinq praticiens d'une spécialité, rien n'est publié : c'est le secret statistique, et le comparateur passe alors à la moyenne régionale. Les stomatologues n'ont pas de statistique de charges publique : la référence des chirurgiens-dentistes est utilisée, et signalée. Le résultat est une estimation indicative, qui ne remplace ni l'avis de votre expert-comptable ni votre association de gestion agréée. La ${h.a('method', 'méthode')} liste toutes les sources, les formules et les tests.</p>

<h2>Les départements détaillés</h2>
${depLinks('fr')}`,
  },
  en: {
    title: `Dentist fees France ${Y}: benchmark your practice locally`,
    description: `Benchmark your French dental practice’s fees, profit and ratios against ${Y} Assurance Maladie averages for your département and specialty. Free, no sign-up.`,
    h1: 'Your practice against the rest, and what to do next',
    intro: `Your figures against ${Y} Assurance Maladie averages and the profession’s accounts, then your three priced priorities and an action plan.`,
    resume: `In ${Y}, a general dentist in private practice in France billed ${e(o.tot!, 'en')} in fees on average, an orthodontist ${e(d.tot!, 'en')} and a stomatologist ${e(s.tot!, 'en')}, according to Assurance Maladie open data released on 12 October 2026. Those averages swing widely between départements, from ${e(co[co.length - 1].tot, 'en')} to ${e(co[0].tot, 'en')} for general dentists. The fee benchmark sets your own fees against the average for your specialty in your département, your region and France, after removing the non-reimbursable work those statistics never see. It then estimates your profit and cost ratio from the ${UNASA_YEAR} accounts of ${n(U.echantillon, 'en')} dental practices (UNASA), places that profit in the DREES distribution of dentists’ income, and works out fees per chair, per day and per staff member. Nothing you type leaves your browser.`,
    faqs: [
      { q: 'What does an average dental practice in France take in a year?', a: `Assurance Maladie publishes fees per practitioner, not per practice: ${e(o.tot!, 'en')} on average for a full-time active general dentist in ${Y}, of which ${e(o.dep!, 'en')} is extra fees. The ${UNASA_YEAR} accounts of ${n(U.echantillon, 'en')} dentists in UNASA management associations show ${e(U.recettes, 'en')} of average net receipts, non-reimbursable work included. A group practice adds up the receipts of each practitioner.` },
      { q: 'My fees are below my département average. Should I worry?', a: `Not necessarily. The average covers practitioners active for the whole year and under 65, mostly full time. A four-day week, a salaried job alongside, or a recent start all explain a gap. Implants and periodontics are missing from these statistics, which is why the fee benchmark removes them from your fees first; otherwise an implant-heavy practice would look above average for the wrong reason.` },
      { q: 'Can I get my percentile among French dentists by fees?', a: `Not by fees: Assurance Maladie publishes only averages by area, no distribution. The site instead counts how many départements have a lower average than yours, and places your profit in the DREES distribution of 2021 private dentists’ income: median ${e(Q.mediane, 'en')}, bottom decile ${e(Q.d1, 'en')}, top decile ${e(Q.d9, 'en')}, interpolated between those published points.` },
      { q: 'What cost ratio is normal for a French dental practice?', a: `${p(U.taux, 'en', 1)} of receipts on average, personal social contributions included, according to the ${UNASA_YEAR} accounts of ${n(U.echantillon, 'en')} dental practices followed by UNASA management associations. That leaves ${p(1 - U.taux, 'en', 1)} as profit, or ${e(U.benefice, 'en')} on average. Orthodontists show ${p(UO.taux, 'en', 1)}, but from a sample of only ${n(UO.echantillon, 'en')} practices.` },
      { q: 'Where do the benchmark figures come from?', a: `Département averages come from Assurance Maladie open data (data.ameli.fr, built from the national health data system, ${Y} figures). Costs come from UNASA’s ${UNASA_YEAR} professional statistics, income from DREES (2021) and Insee (2022), contributions from CARCDSF and Urssaf, staff pay from the dental practices’ collective agreement. The method page lists each source and each limit.` },
      { q: 'Is anything I enter stored or sent?', a: 'Not unless you ask. The check-up and the fee benchmark compute everything in your browser, with no account. The share link keeps your answers in the page address, and only if you copy it. One thing alone reaches a server: the call request, if you fill it in, with your contact details and your report. The Privacy page explains what happens to it and for how long.' },
      { q: 'How many dentists are in private practice in France?', a: `Assurance Maladie counted ${n(o.eff!, 'en')} general dentists and ${n(d.eff!, 'en')} orthodontists in private practice at the end of ${Y}, ${n(FR.p.ensemble!.eff!, 'en')} dentists in all, plus ${n(s.eff!, 'en')} stomatologists, who are doctors. General dentist numbers grew by ${p(evol(o.eff5!, o.eff!), 'en', 1)} in five years while orthodontists stayed almost flat.` },
    ],
    body: (h) => `
<h2>What the fee benchmark compares, and against what</h2>
<p>You start from your own activity for the year: the fees you collected, all procedures included, as shown in your receipts ledger or the receipts line of your 2035 return (the sole-practice profit form). Assurance Maladie, the national health insurer, does not see all of that. It records procedures listed in the national procedure classification, at the agreed tariff and with any extra fees, but not freely priced care: implants, unreimbursed periodontics, orthodontics started after 16, whitening. DREES, the health ministry’s statistics office, says these are “very poorly measured by public statistics”. So the fee benchmark asks for that share, removes it, and compares the rest, like for like, with three averages: your specialty in your département, in your region and in France.</p>
<p>The averages cover “full-time active” practitioners: under 65, with a full year of private practice under the national agreement. Newly installed dentists, those over 65 and hospital doctors seeing private patients in hospital are left out. It is a population working close to capacity, worth remembering if you practise part time.</p>
<p>Then come management ratios: fees per chair, per day worked, per full-time staff member, and the weight of staff, dental laboratory and rent in receipts. Enter your costs and the profit is yours; leave them blank and it is estimated with the cost ratio of practices of a similar size, taken from the ${UNASA_YEAR} accounts of members of UNASA, the federation of approved management associations. Finally, that profit is placed in the DREES distribution of private dentists’ income.</p>

<h2>Why the département matters so much</h2>
<p>Two general dentists billing exactly the same amount sit in very different places depending on where they work. At ${e(paris.tot!, 'en')}, Paris has the lowest average in France; ${depName(haut.code)} has the highest, ${e(haut.tot, 'en')}, ${r2(haut.tot / paris.tot!, 'en')} times as much. A practice at ${e(o.tot!, 'en')} is ${p(o.tot! / paris.tot! - 1, 'en')} above the Paris average and ${p(1 - o.tot! / haut.tot, 'en')} below the ${depName(haut.code)} one.</p>
<p>The driver is less patients’ wealth than the number of dentists. Across the ${n(corr.n, 'en')} départements of mainland France, we computed the correlation between general dentists per 100,000 residents and their average fees: ${r2(corr.r, 'en')}. The denser the département, the more demand is shared and the lower the average per dentist. Paris has ${n(paris.dens!, 'en')} general dentists per 100,000 people, France ${n(o.dens!, 'en')}. It is also why the national average quoted in most articles on the subject tells you so little: it blends markets that have nothing in common.</p>
<p>The ${n(DEP_PAGES.length, 'en')} départements with at least ${n(SEUIL, 'en')} dentists in private practice have their own page, with the split of fees, practitioners’ ages, history since 2015 and the fee benchmark set to that area. The rest stay in the fee benchmark and in the ${h.a('classement-departements', 'ranking of all 101 départements')}.</p>

<h2>Three specialties, three scales</h2>
${h.table(tableSpecs('en').th, tableSpecs('en').rows, `France, ${Y}. Average fees per full-time active practitioner. Source: Assurance Maladie, data.ameli.fr.`, ['l', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>Orthodontics is a different business: extra fees make up ${p(depShare(d)!, 'en')} of fees against ${p(depShare(o)!, 'en')} for general dentists, because treatment is largely billed above the reimbursement base. Stomatologists are doctors specialised in the mouth and jaws; they are ageing (${p(s.p60!, 'en')} are 60 or older) and their number is falling. Oral surgery and oral medicine, two dental specialties, have no statistics of their own: Assurance Maladie counts them with general dentists. Each specialty has its own page: ${h.a('omnipraticien', 'general dentist')}, ${h.a('orthodontiste', 'orthodontist')} and ${h.a('stomatologue', 'stomatologist and oral surgery')}.</p>

<h2>From fees to profit</h2>
<p>On ${e(U.recettes, 'en')} of average net receipts, the ${n(U.echantillon, 'en')} dental practices in the ${UNASA_YEAR} UNASA sample keep ${e(U.benefice, 'en')} as profit, ${p(1 - U.taux, 'en', 1)}. Purchases (supplies, and probably outsourced prosthetics) take ${p(U.achats, 'en', 1)} of receipts, staff ${p(U.personnel, 'en', 1)}, rent ${p(U.loyer, 'en', 1)}, personal social contributions and deductible CSG ${p(U.cotisPerso, 'en', 1)}. The fee benchmark compares your ratio with practices in the same quarter of receipts, because the structure shifts with size: the smallest practices pay proportionally more rent and contributions, the largest more staff. The guide to the ${h.a('taux-de-charges', 'cost ratio')} has the detail, and the one on ${h.a('salaire-assistante-dentaire', 'dental nurse pay')} prices the biggest line after purchases.</p>
<!--mini:tauxCharges-->

<h2>Placing your income</h2>
<p>For income, a distribution does exist. In September 2026 DREES published ${P.revenus.drees.annee} earnings of private dentists: average ${e(P.revenus.drees.moyen, 'en')}, median ${e(Q.mediane, 'en')}, a quarter below ${e(Q.q1, 'en')}, a quarter above ${e(Q.q3, 'en')}, one in ten above ${e(Q.d9, 'en')}. The gap between women (${e(P.revenus.drees.femmes, 'en')}) and men (${e(P.revenus.drees.hommes, 'en')}) remains wide. The fee benchmark interpolates between those published points to place your profit; above the top decile or below the bottom one it says nothing more, as no source does. The guide to ${h.a('revenu-dentiste', 'dentists’ income')} covers these figures and Insee’s.</p>

<h2>Ten years of average fees</h2>
${h.table(['Year', 'General dentists', 'Orthodontists', 'Stomatologists'], hist('en'), 'France, average total fees per full-time active practitioner, current euros.', ['l', 'r', 'r', 'r'])}
<p>Between 2015 and ${Y}, average fees rose by ${sg(evol(o.hist['2015'], o.tot!), 'en')} for general dentists and ${sg(evol(d.hist['2015'], d.tot!), 'en')} for orthodontists, in current euros. The 2020 dip matches the spring closure of practices outside emergencies; the 2021 rebound matches the roll-out of “100% Santé” dental care, which capped prices on many crowns and dentures. Since then the general dentist average has crept up: ${sg(evol(o.hist['2023'], o.tot!), 'en')} between 2023 and ${Y}.</p>

<h2>What these figures do not tell you</h2>
<p>An average is not a standard. It shows neither the spread, which Assurance Maladie does not publish for fees, nor quality of care, nor how profitable any one practice is. Where a département has fewer than five practitioners in a specialty, nothing is published (statistical confidentiality), and the fee benchmark falls back on the regional average. No public cost statistics exist for stomatologists, so the dentists’ benchmark is used and flagged. Results are indicative estimates and replace neither your accountant nor your approved management association. The ${h.a('method', 'method')} lists every source, formula and test.</p>

<h2>Départements in detail</h2>
${depLinks('en')}`,
  },
};

void DEP_CODES;
