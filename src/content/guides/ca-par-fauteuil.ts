import { YEAR } from '../../data/site-config';
import { defineGuide } from '../../lib/guide-types';
import { cabinet } from '../../lib/engine/cabinet';
import { reference, UNASA_YEAR } from '../../lib/engine/references';
import { FR, DATA_YEAR, type Spec } from '../../lib/engine/data';
import { P } from '../../lib/engine/params';
import raw from '../../data/unasa.json';
import { formatMoney, formatNumber, formatPercent } from '../../lib/format';

const Y = DATA_YEAR;
const vide = { personnel: 0, prothesiste: 0, fournitures: 0, loyer: 0, autres: 0 };
const SPECS: Spec[] = ['omni', 'odf', 'stomato'];
const df = P.defauts.omni;
/** Ratios du moteur pour des honoraires donnés, au rythme par défaut du simulateur (jours × semaines). */
const ratios = (r: number, f: number) => cabinet({ recettes: r, fauteuils: f, salaries: 0, joursSemaine: df.joursSemaine, semaines: df.semaines, charges: vide, cotisationsPerso: 0 }, 0);
const fo = FR.p.omni!, fd = FR.p.odf!, fs = FR.p.stomato!;
const omni2 = ratios(fo.tot!, df.fauteuils);
const jours = omni2.joursAn;
const fauteuilJour = omni2.parFauteuil! / jours;
const odfDef = ratios(fd.tot!, P.defauts.odf.fauteuils);
const parPatient = (s: typeof fo) => s.tot! / s.patients!;
const hist = fo.hist;
const y0 = Object.keys(hist).sort()[0];
const evo = hist[String(Y)] / hist[y0] - 1;
const C = P.depense;
const UA = (raw as unknown as Record<string, { lignes: Record<string, Array<number | string | null>> }>)[`851EAA_${UNASA_YEAR}`];
// Chaque quart UNASA se retrouve en passant au moteur sa propre recette moyenne.
const quarts = [1, 2, 3, 4].map((q) => reference('omni', Number(UA.lignes['Montant net des recettes'][q])));
const moinsUnJour = cabinet({ recettes: fo.tot!, fauteuils: df.fauteuils, salaries: 0, joursSemaine: df.joursSemaine - 1, semaines: df.semaines, charges: vide, cotisationsPerso: 0 }, 0);

const e = (x: number, l: 'fr' | 'en') => formatMoney(x, 0, l);
const p = (x: number, l: 'fr' | 'en', d = 1) => formatPercent(x, d, l);
const n = (x: number, l: 'fr' | 'en', d = 0) => formatNumber(x, d, l);
const NOM = { fr: { omni: 'Omnipraticien', odf: 'Orthodontiste', stomato: 'Stomatologue' }, en: { omni: 'General dentist', odf: 'Orthodontist', stomato: 'Stomatologist' } };

