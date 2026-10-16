import { defineGuide } from '../../lib/guide-types';
import { classement, densiteHonoraires, METRO } from '../../lib/engine/benchmark';
import { DEPS, FR, DATA_YEAR, depName, DEP_CODES } from '../../lib/engine/data';
import { DEP_PAGES, depPageByCode, SEUIL, ancreDep } from '../../lib/departements';
import { dansDep } from '../../lib/dep-fr';
import { formatMoney, formatNumber, formatDecimal, formatPercent } from '../../lib/format';

const Y = DATA_YEAR;
const co = classement('omni'); const cd = classement('odf');
const top = co.slice(0, 5); const bas = co.slice(-5).reverse();
const corrO = densiteHonoraires('omni'); const corrD = densiteHonoraires('odf');
const fo = FR.p.omni!; const fd = FR.p.odf!;
const outremer = DEP_CODES.filter((c) => c.length === 3);
const ecart = co[0].tot / co[co.length - 1].tot;
const couverts = DEP_PAGES.reduce((s, p) => s + (DEPS[p.code].p.ensemble?.eff ?? 0), 0) / (FR.p.ensemble!.eff ?? 1);
const lien = (c: string, l: 'fr' | 'en') => { const p = depPageByCode(c); const n = depName(c); return p ? `<a href="/${l}/${p.slug[l]}/">${n}</a>` : n; };
const e = (x: number, l: 'fr' | 'en') => formatMoney(x, 0, l);
const n = (x: number, l: 'fr' | 'en', d = 0) => formatNumber(x, d, l);
const r2 = (x: number, l: 'fr' | 'en') => formatDecimal(x, 2, l);

const table = (l: 'fr' | 'en') => {
  const rows = DEP_CODES.map((c) => { const o = DEPS[c].p.omni; const d = DEPS[c].p.odf; return { c, o: o?.tot ?? 0, eff: o?.eff ?? 0, dens: o?.dens ?? 0, d: d?.tot ?? 0 }; }).sort((a, b) => b.o - a.o);
  const th = l === 'fr' ? ['Rang', 'Département', 'Omnipraticiens', 'Pour 100 000 hab.', 'Honoraires moyens', 'Orthodontistes : honoraires moyens'] : ['Rank', 'Département', 'General dentists', 'Per 100,000', 'Average fees', 'Orthodontists: average fees'];
  return `<figure class="not-prose my-6"><figcaption class="mb-2 text-left text-sm text-navy-600">${l === 'fr' ? `Honoraires totaux moyens ${Y} par praticien actif à part entière, classés par moyenne des omnipraticiens. « – » : secret statistique (moins de 5 praticiens).` : `${Y} average total fees per full-time active practitioner, ranked by general dentists’ average. “–”: statistical confidentiality (fewer than 5 practitioners).`}</figcaption><div class="overflow-x-auto" data-sommaire><table class="journal w-full text-sm"><thead><tr>${th.map((x, i) => `<th scope="col" class="px-3 py-2 ${i > 1 ? 'text-right' : 'text-left'}">${x}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr id="${ancreDep(r.c)}"><td class="tabular-nums border-b border-navy-100 px-3 py-2">${i + 1}</td><td class="border-b border-navy-100 px-3 py-2">${lien(r.c, l)}</td><td class="tabular-nums border-b border-navy-100 px-3 py-2 text-right">${n(r.eff, l)}</td><td class="tabular-nums border-b border-navy-100 px-3 py-2 text-right">${n(r.dens, l)}</td><td class="tabular-nums border-b border-navy-100 px-3 py-2 text-right">${r.o ? e(r.o, l) : '–'}</td><td class="tabular-nums border-b border-navy-100 px-3 py-2 text-right">${r.d ? e(r.d, l) : '–'}</td></tr>`).join('')}</tbody></table></div></figure>`;
};

/**
 * Second tableau : le profil des omnipraticiens de chaque département (effectif sur cinq ans, part des
 * dépassements, patientèle, âge). Il reprend, pour les 101 départements, les chiffres que portaient les
 * pages département retirées le 2026-10-16 (RECETTE §3) : aucun chiffre n'est perdu pour le visiteur.
 */
