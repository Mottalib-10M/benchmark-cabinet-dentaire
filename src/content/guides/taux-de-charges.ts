import { defineGuide } from '../../lib/guide-types';
import { reference, UNASA_YEAR } from '../../lib/engine/references';
import { P } from '../../lib/engine/params';
import raw from '../../data/unasa.json';
import { FR, DATA_YEAR } from '../../lib/engine/data';
import { formatMoney, formatNumber, formatPercent } from '../../lib/format';

/* Comptes UNASA des cabinets (postes en % du montant net des recettes, quarts de recettes). */
type Tab = { echantillon: number; lignes: Record<string, Array<number | string | null>> };
const U = raw as unknown as Record<string, Tab>;
const Y = UNASA_YEAR;
const A = U[`851EAA_${Y}`], A0 = U[`851EAA_${Y - 1}`], B = U[`851EAB_${Y}`], B0 = U[`851EAB_${Y - 1}`];
const part = (t: Tab, row: string, i = 0) => Number(t.lignes[row][i]) / 100;
const val = (t: Tab, row: string, i = 0) => Number(t.lignes[row][i]);

const G = reference('omni');
const Q = [1, 2, 3, 4].map((q) => reference('omni', val(A, 'Montant net des recettes', q)));
const O = reference('odf');
const taux0 = 1 - part(A0, 'Bénéfice (%)');
const tauxO0 = 1 - part(B0, 'Bénéfice (%)');
const locations = part(A, 'Locations'), amort = part(A, 'Dotations aux amortissements'), impots = part(A, 'Impôts et taxes'), externes = part(A, 'Charges externes');
const evoRec = part(A, 'Montant net des recettes (évolution, %)'), evoExt = part(A, 'Charges externes (évolution, %)'), evoBen = part(A, 'Bénéfice');
const ex = reference('omni', P.defauts.omni.recettes);
const exCharges = P.defauts.omni.recettes * ex.taux;
const D = P.revenus.drees;
const KR = P.revenus.carcdsf_2024;
const retro = (i: number) => val(A, 'Honoraires rétrocédés', i);
const encaisse = val(A, 'Recettes encaissées');
const ameliOmni = FR.p.omni!.tot!;
const ecartQ = Math.max(...Q.map((r) => r.taux)) - Math.min(...Q.map((r) => r.taux));
const ecartDef = G.taux - G.tauxHorsCotis;

const e = (x: number, l: 'fr' | 'en') => formatMoney(x, 0, l);
const p = (x: number, l: 'fr' | 'en', d = 1) => formatPercent(x, d, l);
const n = (x: number, l: 'fr' | 'en') => formatNumber(x, 0, l);
const pts = (x: number, l: 'fr' | 'en') => formatNumber(Math.abs(x) * 100, 1, l);