type H = { table: (a: string[], b: Array<Array<string | number>>, c?: string, d?: Array<'l' | 'r'>) => string };
const tableauSpec = (l: 'fr' | 'en', h: H) => {
  const th = l === 'fr'
    ? ['Spécialité', `Honoraires moyens ${Y}`, '1 fauteuil', '2 fauteuils', '3 fauteuils', '4 fauteuils', 'Par jour travaillé']
    : ['Specialty', `${Y} average fees`, '1 chair', '2 chairs', '3 chairs', '4 chairs', 'Per day worked'];
  const rows = SPECS.map((s) => { const t = FR.p[s]!.tot!; return [NOM[l][s], e(t, l), ...[1, 2, 3, 4].map((f) => e(ratios(t, f).parFauteuil!, l)), e(ratios(t, 1).parJour!, l)]; });
  const cap = l === 'fr'
    ? `Honoraires moyens France par praticien actif à part entière (Assurance Maladie), divisés par un nombre de fauteuils choisi ; jour travaillé : ${n(df.joursSemaine, l, 1)} jours sur ${n(df.semaines, l)} semaines. Calcul, pas statistique.`
    : `France average fees per full-time active practitioner (Assurance Maladie) divided by a chosen number of chairs; working year: ${n(df.joursSemaine, l, 1)} days a week for ${n(df.semaines, l)} weeks. Arithmetic, not a statistic.`;
  return h.table(th, rows, cap, ['l', 'r', 'r', 'r', 'r', 'r', 'r']);
};
const tableauQuarts = (l: 'fr' | 'en', h: H) => {
  const th = l === 'fr' ? ['Quart UNASA', 'Recettes nettes', 'Par jour travaillé', 'Bénéfice', 'Bénéfice par jour'] : ['UNASA quarter', 'Net receipts', 'Per day worked', 'Profit', 'Profit per day'];
  const rows = quarts.map((r) => [l === 'fr' ? `${r.quartile === 1 ? '1er' : `${r.quartile}e`} quart` : `Quarter ${r.quartile}`, e(r.recettes, l), e(r.recettes / jours, l), e(r.benefice, l), e(r.benefice / jours, l)]);
  const cap = l === 'fr' ? `Comptes ${UNASA_YEAR} des cabinets de chirurgiens-dentistes adhérents UNASA ; jours : hypothèse de ${n(jours, l, 1)} jours par an.` : `${UNASA_YEAR} accounts of dental practices in the UNASA network; days: assumed ${n(jours, l, 1)} working days a year.`;
  return h.table(th, rows, cap, ['l', 'r', 'r', 'r', 'r']);
};