const profil = (l: 'fr' | 'en') => {
  const p = (x: number | null | undefined) => (x == null ? '–' : formatPercent(x, 0, l));
  const v = (x: number | null | undefined) => (x == null ? '–' : n(x, l));
  const rows = [...DEP_CODES].sort((a, b) => depName(a).localeCompare(depName(b), 'fr')).map((c) => {
    const o = DEPS[c].p.omni; const sh = o?.tot && o.dep != null ? o.dep / o.tot : null;
    return [lien(c, l), v(o?.eff5), v(o?.eff), p(sh), v(o?.patients), p(o?.p60), p(o?.m35), o?.hist?.['2015'] ? e(o.hist['2015'], l) : '–'];
  });
  const th = l === 'fr' ? ['Département', `Omnipraticiens ${Y - 5}`, `Omnipraticiens ${Y}`, 'Part des dépassements', 'Patients par an', '60 ans et plus', 'Moins de 35 ans', 'Honoraires moyens 2015'] : ['Département', `General dentists ${Y - 5}`, `General dentists ${Y}`, 'Share of extra fees', 'Patients a year', 'Aged 60+', 'Under 35', 'Average fees 2015'];
  return `<figure class="not-prose my-6"><figcaption class="mb-2 text-left text-sm text-navy-600">${l === 'fr' ? `Omnipraticiens libéraux par département, ordre alphabétique : effectif fin ${Y - 5} et fin ${Y}, part des dépassements dans les honoraires ${Y}, patients différents par praticien, âge. « – » : non publié.` : `General dentists in private practice by département, alphabetical: headcount at the end of ${Y - 5} and ${Y}, share of extra fees in ${Y} fees, distinct patients per practitioner, age. “–”: not published.`}</figcaption><div class="overflow-x-auto"><table class="journal w-full text-sm"><thead><tr>${th.map((x, i) => `<th scope="col" class="px-3 py-2 ${i > 0 ? 'text-right' : 'text-left'}">${x}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((x, i) => `<td class="${i > 0 ? 'tabular-nums text-right ' : ''}border-b border-navy-100 px-3 py-2">${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div></figure>`;
};

export default defineGuide({
  id: 'classement-departements',
  group: 'territoires',
  order: 10,
  mini: 'rangDepartement',
  related: ['omnipraticien', 'orthodontiste', 'taux-de-charges', 'revenu-dentiste'],
  sources: ['ameliHonoraires', 'ameliEffectifs'],
  fr: {
    slug: 'honoraires-dentistes-par-departement',
    nav: 'Classement des départements',
    card: 'Les honoraires moyens des dentistes et orthodontistes dans les 101 départements.',
    title: `Honoraires dentiste par département ${Y} : le classement`,
    description: `Honoraires moyens ${Y} des dentistes dans les 101 départements, de ${e(co[co.length - 1].tot, 'fr')} à ${e(co[0].tot, 'fr')} : classement complet, orthodontistes, densité, données Ameli.`,
    h1: 'Les honoraires des dentistes, département par département',
    intro: `Le classement ${Y} des 101 départements, d'après l'open data de l'Assurance Maladie.`,
    resume: `En ${Y}, un chirurgien-dentiste omnipraticien a perçu en moyenne ${e(fo.tot!, 'fr')} d'honoraires en France, mais la moyenne va de ${e(co[co.length - 1].tot, 'fr')} ${dansDep(co[co.length - 1].code)} à ${e(co[0].tot, 'fr')} ${dansDep(co[0].code)}, soit un rapport de ${r2(ecart, 'fr')}. Ce classement ne mesure pas des cabinets plus ou moins bien gérés : il suit d'abord la densité. Sur les ${n(corrO.n, 'fr')} départements de métropole, le coefficient de corrélation entre le nombre d'omnipraticiens pour 100 000 habitants et leurs honoraires moyens vaut ${r2(corrO.r, 'fr')} : là où les dentistes sont rares, chacun facture davantage. Les orthodontistes suivent la même pente (${r2(corrD.r, 'fr')}), avec une moyenne nationale de ${e(fd.tot!, 'fr')}. Les montants sont des honoraires par praticien actif à part entière, avant charges, et ne comprennent pas les actes non remboursables.`,
    faqs: [
      { q: 'Dans quel département les dentistes ont-ils les honoraires les plus élevés ?', a: `En ${Y}, c'est ${dansDep(top[0].code)} : ${e(top[0].tot, 'fr')} par omnipraticien actif à part entière, devant ${depName(top[1].code)} (${e(top[1].tot, 'fr')}) et ${depName(top[2].code)} (${e(top[2].tot, 'fr')}). Ces départements comptent peu de praticiens par habitant, ce qui concentre la demande. Le montant est une moyenne d'honoraires publiée par l'Assurance Maladie, pas un revenu net.` },
      { q: 'Pourquoi les dentistes de Paris ont-ils des honoraires moyens plus bas ?', a: `Paris compte ${n(DEPS['75'].p.omni!.dens!, 'fr')} omnipraticiens pour 100 000 habitants, presque deux fois la moyenne nationale (${n(fo.dens!, 'fr')}), et la demande s'y partage entre plus de cabinets. L'exercice mixte, libéral et salarié, y concerne ${formatNumber(DEPS['75'].p.omni!.mixte! * 100, 0, 'fr')} % des omnipraticiens, contre ${formatNumber(fo.mixte! * 100, 0, 'fr')} % en France. Résultat : ${e(DEPS['75'].p.omni!.tot!, 'fr')} d'honoraires moyens en ${Y}, la plus basse moyenne de France, sans que cela dise quoi que ce soit d'un cabinet parisien en particulier.` },
      { q: 'Ce classement donne-t-il le revenu des dentistes ?', a: `Non. Il classe des honoraires, c'est-à-dire ce que les praticiens facturent et que l'Assurance Maladie enregistre. Le revenu se calcule après les charges du cabinet (personnel, prothésiste, loyer, matériel) et les cotisations sociales, qui absorbent en général un peu plus de la moitié des recettes. Le simulateur estime ce bénéfice à partir de vos propres chiffres.` },
      { q: 'Combien de départements ont une page détaillée sur ce site ?', a: `${n(DEP_PAGES.length, 'fr')} départements, ceux qui comptent au moins ${n(SEUIL, 'fr')} chirurgiens-dentistes libéraux : ils réunissent ${formatNumber(couverts * 100, 0, 'fr')} % des praticiens. Sous ce seuil, la moyenne repose sur peu de cabinets et l'orthodontie est souvent couverte par le secret statistique ; ces départements restent dans le classement et dans le simulateur.` },
    ],
    body: () => `
<h2>Le haut et le bas du classement</h2>
<p>Les cinq moyennes les plus élevées ${Y} reviennent à ${top.map((x) => `${lien(x.code, 'fr')} (${e(x.tot, 'fr')})`).join(', ')}. Ce sont des départements ruraux ou de petites villes, avec peu de praticiens pour 100 000 habitants. À l'autre bout, ${bas.map((x) => `${lien(x.code, 'fr')} (${e(x.tot, 'fr')})`).join(', ')} : des métropoles attractives, des littoraux et des zones de montagne recherchées, où l'offre de soins est abondante.</p>
<p>Cet écart ne se lit pas comme une prime à la campagne. Une moyenne départementale divise des honoraires totaux par un nombre de praticiens ; quand l'installation est facile et recherchée, le dénominateur grossit plus vite que la demande. Un cabinet bien placé en centre-ville peut dépasser largement la moyenne de son département, comme un cabinet rural peut rester en dessous de la sienne. C'est pour cela que le simulateur compare d'abord à la moyenne de votre département, puis à celles de votre région et de la France.</p>
<h2>L'orthodontie, un autre classement</h2>
<p>Les orthodontistes ne se rangent pas dans le même ordre. ${depName(cd[0].code)} (${e(cd[0].tot, 'fr')}) et ${depName(cd[1].code)} (${e(cd[1].tot, 'fr')}) arrivent en tête, ${depName(cd[cd.length - 1].code)} (${e(cd[cd.length - 1].tot, 'fr')}) ferme la marche, et Paris reste parmi les plus bas (${e(DEPS['75'].p.odf!.tot!, 'fr')}). Les effectifs sont petits : un département de huit orthodontistes peut voir sa moyenne bouger de plusieurs dizaines de milliers d'euros d'une année à l'autre avec un seul départ en retraite. L'Assurance Maladie ne publie aucune moyenne sous cinq praticiens, ce qui laisse ${n(DEP_CODES.length - cd.length, 'fr')} départements sans chiffre pour cette spécialité.</p>
<h2>Outre-mer : des marchés à part</h2>
<p>Les ${n(outremer.length, 'fr')} départements d'outre-mer se classent loin des départements ruraux de métropole malgré des densités parfois faibles : ${outremer.map((c) => `${depName(c)} ${e(DEPS[c].p.omni!.tot!, 'fr')} pour ${n(DEPS[c].p.omni!.dens!, 'fr')} praticiens pour 100 000 habitants`).join(', ')}. Ce sont des marchés insulaires ou isolés, qui ne se comparent pas directement aux départements de métropole. C'est pourquoi la corrélation entre densité et honoraires est calculée sur la seule métropole (${n(METRO.length, 'fr')} départements).</p>
<h2>Le tableau complet</h2>
${table('fr')}
<p>Chaque nom souligné mène à la page du département, avec la répartition des honoraires, l'âge des praticiens, l'historique depuis 2015 et le simulateur déjà réglé sur le territoire. Pour situer votre propre cabinet, partez du ${'<a href="/fr/">simulateur</a>'} : il retire d'abord les actes non remboursables, que ces moyennes ne comptent pas.</p>
<h2>Le profil des omnipraticiens, département par département</h2>
<p>Le second tableau suit les mêmes 101 départements sous un autre angle : combien d'omnipraticiens y exercent, comment l'effectif a bougé en cinq ans, quelle part des honoraires vient des dépassements, combien de patients chaque praticien suit dans l'année et quel est l'âge de la profession. Une part élevée de praticiens de 60 ans et plus annonce des cessions de cabinets ; un effectif qui baisse, une demande qui se reporte sur ceux qui restent. Dans le simulateur, le choix du département règle toutes les références sur le territoire, y compris pour les départements qui n'ont pas de page propre.</p>
${profil('fr')}`,
  },
  en: {
    slug: 'dentist-fees-by-departement',
    nav: 'Ranking of départements',
    card: 'Average fees of dentists and orthodontists in all 101 départements.',
    title: `Dentist fees by département ${Y}: the full French ranking`,
    description: `${Y} average fees of French dentists in all 101 départements, from ${e(co[co.length - 1].tot, 'en')} to ${e(co[0].tot, 'en')}: full ranking, orthodontists, density, Assurance Maladie data.`,
    h1: 'Dentists’ fees in France, département by département',
    intro: `The ${Y} ranking of all 101 départements, from Assurance Maladie open data.`,
    resume: `In ${Y}, a general dentist in France billed ${e(fo.tot!, 'en')} in fees on average, but the département average runs from ${e(co[co.length - 1].tot, 'en')} in ${depName(co[co.length - 1].code)} to ${e(co[0].tot, 'en')} in ${depName(co[0].code)}, a ratio of ${r2(ecart, 'en')}. The ranking does not reward better-run practices: it mostly follows density. Across the ${n(corrO.n, 'en')} départements of mainland France, the correlation between general dentists per 100,000 residents and their average fees is ${r2(corrO.r, 'en')}: where dentists are scarce, each one bills more. Orthodontists follow the same slope (${r2(corrD.r, 'en')}), with a national average of ${e(fd.tot!, 'en')}. Figures are fees per full-time active practitioner (one who worked a full year under the national agreement and is under 65), before practice costs and personal social contributions, and they exclude non-reimbursable work such as implants, periodontics or adult orthodontics, which never reaches health insurance records.`,
    faqs: [
      { q: 'Which French département has the highest dentist fees?', a: `In ${Y} it is ${depName(top[0].code)}: ${e(top[0].tot, 'en')} per full-time active general dentist, ahead of ${depName(top[1].code)} (${e(top[1].tot, 'en')}) and ${depName(top[2].code)} (${e(top[2].tot, 'en')}). These départements have few practitioners per resident, which concentrates demand. The figure is an average of fees published by Assurance Maladie, not take-home pay.` },
      { q: 'Why are average dentist fees in Paris so low?', a: `Paris has ${n(DEPS['75'].p.omni!.dens!, 'en')} general dentists per 100,000 residents, almost twice the national ${n(fo.dens!, 'en')}, so demand is split between more practices, and ${formatNumber(DEPS['75'].p.omni!.mixte! * 100, 0, 'en')}% of them combine private and salaried work, against ${formatNumber(fo.mixte! * 100, 0, 'en')}% nationally. The result is ${e(DEPS['75'].p.omni!.tot!, 'en')} in average fees in ${Y}, the lowest in France, which says nothing about any one Paris practice.` },
      { q: 'Does this ranking show what dentists earn?', a: 'No. It ranks fees: what practitioners bill and Assurance Maladie records. Earnings come after practice costs (staff, dental laboratory, rent, equipment) and social contributions, which usually take a little over half of receipts. The calculator estimates that profit from your own figures, with the reference cost ratio when you leave costs blank.' },
      { q: 'Which départements get their own page on this site?', a: `${n(DEP_PAGES.length, 'en')} départements, those with at least ${n(SEUIL, 'en')} dentists in private practice; together they hold ${formatNumber(couverts * 100, 0, 'en')}% of practitioners. Below that, the average rests on few practices and orthodontics is often hidden by statistical confidentiality; those départements stay in the table and in the calculator.` },
    ],
    body: () => `
<h2>Top and bottom of the table</h2>
<p>The five highest ${Y} averages belong to ${top.map((x) => `${lien(x.code, 'en')} (${e(x.tot, 'en')})`).join(', ')}: rural départements and small towns with few dentists per 100,000 people. At the other end sit ${bas.map((x) => `${lien(x.code, 'en')} (${e(x.tot, 'en')})`).join(', ')}, attractive cities, coastlines and sought-after mountain areas where care is plentiful.</p>
<p>Read the gap as arithmetic rather than a rural bonus. A département average divides total fees by a number of practitioners, and where setting up is easy and attractive the divisor grows faster than demand. A well-placed city-centre practice can beat its département average by a wide margin, just as a rural one can fall below its own. That is why the calculator compares you first with your département, then with your region and France.</p>
<h2>Orthodontics ranks differently</h2>
<p>Orthodontists line up in another order. ${depName(cd[0].code)} (${e(cd[0].tot, 'en')}) and ${depName(cd[1].code)} (${e(cd[1].tot, 'en')}) lead, ${depName(cd[cd.length - 1].code)} (${e(cd[cd.length - 1].tot, 'en')}) comes last, and Paris is again near the bottom (${e(DEPS['75'].p.odf!.tot!, 'en')}). Headcounts are small: in a département with eight orthodontists one retirement can move the average by tens of thousands of euros. No average is published below five practitioners, which leaves ${n(DEP_CODES.length - cd.length, 'en')} départements without a figure for the specialty.</p>
<h2>Overseas départements</h2>
<p>The ${n(outremer.length, 'en')} overseas départements rank far from rural mainland ones despite sometimes low density: ${outremer.map((c) => `${depName(c)} ${e(DEPS[c].p.omni!.tot!, 'en')} with ${n(DEPS[c].p.omni!.dens!, 'en')} dentists per 100,000`).join(', ')}. These are island or isolated markets that do not compare directly with mainland départements, so the density correlation above uses mainland France only (${n(METRO.length, 'en')} départements).</p>
<h2>The full table</h2>
${table('en')}
<p>Each underlined name opens the département page, with the split of fees, practitioners’ ages, history since 2015 and the calculator already set to that area. To place your own practice, start from the ${'<a href="/en/">calculator</a>'}: it first removes non-reimbursable work, which these averages leave out.</p>
<h2>General dentists’ profile, département by département</h2>
<p>The second table looks at the same 101 départements from another angle: how many general dentists practise there, how headcount moved over five years, what share of fees comes from extra fees, how many patients each dentist sees in a year and how old the profession is. A high share of practitioners aged 60 or over points to practice sales ahead; a falling headcount means demand shifting onto those who remain. In the calculator, choosing a département sets every benchmark to that area, including départements without a page of their own.</p>
${profil('en')}`,
  },
});
