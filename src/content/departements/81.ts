import { defineDep } from '../../lib/dep-types';

export default defineDep({
  code: '81',
  fr: {
    body: (h) => {
      const o = h.D.omni, f = h.F.omni, od = h.D.odf, r = h.rang('omni'), ro = h.rang('odf');
      return `
<h2>Le Tarn, une activité par praticien au diapason de la France</h2>
<p>Certains départements s'écartent de la moyenne nationale par excès ou par défaut ; le Tarn, lui, s'y superpose presque. Un omnipraticien libéral y suit ${h.num(o.patients)} patients différents par an, au niveau de la référence française (${h.num(f.patients)}), et la densité de ${h.num(o.dens)} praticiens pour 100 000 habitants coïncide avec celle du pays (${h.num(f.dens)}). Les honoraires suivent : ${h.eur(o.tot)} par praticien actif à part entière, ${h.ecart(o.tot, f.tot)} face à la France, au rang ${r?.rank} sur ${r?.total}, et ${h.ecart(o.tot, h.R.omni?.tot)} par rapport à la moyenne d'Occitanie, que les grands pôles urbains tirent vers le bas.</p>
<p>La proximité de Toulouse donne tout son relief à ces chiffres. La ${h.a('dep-31', 'Haute-Garonne')} voisine concentre bien plus de praticiens par habitant et affiche l'une des moyennes les plus faibles du pays ; à quelques dizaines de kilomètres, autour d'Albi et de Castres, l'équilibre entre offre et demande n'a rien à voir.</p>
<h2>Une profession tarnaise jeune et en forte croissance</h2>
<p>${h.pct(o.p60)} seulement des omnipraticiens du Tarn ont 60 ans ou plus, sous la moyenne d'Occitanie (${h.pct(h.R.omni?.p60)}) comme sous la moyenne française (${h.pct(f.p60)}), et ${h.pct(o.m35)} ont moins de 35 ans. L'effectif a progressé de ${h.num(o.eff5)} à ${h.num(o.eff)} praticiens en cinq ans, soit ${h.ecart(o.eff, o.eff5)}. Les vagues de départs en retraite qui touchent d'autres départements ruraux concernent donc moins le Tarn à court terme, et les cabinets à reprendre y sont proportionnellement plus rares. L'exercice mixte est quasi absent (${h.pct(o.mixte, 1)}).</p>
<p>Sur la décennie, la moyenne est passée de ${h.eur(o.hist['2015'])} en 2015 à ${h.eur(o.hist['2019'])} en 2019, puis à ${h.eur(o.tot)} en 2025, soit ${h.ecart(o.tot, o.hist['2015'])}. Elle comprend ${h.eur(o.hsd)} d'actes au tarif de convention et ${h.eur(o.dep)} de dépassements, la part facturée au-delà de ces tarifs, en prothèse principalement, un poste supérieur à la moyenne française (${h.eur(f.dep)}).</p>
<h2>Orthodontie dans le Tarn : une moyenne en recul</h2>
<p>Les ${h.num(od?.eff)} orthodontistes du département, ${h.num(od?.eff5)} fin 2020, font exception à la hausse générale. Leur moyenne d'honoraires, ${h.eur(od?.hist['2019'])} en 2019, est revenue à ${h.eur(od?.tot)} en 2025, soit ${h.ecart(od?.tot, od?.hist['2019'])} en six ans, alors que la spécialité progressait au niveau national, de ${h.eur(h.F.odf.hist['2019'])} à ${h.eur(h.F.odf.tot)}. Elle se situe désormais ${h.ecart(od?.tot, h.F.odf.tot)} par rapport à la référence française, au rang ${ro?.rank} sur ${ro?.total}. L'arrivée de nouveaux praticiens, qui se partagent la même demande, peut contribuer à ce recul.</p>
<p>Chaque orthodontiste suit ${h.num(od?.patients)} patients, moins que la moyenne nationale (${h.num(h.F.odf.patients)}). Pour juger un cabinet d'orthodontie tarnais, la moyenne d'une seule année reste donc fragile ; la page ${h.a('orthodontiste', 'consacrée aux orthodontistes')} donne les repères de la spécialité sur plusieurs années.</p>`;
    },
  },
  en: {
    body: (h) => {
      const o = h.D.omni, f = h.F.omni, od = h.D.odf, r = h.rang('omni'), ro = h.rang('odf');
      return `
<h2>Tarn: a workload per dentist that mirrors France</h2>
<p>Most départements drift above or below the national average; Tarn almost sits on top of it. A general dentist in private practice here sees ${h.num(o.patients)} different patients a year, level with the French reference of ${h.num(f.patients)}, and density, at ${h.num(o.dens)} per 100,000 residents, matches the national ${h.num(f.dens)}. Fees follow suit: ${h.eur(o.tot)} per full-time active practitioner, ${h.ecart(o.tot, f.tot)} against France, at position ${r?.rank} of ${r?.total}, and ${h.ecart(o.tot, h.R.omni?.tot)} relative to the Occitanie average, which the big urban centres drag down.</p>
<p>The contrast with Toulouse makes this clearer. Neighbouring ${h.a('dep-31', 'Haute-Garonne')} has far more dentists per head and one of the lowest averages in the country, while a short drive away, around Albi and Castres, supply and demand balance out quite differently. Women make up ${h.pct(o.femmes)} of Tarn's general dentists (France: ${h.pct(f.femmes)}). A practice here can thus be set against the national mean with very little correction, which is rarely the case in the region's denser départements.</p>
<h2>A young, fast-growing profession in Tarn</h2>
<p>Only ${h.pct(o.p60)} of Tarn's general dentists are 60 or older, below both the Occitanie share (${h.pct(h.R.omni?.p60)}) and the French one (${h.pct(f.p60)}), and ${h.pct(o.m35)} are under 35. Headcount rose from ${h.num(o.eff5)} to ${h.num(o.eff)} over five years (${h.ecart(o.eff, o.eff5)}). The retirement waves hitting other rural areas are therefore less pressing here for now, and practices up for sale are proportionally scarcer. Mixed practice, private work combined with a salaried post, is almost non-existent (${h.pct(o.mixte, 1)}).</p>
<p>Across the decade the average moved from ${h.eur(o.hist['2015'])} in 2015 to ${h.eur(o.hist['2019'])} in 2019 and ${h.eur(o.tot)} in 2025, up ${h.ecart(o.tot, o.hist['2015'])}. It is made of ${h.eur(o.hsd)} billed at the convention rate, the tariff set with the health insurer, and ${h.eur(o.dep)} in dépassements, the extra fees charged above it, mainly on prosthetics, a line that exceeds the French average of ${h.eur(f.dep)}.</p>
<h2>Orthodontic fees have slipped since 2019</h2>
<p>The département's ${h.num(od?.eff)} orthodontists, up from ${h.num(od?.eff5)} at the end of 2020, buck the general trend. Their average stood at ${h.eur(od?.hist['2019'])} in 2019 and was ${h.eur(od?.tot)} in 2025, a change of ${h.ecart(od?.tot, od?.hist['2019'])} in six years, while the national specialty figure rose from ${h.eur(h.F.odf.hist['2019'])} to ${h.eur(h.F.odf.tot)}. It now stands ${h.ecart(od?.tot, h.F.odf.tot)} against France, at position ${ro?.rank} of ${ro?.total}. Newcomers sharing the same pool of patients may be part of the explanation.</p>
<p>Each orthodontist treats ${h.num(od?.patients)} patients, fewer than the national ${h.num(h.F.odf.patients)}. A single year's mean is thus a shaky basis for valuing an orthodontic practice in Tarn; the ${h.a('orthodontiste', 'orthodontist page')} shows the specialty's benchmarks over several years.</p>`;
    },
  },
});