export default defineGuide({
  id: 'ca-par-fauteuil',
  group: 'organisation',
  order: 35,
  mini: 'caFauteuil',
  related: ['organisation-cabinet', 'indicateurs-cabinet', 'taux-de-charges', 'collaboration-liberale', 'omnipraticien', 'classement-departements'],
  sources: ['ameliHonoraires', 'ameliPatientele', 'ameliMethode', 'dreesCns2025', 'unasa'],
  fr: {
    slug: 'chiffre-affaires-par-fauteuil',
    nav: 'Chiffre d’affaires par fauteuil',
    card: 'Honoraires par fauteuil, par jour et par patient : le calcul à faire soi-même.',
    title: `Chiffre d'affaires par fauteuil dentaire ${YEAR} : le calcul`,
    description: `Aucune moyenne officielle par fauteuil : avec ${e(fo.tot!, 'fr')} d'honoraires moyens ${Y} et ${n(df.fauteuils, 'fr')} fauteuils, un omnipraticien fait ${e(omni2.parFauteuil!, 'fr')} par fauteuil et par an.`,
    h1: 'Le chiffre d’affaires par fauteuil d’un cabinet dentaire',
    intro: 'Un ratio que tout le monde cite et qu’aucune statistique publique ne mesure : voici comment le construire.',
    resume: `Aucune source publique ne donne de chiffre d'affaires moyen par fauteuil dentaire : l'Assurance Maladie publie des honoraires par praticien, l'UNASA des comptes par cabinet, et ni l'une ni l'autre ne compte les fauteuils. Le ratio se construit donc soi-même. En ${Y}, un omnipraticien actif à part entière a facturé ${e(fo.tot!, 'fr')} d'honoraires en moyenne ; réparti sur ${n(df.fauteuils, 'fr')} fauteuils, cela fait ${e(omni2.parFauteuil!, 'fr')} par fauteuil, et sur ${n(jours, 'fr', 1)} jours travaillés (${n(df.joursSemaine, 'fr', 1)} jours pendant ${n(df.semaines, 'fr')} semaines), ${e(omni2.parJour!, 'fr')} par jour, soit ${e(fauteuilJour, 'fr')} par fauteuil et par jour. Avec les ${n(P.defauts.odf.fauteuils, 'fr')} fauteuils que le simulateur suppose par défaut, un orthodontiste arrive à ${e(odfDef.parFauteuil!, 'fr')} par fauteuil sur ${e(fd.tot!, 'fr')} d'honoraires. Ces moyennes ne comprennent pas les actes hors nomenclature non remboursables, comme les implants : votre chiffre d'affaires réel peut être plus élevé.`,
    faqs: [
      { q: 'Quel chiffre d’affaires moyen par fauteuil dans un cabinet dentaire ?', a: `Personne ne le publie. L'Assurance Maladie raisonne par praticien (${e(fo.tot!, 'fr')} d'honoraires moyens pour un omnipraticien en ${Y}), et les comptes UNASA ne recensent pas les fauteuils. Le seul chiffre honnête est un calcul : ${e(omni2.parFauteuil!, 'fr')} par fauteuil si ce praticien moyen en utilise ${n(df.fauteuils, 'fr')}, ${e(ratios(fo.tot!, 3).parFauteuil!, 'fr')} s'il en utilise trois.` },
      { q: 'Combien un chirurgien-dentiste facture-t-il par jour de travail ?', a: `Sur la base de ${n(jours, 'fr', 1)} jours par an, l'hypothèse par défaut du simulateur, les ${e(fo.tot!, 'fr')} d'honoraires moyens ${Y} d'un omnipraticien donnent ${e(omni2.parJour!, 'fr')} par jour. Avec un jour de moins par semaine et les mêmes honoraires, il monterait à ${e(moinsUnJour.parJour!, 'fr')}. L'Assurance Maladie ne publie pas le nombre de jours travaillés : seul votre agenda donne le vrai dénominateur.` },
      { q: 'Combien rapporte un patient à un dentiste sur une année ?', a: `Le rapport des deux moyennes Ameli ${Y} donne ${e(parPatient(fo), 'fr')} d'honoraires par patient pour un omnipraticien (${n(fo.patients!, 'fr')} patients distincts dans l'année), ${e(parPatient(fd), 'fr')} pour un orthodontiste (${n(fd.patients!, 'fr')} patients). Ce n'est pas un panier moyen mesuré : les deux moyennes portent sur des populations de praticiens proches mais pas identiques, et les actes non remboursables manquent.` },
      { q: 'Quels soins font l’essentiel du chiffre d’affaires dentaire en France ?', a: `La prothèse, de loin : ${p(C.structure_honoraires.protheses, 'fr', 0)} des honoraires de soins dentaires en ${C.annee}, devant les soins conservateurs, la radiologie et les soins non remboursables (${p(C.structure_honoraires.soins_conservateurs_radiologie_non_remboursables, 'fr', 0)}) et l'orthodontie remboursable (${p(C.structure_honoraires.orthodontie_remboursable, 'fr', 0)}), selon les comptes de la santé de la DREES. Les dépassements représentent ${p(C.part_depassements_protheses, 'fr', 0)} de la dépense de prothèses, et l'ensemble des soins et prothèses dentaires atteint ${n(C.soins_protheses_meur, 'fr')} millions d'euros.` },
      { q: 'Pourquoi mon chiffre d’affaires dépasse-t-il les honoraires relevés par l’Assurance Maladie ?', a: `Parce que l'Assurance Maladie n'enregistre que les actes de sa nomenclature. Implants, parodontie et orthodontie de l'adulte, hors nomenclature, n'apparaissent pas dans ses moyennes. Pour vous comparer, le simulateur retire d'abord la part hors nomenclature de vos recettes ; sans cela, un cabinet très orienté vers l'implantologie paraîtrait au-dessus de la moyenne pour une simple question de périmètre.` },
      { q: 'Les honoraires par praticien ont-ils augmenté depuis 2015 ?', a: `Oui. La moyenne d'un omnipraticien passe de ${e(hist[y0], 'fr')} en ${y0} à ${e(hist[String(Y)], 'fr')} en ${Y}, soit ${p(evo, 'fr')} en euros courants, sans correction de l'inflation. À nombre de fauteuils égal, le chiffre par fauteuil a mécaniquement suivi la même pente ; les données ne disent pas si les cabinets se sont équipés davantage entre-temps.` },
    ],
    body: (h) => `
<h2>Pourquoi aucune moyenne par fauteuil n'existe</h2>
<p>La statistique officielle compte des praticiens, pas des équipements. L'Assurance Maladie calcule ses moyennes sur les praticiens « actifs à part entière », ceux qui ont exercé toute l'année sous convention et ont moins de 65 ans (${h.src('ameliMethode', 'méthode Ameli')}). Un cabinet de trois associés et cinq fauteuils y apparaît comme trois praticiens. Les comptes de l'UNASA, de leur côté, décrivent des déclarations de bénéfices sans inventaire du matériel. Un « CA moyen par fauteuil » qui circulerait sans source est donc une estimation privée, à prendre comme telle.</p>
<p>Le calcul reste utile pour soi : il dit si un fauteuil supplémentaire travaille ou dort. Il se fait en trois divisions, que le mini-simulateur ci-dessus enchaîne : honoraires de l'année par nombre de fauteuils utilisés, puis par jours travaillés, puis les deux à la fois.</p>
<h2>Le calcul appliqué aux moyennes ${Y}</h2>
<p>Le tableau prend les honoraires moyens de chaque spécialité et les divise par un nombre de fauteuils. Il ne décrit aucun cabinet réel ; il donne des ordres de grandeur pour situer votre propre ratio.</p>
${tableauSpec('fr', h)}
<p>Un omnipraticien moyen sur ${n(df.fauteuils, 'fr')} fauteuils produit ainsi ${h.eur(fauteuilJour)} par fauteuil et par jour. Si votre ratio par fauteuil est nettement plus bas avec des honoraires totaux proches de la moyenne, la question n'est pas le volume de soins mais l'équipement : un fauteuil peu occupé coûte en location, en entretien et en surface. À l'inverse, un ratio élevé sur un seul fauteuil peut traduire un agenda plein ; les délais de rendez-vous le confirment ou non.</p>
<h2>Ce qui remplit les fauteuils</h2>
<p>Les comptes de la santé ${C.annee} (${h.src('dreesCns2025', 'DREES, fiche 14')}) répartissent ${h.num(C.honoraires_meur)} millions d'euros d'honoraires de soins dentaires, en cabinet comme en centre de santé : ${h.pct(C.structure_honoraires.protheses, 0)} pour la prothèse, dont ${h.pct(C.structure_honoraires.protheses_100s, 0)} pour le panier 100 % Santé, ${h.pct(C.structure_honoraires.soins_conservateurs_radiologie_non_remboursables, 0)} pour les soins conservateurs, la radiologie et les soins non remboursables, ${h.pct(C.structure_honoraires.orthodontie_remboursable, 0)} pour l'orthodontie remboursable. La prothèse pèse donc le plus lourd dans ce qui se facture au fauteuil, mais une partie de son prix repart aussitôt au laboratoire.</p>
<p>Le partage entre tarif opposable et dépassements le confirme. Sur les ${h.eur(fo.tot!)} d'un omnipraticien, ${h.eur(fo.dep!)} sont des dépassements, ${h.pct(fo.dep! / fo.tot!)} ; chez l'orthodontiste, ${h.eur(fd.dep!)} sur ${h.eur(fd.tot!)}, ${h.pct(fd.dep! / fd.tot!)} ; chez le stomatologue, ${h.eur(fs.dep!)} sur ${h.eur(fs.tot!)}. Les patientèles diffèrent aussi : ${h.num(fo.patients!)} patients distincts par an pour l'omnipraticien, ${h.num(fd.patients!)} pour l'orthodontiste et ${h.num(fs.patients!)} pour le stomatologue (${h.src('ameliPatientele', 'patientèle Ameli')}).</p>
<h2>Faire le calcul sur son propre cabinet</h2>
<p>Quatre choix décident du résultat, et deux cabinets qui ne les font pas de la même façon ne peuvent pas se comparer.</p>
<ol>
<li><strong>Le numérateur.</strong> Pour vous situer face aux moyennes Ameli, prenez les honoraires remboursables seulement ; pour piloter le cabinet, prenez toutes les recettes, implants et parodontie compris. Les deux ratios ont un sens, pas le même.</li>
<li><strong>Les fauteuils comptés.</strong> Un fauteuil installé mais réservé aux urgences du vendredi ne travaille pas comme les autres. Comptez ceux qui tournent chaque semaine.</li>
<li><strong>Les jours.</strong> Retirez congés, formations et jours de gestion. Le simulateur part de ${n(df.joursSemaine, 'fr', 1)} jours sur ${n(df.semaines, 'fr')} semaines ; modifiez-les dès que votre agenda dit autre chose.</li>
<li><strong>Les praticiens.</strong> Dans un cabinet de groupe, un fauteuil partagé par deux confrères porte les honoraires de deux personnes. Les sommes rétrocédées à un collaborateur restent dans le numérateur si vous raisonnez par équipement.</li>
</ol>
<p>Une fois ces choix posés, refaites le calcul chaque année avec les mêmes règles : l'évolution de votre propre ratio dit davantage qu'une comparaison avec un chiffre extérieur que personne ne mesure.</p>
<h2>Du chiffre d'affaires par jour au bénéfice par jour</h2>
<p>Un fauteuil qui facture beaucoup n'enrichit pas forcément le cabinet : tout dépend des charges qu'il entraîne. Les comptes UNASA ${UNASA_YEAR} permettent de rapporter recettes et bénéfice au même nombre de jours.</p>
${tableauQuarts('fr', h)}
<p>Le bénéfice par jour grossit plus vite que les recettes dans le dernier quart, parce que le taux de charges y est le plus bas. Le détail des postes se trouve dans la page sur le ${h.a('taux-de-charges', 'taux de charges')}, et celle sur la ${h.a('salaire-assistante-dentaire', 'rémunération d’une assistante')} chiffre le coût du personnel qui fait tourner un deuxième fauteuil. Pour comparer vos honoraires totaux à votre département, le ${h.a('classement-departements', 'classement des départements')} donne les moyennes de chaque territoire (${h.src('ameliHonoraires', 'Assurance Maladie')}).</p>`,
  },
  en: {
    slug: 'revenue-per-dental-chair',
    nav: 'Revenue per chair',
    card: 'Fees per chair, per day and per patient: the ratio you have to build yourself.',
    title: `Revenue per dental chair in France ${YEAR}: build the ratio`,
    description: `No official per-chair average exists in France. ${Y} average fees of ${e(fo.tot!, 'en')} over ${n(df.fauteuils, 'en')} chairs give a general dentist ${e(omni2.parFauteuil!, 'en')} per chair per year, on paper.`,
    h1: 'Revenue per chair in a French dental practice',
    intro: 'A ratio everyone quotes and no public statistic measures, and how to work it out.',
    resume: `No public source in France publishes average revenue per dental chair. Assurance Maladie, the national health insurer, reports fees per practitioner; UNASA, the federation of approved accounting bodies, reports accounts per practice; neither counts chairs. So you build the figure yourself. In ${Y} a full-time active general dentist billed ${e(fo.tot!, 'en')} in fees on average. Spread across ${n(df.fauteuils, 'en')} chairs that is ${e(omni2.parFauteuil!, 'en')} each; over ${n(jours, 'en', 1)} working days (${n(df.joursSemaine, 'en', 1)} days a week for ${n(df.semaines, 'en')} weeks) it is ${e(omni2.parJour!, 'en')} a day, or ${e(fauteuilJour, 'en')} per chair per day. On the ${n(P.defauts.odf.fauteuils, 'en')} chairs the calculator assumes by default, an orthodontist reaches ${e(odfDef.parFauteuil!, 'en')} per chair on ${e(fd.tot!, 'en')} of fees. These averages leave out non-reimbursable work such as implants, so real practice turnover can run higher. The small calculator below runs the same three divisions on your own figures.`,
    faqs: [
      { q: 'What is the average turnover per chair in a French dental surgery?', a: `Nobody publishes one. Assurance Maladie works per practitioner (${e(fo.tot!, 'en')} average fees for a general dentist in ${Y}) and UNASA accounts do not record chairs. The only honest figure is arithmetic: ${e(omni2.parFauteuil!, 'en')} per chair if that average dentist runs ${n(df.fauteuils, 'en')}, ${e(ratios(fo.tot!, 3).parFauteuil!, 'en')} with three.` },
      { q: 'How much does a dentist in France bill per working day?', a: `Taking ${n(jours, 'en', 1)} days a year, the calculator’s default, a general dentist’s ${e(fo.tot!, 'en')} of ${Y} average fees works out at ${e(omni2.parJour!, 'en')} a day. Work one day less a week for the same fees and it rises to ${e(moinsUnJour.parJour!, 'en')}. Days worked are not published anywhere, so your own diary is the only reliable divisor.` },
      { q: 'What is a patient worth to a French dentist over a year?', a: `Dividing one Ameli average by the other gives ${e(parPatient(fo), 'en')} of fees per patient for a general dentist seeing ${n(fo.patients!, 'en')} distinct patients in ${Y}, and ${e(parPatient(fd), 'en')} for an orthodontist (${n(fd.patients!, 'en')} patients). Treat it as a rough ratio: the two averages cover similar but not identical groups of practitioners, and non-reimbursable work is missing.` },
      { q: 'Which treatments bring in most dental revenue in France?', a: `Prosthetics, by a wide margin: ${p(C.structure_honoraires.protheses, 'en', 0)} of dental fees in ${C.annee}, ahead of conservative treatment such as fillings, imaging and non-reimbursed care (${p(C.structure_honoraires.soins_conservateurs_radiologie_non_remboursables, 'en', 0)}) and reimbursable orthodontics (${p(C.structure_honoraires.orthodontie_remboursable, 'en', 0)}), per the DREES national health accounts. Extra-billing above the regulated tariff makes up ${p(C.part_depassements_protheses, 'en', 0)} of prosthetic spending, and dental care and prosthetics together come to ${n(C.soins_protheses_meur, 'en')} million euros.` },
      { q: 'Why is my practice turnover higher than my Assurance Maladie fees?', a: `Because the insurer only records procedures in its own fee schedule. Implants, periodontal treatment and adult orthodontics sit outside that schedule and never reach its figures. Before comparing, the calculator removes the off-schedule share of your receipts; otherwise a practice doing a lot of implant work would look above average purely because it is measured on a wider base.` },
      { q: 'Have French dentists’ fees per practitioner grown since 2015?', a: `Yes. A general dentist’s average went from ${e(hist[y0], 'en')} in ${y0} to ${e(hist[String(Y)], 'en')} in ${Y}, ${p(evo, 'en')} in current euros with no inflation adjustment. With the same number of chairs, revenue per chair rose by the same proportion; the data cannot tell whether practices added equipment in the meantime.` },
    ],
    body: (h) => `
<h2>Why there is no official figure</h2>
<p>French statistics count people, not equipment. Assurance Maladie averages its figures over “actifs à part entière”, practitioners who worked the whole year under the national agreement and are under 65 (${h.src('ameliMethode', 'Ameli methodology')}). A practice with three partners and five chairs shows up as three dentists. UNASA accounts describe profit returns with no inventory of chairs. Any per-chair average you see quoted without a source is a private estimate.</p>
<p>The ratio still earns its keep inside your own practice, because it shows whether an extra chair is pulling its weight or standing idle. It takes three divisions, which the small calculator above runs for you: the year’s fees by chairs in use, by days worked, then by both.</p>
<h2>The ratio applied to ${Y} averages</h2>
<p>The table divides each specialty’s average fees by a number of chairs. No real practice is described here; the numbers are yardsticks for your own result.</p>
${tableauSpec('en', h)}
<p>An average general dentist on ${n(df.fauteuils, 'en')} chairs therefore generates ${h.eur(fauteuilJour)} per chair per day. If your per-chair figure is well below that while total fees sit near the average, volume is not the issue; equipment is, since an under-used chair still costs lease payments, servicing and floor space. A high figure on a single chair may reflect a full diary; appointment waiting times will tell.</p>
<h2>What keeps the chairs busy</h2>
<p>The ${C.annee} national health accounts (${h.src('dreesCns2025', 'DREES, sheet 14')}) split ${h.num(C.honoraires_meur)} million euros of dental fees, in practices and health centres alike: ${h.pct(C.structure_honoraires.protheses, 0)} prosthetics, of which ${h.pct(C.structure_honoraires.protheses_100s, 0)} in the 100% Santé basket, ${h.pct(C.structure_honoraires.soins_conservateurs_radiologie_non_remboursables, 0)} conservative care, imaging and non-reimbursed care, ${h.pct(C.structure_honoraires.orthodontie_remboursable, 0)} reimbursable orthodontics. Crowns and bridges therefore carry the largest share of what is billed in the chair, though part of each price goes straight to the dental laboratory.</p>
<p>The split between regulated tariff and extra-billing (dépassements) points the same way. Of a general dentist’s ${h.eur(fo.tot!)}, ${h.eur(fo.dep!)} is extra-billing, ${h.pct(fo.dep! / fo.tot!)}; an orthodontist bills ${h.eur(fd.dep!)} of ${h.eur(fd.tot!)} that way, ${h.pct(fd.dep! / fd.tot!)}; a stomatologist ${h.eur(fs.dep!)} of ${h.eur(fs.tot!)}. Patient lists differ as well: ${h.num(fo.patients!)} distinct patients a year for a general dentist, ${h.num(fd.patients!)} for an orthodontist, ${h.num(fs.patients!)} for a stomatologist (${h.src('ameliPatientele', 'Ameli patient data')}).</p>
<h2>Running the numbers on your own practice</h2>
<p>Four decisions shape the answer, and two practices that make them differently cannot be compared.</p>
<ol>
<li><strong>What goes on top.</strong> To set yourself against Ameli averages, use reimbursable fees only. To manage the practice, use total takings, implant and periodontal work included. Both ratios are meaningful; they answer different questions.</li>
<li><strong>Which chairs count.</strong> A chair kept for Friday emergencies does not work like the others. Count the ones in use every week.</li>
<li><strong>Which days count.</strong> Take out holidays, training courses and admin days. The calculator starts from ${n(df.joursSemaine, 'en', 1)} days a week over ${n(df.semaines, 'en')} weeks; change both as soon as your diary disagrees.</li>
<li><strong>Who uses the chair.</strong> In a group practice one chair shared by two dentists carries two people’s fees. If you reason per piece of equipment, sums paid on to an associate dentist (rétrocessions) stay in the total.</li>
</ol>
<p>Once those rules are set, rerun the figure every year the same way. The trend in your own ratio tells you more than any outside benchmark, especially one that nobody actually measures.</p>
<h2>From revenue per day to profit per day</h2>
<p>A chair that bills heavily does not automatically make the practice richer; it depends on the costs it drags in. UNASA’s ${UNASA_YEAR} accounts let you put receipts and profit over the same number of days.</p>
${tableauQuarts('en', h)}
<p>Profit per day climbs faster than receipts in the top quarter, where the cost ratio is lowest. The line-by-line breakdown is on the ${h.a('taux-de-charges', 'cost ratio')} page, while the page on ${h.a('salaire-assistante-dentaire', 'dental nurse pay')} prices the staff needed to run a second chair. To set your total fees against your area, the ${h.a('classement-departements', 'département ranking')} lists every local average (${h.src('ameliHonoraires', 'Assurance Maladie')}).</p>`,
  },
});
