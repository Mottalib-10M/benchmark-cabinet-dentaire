import { defineDep } from '../../lib/dep-types';

export default defineDep({
  code: '84',
  fr: {
    body: (h) => {
      const o = h.D.omni, f = h.F.omni, od = h.D.odf, r = h.rang('omni');
      const partDep = o.dep != null && o.tot ? o.dep / o.tot : null;
      return `
<h2>Le Vaucluse, meilleure moyenne de Provence-Alpes-Côte d'Azur</h2>
<p>Aucun département de la région ne dépasse le Vaucluse pour les honoraires des omnipraticiens : ${h.eur(o.tot)} par praticien actif à part entière, ${h.ecart(o.tot, h.R.omni?.tot)} par rapport à la moyenne régionale et ${h.ecart(o.tot, f.tot)} par rapport à la France, au rang ${r?.rank} sur ${r?.total}. Le contraste avec le littoral est saisissant : le ${h.a('dep-83', 'Var')}, les Bouches-du-Rhône et plus encore les Alpes-Maritimes comptent bien plus de praticiens par habitant pour des moyennes inférieures. Ici, la densité s'établit à ${h.num(o.dens)} omnipraticiens pour 100 000 habitants, au niveau de la France (${h.num(f.dens)}).</p>
<p>Autour d'Avignon, de Carpentras, d'Orange et de Cavaillon, la patientèle par praticien, ${h.num(o.patients)} personnes par an, reste un peu sous la moyenne nationale (${h.num(f.patients)}) mais au-dessus de la valeur régionale (${h.num(h.R.omni?.patients)}).</p>
<h2>Le poids des dépassements dans le chiffre vauclusien</h2>
<p>La singularité du département tient à la prothèse. Les dépassements, c'est-à-dire la part facturée au-delà des tarifs de convention, atteignent ${h.eur(o.dep)} par praticien, soit ${h.pct(partDep)} des honoraires, au-dessus de la moyenne française (${h.eur(f.dep)}). La part au tarif de convention, ${h.eur(o.hsd)}, s'écarte peu de la France (${h.eur(f.hsd)}). C'est donc sur ce poste prothétique que se joue l'essentiel de la différence avec la référence nationale, et un cabinet local qui se mesure à la moyenne vauclusienne se compare à une activité de prothèse soutenue.</p>
<p>La dynamique sur dix ans est forte : ${h.eur(o.hist['2015'])} en 2015, ${h.eur(o.hist['2019'])} en 2019, ${h.eur(o.tot)} en 2025, soit ${h.ecart(o.tot, o.hist['2015'])}, quand la France progressait de ${h.ecart(f.tot, f.hist['2015'])} sur la même période.</p>
<h2>Un effectif stable et vieillissant</h2>
<p>Le nombre d'omnipraticiens libéraux n'a presque pas bougé : ${h.num(o.eff5)} fin 2020, ${h.num(o.eff)} fin 2025. Les jeunes sont moins présents qu'ailleurs, avec ${h.pct(o.m35)} de moins de 35 ans contre ${h.pct(f.m35)} en France, tandis que ${h.pct(o.p60)} ont 60 ans ou plus (France : ${h.pct(f.p60)}). Ce déséquilibre laisse prévoir des cessions de cabinets dans les années à venir, dans un département sans faculté d'odontologie, situé entre les pôles de formation de Marseille et de Montpellier. Une offre stable face à une demande soutenue explique sans doute une partie de la moyenne élevée. L'exercice mixte reste rare (${h.pct(o.mixte, 1)}).</p>
<p>Les ${h.num(od?.eff)} orthodontistes du Vaucluse affichent ${h.eur(od?.tot)} d'honoraires moyens, ${h.ecart(od?.tot, h.F.odf.tot)} par rapport à la référence nationale et au-dessus de la moyenne régionale (${h.eur(h.R.odf?.tot)}), pour ${h.num(od?.patients)} patients chacun. ${h.pct(od?.p60)} d'entre eux ont 60 ans ou plus. Leur moyenne a progressé plus vite que celle de la spécialité en France depuis 2015, de ${h.eur(od?.hist['2015'])} à ${h.eur(od?.tot)}, soit ${h.ecart(od?.tot, od?.hist['2015'])} contre ${h.ecart(h.F.odf.tot, h.F.odf.hist['2015'])}. Le ${h.a('classement-departements', 'classement des départements')} situe ces repères à l'échelle du pays.</p>`;
    },
  },
  en: {
    body: (h) => {
      const o = h.D.omni, f = h.F.omni, od = h.D.odf, r = h.rang('omni');
      const partDep = o.dep != null && o.tot ? o.dep / o.tot : null;
      return `
<h2>Vaucluse: the highest average in Provence-Alpes-Côte d'Azur</h2>
<p>No département in the region beats Vaucluse on general dentists' fees. A full-time active practitioner averages ${h.eur(o.tot)}, ${h.ecart(o.tot, h.R.omni?.tot)} against the regional mean and ${h.ecart(o.tot, f.tot)} against France, ranking ${r?.rank} out of ${r?.total}. The contrast with the coast is sharp: ${h.a('dep-83', 'Var')}, Bouches-du-Rhône and above all Alpes-Maritimes have many more dentists per head and lower averages. Here density is ${h.num(o.dens)} per 100,000 residents, level with the French ${h.num(f.dens)}.</p>
<p>Across Avignon, Carpentras, Orange and Cavaillon, each dentist sees ${h.num(o.patients)} different patients a year, a little under the national ${h.num(f.patients)} but above the regional figure of ${h.num(h.R.omni?.patients)}.</p>
<h2>Prosthetics drive the difference</h2>
<p>What sets Vaucluse apart is the weight of dépassements, the amounts billed above the convention rate agreed with the health insurer, mostly on crowns and bridges. They reach ${h.eur(o.dep)} per practitioner, ${h.pct(partDep)} of total fees, above the French ${h.eur(f.dep)}. The tariff-based part, ${h.eur(o.hsd)}, is close to the national ${h.eur(f.hsd)}. Most of the gap with France therefore comes from prosthetic work, and a local practice benchmarking itself against the Vaucluse mean is measuring up to a busy prosthetic activity.</p>
<p>The ten-year trend is steep: ${h.eur(o.hist['2015'])} in 2015, ${h.eur(o.hist['2019'])} in 2019 and ${h.eur(o.tot)} in 2025, a rise of ${h.ecart(o.tot, o.hist['2015'])} while France grew by ${h.ecart(f.tot, f.hist['2015'])}.</p>
<h2>A flat, greying workforce</h2>
<p>Headcount has hardly changed, with ${h.num(o.eff5)} general dentists in private practice at the end of 2020 and ${h.num(o.eff)} at the end of 2025. Young practitioners are scarcer than elsewhere: ${h.pct(o.m35)} are under 35, against ${h.pct(f.m35)} nationally, while ${h.pct(o.p60)} are 60 or over (France: ${h.pct(f.p60)}). That imbalance points to practices changing hands in the coming years, in a département with no dental school of its own, sitting between the Marseille and Montpellier faculties. Stable supply meeting steady demand probably accounts for part of the high average. Mixed private and salaried practice is uncommon (${h.pct(o.mixte, 1)}), and women make up ${h.pct(o.femmes)} of the profession, close to the French ${h.pct(f.femmes)}.</p>
<p>Vaucluse's ${h.num(od?.eff)} orthodontists average ${h.eur(od?.tot)}, ${h.ecart(od?.tot, h.F.odf.tot)} relative to the national benchmark and above the regional ${h.eur(h.R.odf?.tot)}, with ${h.num(od?.patients)} patients each; ${h.pct(od?.p60)} of them are 60 or older. Their fees have also outpaced the specialty nationally since 2015, rising from ${h.eur(od?.hist['2015'])} to ${h.eur(od?.tot)} (${h.ecart(od?.tot, od?.hist['2015'])}, against ${h.ecart(h.F.odf.tot, h.F.odf.hist['2015'])} for France), and dépassements make up most of the total, as is usual for orthodontic treatment billed above the reimbursement base. The ${h.a('classement-departements', 'département ranking')} puts these reference points in national context.</p>`;
    },
  },
});