const tableau = (l: 'fr' | 'en', h: { table: (a: string[], b: Array<Array<string | number>>, c?: string, d?: Array<'l' | 'r'>) => string }) => {
  const th = l === 'fr'
    ? ['Quart de recettes', 'Recettes nettes moyennes', 'Taux de charges', 'Hors cotisations personnelles', 'Personnel', 'Loyer', 'Bénéfice moyen']
    : ['Receipts quarter', 'Average net receipts', 'Cost ratio', 'Excluding personal contributions', 'Staff', 'Rent', 'Average profit'];
  const lab = (i: number) => (l === 'fr' ? `${i === 1 ? '1er' : `${i}e`} quart` : `Quarter ${i}`);
  const rows = Q.map((r, i) => [lab(i + 1), e(r.recettes, l), p(r.taux, l), p(r.tauxHorsCotis, l), p(r.personnel, l), p(r.loyer, l), e(r.benefice, l)]);
  rows.push([l === 'fr' ? 'Ensemble' : 'All practices', e(G.recettes, l), p(G.taux, l), p(G.tauxHorsCotis, l), p(G.personnel, l), p(G.loyer, l), e(G.benefice, l)]);
  const cap = l === 'fr'
    ? `Cabinets de chirurgiens-dentistes adhérents UNASA, comptes ${Y} (${n(G.echantillon, l)} cabinets). Charges en % du montant net des recettes.`
    : `Dental practices in the UNASA network, ${Y} accounts (${n(G.echantillon, l)} practices). Costs as a share of net receipts.`;
  return h.table(th, rows, cap, ['l', 'r', 'r', 'r', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'taux-de-charges',
  group: 'organisation',
  order: 40,
  mini: 'tauxCharges',
  related: ['organisation-cabinet', 'ca-par-fauteuil', 'salaire-assistante-dentaire', 'collaboration-liberale', 'cotisations-carcdsf', 'revenu-dentiste'],
  sources: ['unasa', 'carcdsfRevenus2024', 'dreesRevenus', 'ameliHonoraires'],
  fr: {
    slug: 'taux-de-charges-cabinet-dentaire',
    nav: 'Taux de charges',
    card: 'Les charges d’un cabinet dentaire rapportées à ses recettes, quart par quart.',
    title: 'Taux de charges cabinet dentaire 2026 : repères par taille',
    description: `Taux de charges d'un cabinet dentaire : ${p(G.taux, 'fr')} des recettes en moyenne (comptes UNASA ${Y}), lu par quart de recettes : la référence de l'outil en 2026.`,
    h1: 'Le taux de charges d’un cabinet dentaire, cabinet par cabinet',
    intro: `Ce que les ${n(G.echantillon, 'fr')} cabinets de l'échantillon UNASA dépensent pour chaque euro encaissé.`,
    resume: `Un cabinet de chirurgien-dentiste libéral dépense en moyenne ${p(G.taux, 'fr')} de ses recettes nettes, cotisations sociales personnelles et CSG déductible comprises, d'après les comptes ${Y} de ${n(G.echantillon, 'fr')} cabinets adhérents des organismes de gestion de l'UNASA. Sur ${e(G.recettes, 'fr')} de recettes moyennes, il lui reste ${e(G.benefice, 'fr')} de bénéfice. Sans ces cotisations personnelles, le taux tombe à ${p(G.tauxHorsCotis, 'fr')} : c'est le chiffre à prendre si vos propres charges ne les comptent pas. Le ratio varie peu avec la taille, de ${p(Q[3].taux, 'fr')} dans le quart des plus grosses recettes à ${p(Q[1].taux, 'fr')} dans le deuxième quart, mais sa composition change beaucoup : les petits cabinets consacrent une plus grande part au loyer et aux cotisations, les gros au personnel. Ces comptes portent sur l'exercice en nom propre (BNC) ; les sociétés soumises à l'impôt sur les sociétés n'y figurent pas.`,
    faqs: [
      { q: 'Le taux de charges d’un dentiste comprend-il ses cotisations Urssaf et CARCDSF ?', a: `Dans les comptes UNASA, oui : les charges sociales personnelles pèsent ${p(part(A, 'Charges sociales personnelles'), 'fr')} des recettes et la CSG déductible ${p(part(A, 'CSG déductible'), 'fr')}, ce qui porte le taux moyen à ${p(G.taux, 'fr')}. Retirées, il reste ${p(G.tauxHorsCotis, 'fr')} de frais de fonctionnement. Comparez toujours deux taux construits de la même façon, sinon l'écart de ${pts(ecartDef, 'fr')} points entre les deux définitions fausse le diagnostic.` },
      { q: 'Pourquoi un petit cabinet dentaire a-t-il proportionnellement autant de charges qu’un gros ?', a: `Parce que ses charges ne sont pas les mêmes. Dans le premier quart (${e(Q[0].recettes, 'fr')} de recettes moyennes), le loyer prend ${p(Q[0].loyer, 'fr')} et les cotisations personnelles ${p(Q[0].cotisPerso, 'fr')}, une partie étant forfaitaire. Dans le dernier quart (${e(Q[3].recettes, 'fr')}), le personnel monte à ${p(Q[3].personnel, 'fr')}. Au total, les deux taux restent proches : ${p(Q[0].taux, 'fr')} et ${p(Q[3].taux, 'fr')} (UNASA ${Y}).` },
      { q: 'Quelle part des recettes partent en achats dans un cabinet dentaire ?', a: `${p(G.achats, 'fr')} en moyenne dans les comptes UNASA ${Y}, le premier poste de dépenses devant le personnel (${p(G.personnel, 'fr')}). La grille de l'UNASA n'isole pas le laboratoire de prothèse : ses factures se retrouvent dans les achats ou les charges externes selon la tenue des comptes. Les achats vont de ${p(Q[0].achats, 'fr')} dans le premier quart de recettes à ${p(Q[3].achats, 'fr')} dans le dernier.` },
      { q: 'Un orthodontiste a-t-il un taux de charges différent d’un omnipraticien ?', a: `Les ${n(O.echantillon, 'fr')} cabinets d'orthodontistes de l'échantillon UNASA ${Y} affichent ${p(O.taux, 'fr')}, cotisations personnelles comprises, sur ${e(O.recettes, 'fr')} de recettes moyennes. L'année précédente, ${n(B0.echantillon, 'fr')} cabinets donnaient ${p(tauxO0, 'fr')}. Avec si peu de comptes, un écart de quelques points ne prouve rien : la référence reste indicative, et le site ne la découpe pas par quart de recettes.` },
      { q: 'Les charges d’une SELARL dentaire se comparent-elles à ces chiffres ?', a: `Pas directement. L'échantillon UNASA réunit des praticiens en BNC et exclut les sociétés soumises à l'impôt sur les sociétés. Dans une SELARL, la rémunération du gérant devient une charge de la société et les cotisations suivent un autre circuit. Le site n'est pas un expert-comptable : il faut reconstituer un compte comparable avec le vôtre avant de lire l'écart.` },
      { q: 'Le taux de charges des cabinets dentaires a-t-il augmenté entre 2023 et 2024 ?', a: `Le taux moyen passe de ${p(taux0, 'fr')} sur ${n(A0.echantillon, 'fr')} cabinets en ${Y - 1} à ${p(G.taux, 'fr')} sur ${n(G.echantillon, 'fr')} en ${Y}, deux échantillons différents. Les évolutions publiées par l'UNASA disent la même chose : recettes ${evoRec >= 0 ? '+' : '−'}${pts(evoRec, 'fr')} %, charges externes ${evoExt >= 0 ? '+' : '−'}${pts(evoExt, 'fr')} %, bénéfice ${evoBen >= 0 ? '+' : '−'}${pts(evoBen, 'fr')} %. Les charges ont donc avancé plus vite que l'activité.` },
    ],
    body: (h) => `
<h2>Ce que mesure le ratio, et ce qu'il laisse de côté</h2>
<p>Le taux de charges divise tout ce qui sort du cabinet pendant l'année par le montant net des recettes, c'est-à-dire les honoraires encaissés diminués des rétrocessions versées aux remplaçants ou aux collaborateurs. Deux versions circulent, et la confusion entre les deux est la première source d'erreur. La première compte les cotisations sociales du praticien (Urssaf, ${h.a('cotisations-carcdsf', 'CARCDSF')}) et la CSG déductible : c'est le taux de l'UNASA, ${h.pct(G.taux)} en ${Y}. La seconde s'arrête aux frais du cabinet : ${h.pct(G.tauxHorsCotis)}. Un expert-comptable qui présente un « résultat avant cotisations » parle de la seconde.</p>
<p>Exemple chiffré. Avec ${h.eur(P.defauts.omni.recettes)} de recettes, la recette moyenne la plus proche est celle du ${ex.quartile}e quart (${h.eur(ex.recettes)}). Son taux de ${h.pct(ex.taux)} donne ${h.eur(exCharges)} de charges et ${h.eur(P.defauts.omni.recettes - exCharges)} de bénéfice avant impôt sur le revenu. C'est ce calcul que fait le mini-simulateur ci-dessus quand vous saisissez vos propres charges, et que le ${'<a href="/fr/">simulateur complet</a>'} applique quand vous les laissez vides.</p>
<h2>Le tableau par quart de recettes</h2>
<p>L'UNASA classe ses adhérents en quatre groupes de taille égale selon leurs recettes. Le site retient le quart dont la recette moyenne est la plus proche de la vôtre : la moyenne nationale mélange des cabinets dont les recettes vont de ${h.eur(Q[0].recettes)} à ${h.eur(Q[3].recettes)}.</p>
${tableau('fr', h)}
<p>Le ratio global bouge peu d'un quart à l'autre : ${pts(ecartQ, 'fr')} points séparent le plus haut du plus bas. Ce qui se déplace, c'est la répartition. Les cotisations personnelles reculent de ${h.pct(Q[0].cotisPerso)} à ${h.pct(Q[3].cotisPerso)} des recettes quand la taille grandit, parce que certaines sont des forfaits ; le personnel suit le chemin inverse, de ${h.pct(Q[0].personnel)} à ${h.pct(Q[3].personnel)}. Un poste de personnel aussi léger dans le premier quart laisse penser que beaucoup de ces cabinets n'emploient pas de salarié à temps plein ; l'UNASA ne publie pas le nombre de salariés.</p>
<h2>Poste par poste</h2>
<ul>
<li><strong>Achats</strong> : ${h.pct(G.achats)} des recettes, premier poste. Fournitures, consommables, petit matériel ; la prothèse n'a pas de ligne propre dans la grille.</li>
<li><strong>Personnel</strong> : ${h.pct(G.personnel)}, salaires nets et charges sociales des salariés. La page sur la ${h.a('salaire-assistante-dentaire', 'rémunération d’une assistante dentaire')} chiffre ce poste au minimum conventionnel.</li>
<li><strong>Loyer et locations</strong> : ${h.pct(G.loyer)} pour les locaux, ${h.pct(locations)} pour les locations de matériel, qui pèsent davantage dans les petits cabinets.</li>
<li><strong>Impôts et taxes</strong> : ${h.pct(impots)}, dont la CSG déductible.</li>
<li><strong>Amortissements</strong> : ${h.pct(amort)} seulement, signe que l'équipement lourd est souvent loué ou déjà amorti.</li>
<li><strong>Charges externes</strong> au sens large : ${h.pct(externes)}, un agrégat qui comprend loyers, locations, honoraires, assurances et cotisations personnelles.</li>
</ul>
<p>Ces moyennes décrivent des cabinets adhérents d'un organisme de gestion agréé, donc des comptes tenus et contrôlés ; elles ne disent rien des cabinets en société à l'IS, ni des centres de santé. Les stomatologues, qui sont des médecins, n'ont aucune statistique de cabinet publiée : le site leur applique la référence des chirurgiens-dentistes et l'affiche comme telle. Pour les orthodontistes, ${n(O.echantillon, 'fr')} cabinets donnent ${h.pct(O.taux)} ; c'est un ordre de grandeur, pas une norme.</p>
<h2>Le loyer, le poste qui se pilote le moins vite</h2>
<p>Loyer et charges locatives prennent ${h.pct(G.loyer)} des recettes en moyenne, de ${h.pct(Q[0].loyer)} dans le premier quart de recettes à ${h.pct(Q[3].loyer)} dans le dernier (UNASA ${Y}). Le poids baisse avec la taille parce que le loyer ne suit pas l’activité : un cabinet qui produit davantage dans les mêmes murs dilue cette charge fixe. C’est aussi le poste le plus lent à corriger, puisqu’un bail commercial ou professionnel engage pour plusieurs années.</p>
<p>Trois pistes existent quand le loyer pèse trop. Remplir les heures où les fauteuils restent vides fait baisser la part sans toucher au bail. Partager les locaux avec un ${h.a('collaboration-liberale', 'collaborateur libéral')}, qui verse une redevance au titulaire, fait payer une partie du loyer par un autre praticien. Renégocier ou déménager reste la solution lourde, à mesurer sur la durée du bail. Le praticien propriétaire de ses murs saisit un loyer nul, mais l’emprunt ou le loyer versé à sa société civile immobilière joue économiquement le même rôle. Le diagnostic de l’accueil signale le loyer quand il dépasse de ${h.pct(P.diagnostic.seuil_loyer, 0)} le repère de votre quart de recettes.</p>
<!--mini:poidsLoyer-->
<h2>Le dénominateur compte autant que les charges</h2>
<p>Un taux se calcule sur des recettes, et toutes les recettes ne se valent pas. L'UNASA part des recettes encaissées (${h.eur(encaisse)} en moyenne), retire les débours et les honoraires rétrocédés (${h.eur(retro(0))}), et obtient le montant net de ${h.eur(G.recettes)}. Les rétrocessions pèsent plus lourd dans les petits cabinets, ${h.eur(retro(1))} dans le premier quart contre ${h.eur(retro(4))} dans le dernier : un praticien qui travaille en partie comme collaborateur reverse une fraction de ce qu'il facture.</p>
<p>Ce montant net ne se confond pas avec les honoraires publiés par l'Assurance Maladie. La moyenne ${DATA_YEAR} d'un omnipraticien actif à part entière, ${h.eur(ameliOmni)}, ne compte que les actes enregistrés par l'assurance maladie et laisse de côté l'implantologie, la parodontie ou les autres actes hors nomenclature non remboursables. Les recettes UNASA, elles, comprennent tout ce qui entre au cabinet. Rapporter vos charges à vos honoraires Ameli plutôt qu'à vos recettes totales gonfle donc mécaniquement le taux.</p>
<h2>Du taux de charges au revenu du praticien</h2>
<p>Le bénéfice que laisse le taux de charges est un revenu avant impôt, après cotisations dans la version UNASA. La CARCDSF mesure un revenu voisin, le revenu professionnel déclaré avant impôt : ${h.eur(KR.moyen)} en moyenne en ${KR.annee}, pour une médiane de ${h.eur(KR.mediane)} (${h.src('carcdsfRevenus2024', 'CARCDSF')}). Elle ne publie pas de déciles ; la seule distribution publiée est celle de la DREES, plus ancienne (revenus ${D.annee}, médiane ${h.eur(D.quantiles.mediane)}, ${h.src('dreesRevenus', 'DREES')}). Placez votre bénéfice dans cette distribution :</p>
<!--mini:revenuPosition-->
<p>Un taux de charges élevé n'est pas une faute de gestion en soi. Un cabinet qui sous-traite beaucoup de prothèse, emploie deux assistantes ou loue un plateau technique récent dépense plus et peut encaisser davantage ; la page ${h.a('ca-par-fauteuil', 'chiffre d’affaires par fauteuil')} regarde l'autre côté du ratio. Les comptes détaillés sont publiés par l'${h.src('unasa', 'UNASA')} ; les honoraires de référence par département viennent de l'${h.src('ameliHonoraires', 'Assurance Maladie')}.</p>`,
  },
  en: {
    slug: 'dental-practice-cost-ratio',
    nav: 'Cost ratio',
    card: 'How much of a French dental practice’s receipts goes on costs, by practice size.',
    title: 'Dental practice cost ratio in France 2026: size benchmarks',
    description: `French dental practices spend ${p(G.taux, 'en')} of receipts on costs on average (UNASA ${Y} accounts): the 2026 benchmark split into four receipt bands, item by item.`,
    h1: 'The cost ratio of a dental practice in France',
    intro: `What the ${n(G.echantillon, 'en')} practices in the UNASA sample spend out of each euro they take.`,
    resume: `A French dentist in private practice spends ${p(G.taux, 'en')} of net receipts on average once personal social contributions and deductible CSG (a social levy) are counted, according to the ${Y} accounts of ${n(G.echantillon, 'en')} practices filed through UNASA, the national federation of approved accounting bodies. On ${e(G.recettes, 'en')} of average receipts that leaves ${e(G.benefice, 'en')} of profit. Strip out the practitioner’s own contributions and the ratio is ${p(G.tauxHorsCotis, 'en')}, the right figure if your accounts stop before them. Size barely moves the total, from ${p(Q[3].taux, 'en')} for the largest quarter of practices to ${p(Q[1].taux, 'en')} for the second, yet the mix shifts: small practices spend proportionally more on rent and contributions, large ones on staff. The sample covers sole practice taxed as BNC (bénéfices non commerciaux, the profit of a self-employed professional); companies paying corporation tax are not in it.`,
    faqs: [
      { q: 'Does a French dentist’s cost ratio include Urssaf and CARCDSF contributions?', a: `In the UNASA accounts, yes. The practitioner’s own social contributions take ${p(part(A, 'Charges sociales personnelles'), 'en')} of receipts and deductible CSG ${p(part(A, 'CSG déductible'), 'en')}, which lifts the average ratio to ${p(G.taux, 'en')}. Without them the running costs come to ${p(G.tauxHorsCotis, 'en')}. Compare like with like: mixing the two definitions creates a gap of ${pts(ecartDef, 'en')} points.` },
      { q: 'Why do small dental practices carry such a high share of costs?', a: `Their costs are of a different kind. In the bottom quarter (${e(Q[0].recettes, 'en')} average receipts) rent takes ${p(Q[0].loyer, 'en')} and personal contributions ${p(Q[0].cotisPerso, 'en')}, part of them flat-rate. In the top quarter (${e(Q[3].recettes, 'en')}) staff rises to ${p(Q[3].personnel, 'en')}. The totals end up close: ${p(Q[0].taux, 'en')} against ${p(Q[3].taux, 'en')} (UNASA ${Y}).` },
      { q: 'How much do French dental practices spend on supplies and purchases?', a: `${p(G.achats, 'en')} of receipts on average in the ${Y} UNASA accounts, the largest single item ahead of staff at ${p(G.personnel, 'en')}. The UNASA grid has no separate dental laboratory line, so lab invoices land in purchases or external costs depending on how the books are kept. Purchases run from ${p(Q[0].achats, 'en')} in the bottom receipts quarter to ${p(Q[3].achats, 'en')} in the top one.` },
      { q: 'What cost ratio do orthodontic practices in France run at?', a: `The ${n(O.echantillon, 'en')} orthodontic practices in the ${Y} UNASA sample show ${p(O.taux, 'en')}, personal contributions included, on ${e(O.recettes, 'en')} of average receipts. A year earlier ${n(B0.echantillon, 'en')} practices gave ${p(tauxO0, 'en')}. With so few sets of accounts a gap of a few points proves nothing, so the site treats the figure as indicative and does not split it by size.` },
      { q: 'Can I compare a SELARL’s costs with these figures?', a: `Not as they stand. A SELARL is the incorporated form of dental practice, and the UNASA sample leaves out companies paying corporation tax. In a SELARL the manager’s pay becomes a company expense and contributions follow another route. This site is not an accountant: rebuild a comparable set of figures, ideally with yours, before reading any gap.` },
      { q: 'Are dental practice costs in France rising faster than receipts?', a: `On UNASA’s own like-for-like changes for ${Y}, yes: receipts ${evoRec >= 0 ? '+' : '−'}${pts(evoRec, 'en')}%, external costs ${evoExt >= 0 ? '+' : '−'}${pts(evoExt, 'en')}%, profit ${evoBen >= 0 ? '+' : '−'}${pts(evoBen, 'en')}%. The average ratio moved from ${p(taux0, 'en')} (${n(A0.echantillon, 'en')} practices, ${Y - 1}) to ${p(G.taux, 'en')} (${n(G.echantillon, 'en')} practices), though the two samples are not the same practices, so the level shift is only a rough signal.` },
    ],
    body: (h) => `
<h2>Two definitions, one common mistake</h2>
<p>The ratio is everything the practice pays out over the year divided by net receipts: fees collected, minus the share passed on to locums or associate dentists (rétrocessions). French accountants use it in two forms. UNASA counts the dentist’s personal contributions to Urssaf and to the ${h.a('cotisations-carcdsf', 'CARCDSF, the dentists’ pension fund')}, plus deductible CSG, which gives ${h.pct(G.taux)} for ${Y}. Running costs alone come to ${h.pct(G.tauxHorsCotis)}. A statement showing profit “avant cotisations” uses the second form, so check which one you hold before benchmarking.</p>
<p>A worked case: a practice taking ${h.eur(P.defauts.omni.recettes)} sits closest to quarter ${ex.quartile} of the sample (${h.eur(ex.recettes)} average). At that quarter’s ${h.pct(ex.taux)}, costs come to ${h.eur(exCharges)} and profit before income tax to ${h.eur(P.defauts.omni.recettes - exCharges)}. The small calculator above runs exactly this comparison with your own costs; the ${'<a href="/en/">full benchmark</a>'} falls back on it when you leave costs blank.</p>
<h2>The four receipt bands</h2>
<p>UNASA sorts its members into four equal groups by receipts. Matching you to the nearest band matters because the national average blends practices taking anywhere from ${h.eur(Q[0].recettes)} to ${h.eur(Q[3].recettes)}.</p>
${tableau('en', h)}
<p>Only ${pts(ecartQ, 'en')} points separate the highest band from the lowest, but the content differs. Personal contributions fall from ${h.pct(Q[0].cotisPerso)} to ${h.pct(Q[3].cotisPerso)} of receipts as practices grow, since some are flat amounts, while staff climbs from ${h.pct(Q[0].personnel)} to ${h.pct(Q[3].personnel)}. Such a light staff line in the bottom band hints that many of those dentists have no full-time employee, though UNASA does not publish headcounts.</p>
<h2>Line by line</h2>
<ul>
<li><strong>Purchases</strong>: ${h.pct(G.achats)}, the biggest item: materials, consumables, small instruments. Prosthetics has no line of its own.</li>
<li><strong>Staff</strong>: ${h.pct(G.personnel)}, net wages plus social charges. Our page on ${h.a('salaire-assistante-dentaire', 'dental nurse pay')} prices this line at the 2026 collective-agreement minimum.</li>
<li><strong>Premises and leasing</strong>: ${h.pct(G.loyer)} for rent, ${h.pct(locations)} for leased equipment, heavier in smaller practices.</li>
<li><strong>Taxes</strong>: ${h.pct(impots)}, deductible CSG included.</li>
<li><strong>Depreciation</strong>: just ${h.pct(amort)}; much heavy equipment is leased or fully written down.</li>
<li><strong>External costs</strong> as UNASA groups them: ${h.pct(externes)}, a bundle of rent, leasing, fees, insurance and personal contributions.</li>
</ul>
<p>The figures describe members of approved accounting bodies, so the books are kept and checked. They say nothing about incorporated practices or health centres. Stomatologists are physicians in France and no practice accounts are published for them, so the site borrows the dentists’ benchmark and labels it as borrowed. For orthodontists, ${n(O.echantillon, 'en')} practices give ${h.pct(O.taux)}: a rough guide, nothing firmer.</p>
<h2>Rent, the slowest line to move</h2>
<p>Rent and service charges take ${h.pct(G.loyer)} of receipts on average, from ${h.pct(Q[0].loyer)} in the bottom receipts quarter to ${h.pct(Q[3].loyer)} in the top one (UNASA ${Y}). The share falls with size because rent does not follow activity: a practice that produces more within the same walls spreads a fixed cost thinner. It is also the slowest item to fix, since a commercial or professional lease runs for several years.</p>
<p>When rent weighs too much there are three routes. Filling the hours when chairs stand empty lowers the share without touching the lease. Sharing the premises with a ${h.a('collaboration-liberale', 'self-employed associate')}, who pays the principal a fee, gets another dentist to carry part of the rent. Renegotiating or moving is the heavy option, to be weighed over the remaining lease. A dentist who owns the premises enters zero rent, but the loan or the rent paid to a property company plays the same economic part. The home-page check-up flags rent once it runs ${h.pct(P.diagnostic.seuil_loyer, 0)} above the benchmark for your receipts quarter.</p>
<!--mini:poidsLoyer-->
<h2>Get the denominator right</h2>
<p>A ratio is only as good as the receipts underneath it. UNASA starts from cash collected (${h.eur(encaisse)} on average), takes off pass-through items and fees handed on to other dentists (${h.eur(retro(0))}), and lands on ${h.eur(G.recettes)} of net receipts. Those hand-ons matter most at the small end: ${h.eur(retro(1))} in the bottom quarter, ${h.eur(retro(4))} in the top one, which fits dentists who partly work as associates in someone else’s surgery and return a share of what they bill.</p>
<p>Net receipts are also a wider measure than the fees Assurance Maladie, the national health insurer, publishes. Its ${DATA_YEAR} average for a full-time general dentist, ${h.eur(ameliOmni)}, covers only work recorded by the insurer, so implants, periodontal treatment and other non-reimbursable procedures are missing. Divide your costs by that narrower figure instead of your total takings and the ratio comes out higher than it really is.</p>
<h2>From cost ratio to take-home income</h2>
<p>What the ratio leaves is profit before income tax, already net of contributions in the UNASA version. CARCDSF, the dentists’ pension fund, measures something close, the professional income dentists declare before income tax: ${h.eur(KR.moyen)} on average in ${KR.annee}, with a median of ${h.eur(KR.mediane)} (${h.src('carcdsfRevenus2024', 'CARCDSF')}). It publishes no deciles; the only published spread comes from DREES, the health ministry’s statistics office, and is older (${D.annee} income, median ${h.eur(D.quantiles.mediane)}, ${h.src('dreesRevenus', 'DREES')}). See where your own profit falls:</p>
<!--mini:revenuPosition-->
<p>A high ratio is not bad management by itself. Outsourcing a lot of prosthetics, employing two nurses or leasing new imaging raises costs and often receipts too; the page on ${h.a('ca-par-fauteuil', 'revenue per dental chair')} looks at that side. Full accounts are on the ${h.src('unasa', 'UNASA statistics page')}; département fee averages come from ${h.src('ameliHonoraires', 'Assurance Maladie open data')}.</p>`,
  },
});
