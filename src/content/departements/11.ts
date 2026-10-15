import { defineDep } from '../../lib/dep-types';

export default defineDep({
  code: '11',
  fr: {
    body: (h) => {
      const o = h.D.omni, f = h.F.omni, od = h.D.odf, r = h.rang('omni');
      const partDep = od?.dep != null && od?.tot ? od.dep / od.tot : null;
      return `
<h2>Dans l'Aude, une orthodontie à l'aube d'un renouvellement massif</h2>
<p>Le chiffre le plus frappant de l'Aude concerne ses orthodontistes. Ils sont ${h.num(od?.eff)} en libéral, autant qu'en 2020 (${h.num(od?.eff5)}), et ${h.pct(od?.p60)} d'entre eux ont 60 ans ou plus, bien au-delà de la proportion française (${h.pct(h.F.odf.p60)}). Sur un effectif aussi réduit, chaque départ en retraite retire une part importante de l'offre départementale, de Carcassonne à Narbonne, et la question de la succession se pose pour une majorité de cabinets d'orthodontie.</p>
<p>En attendant, l'activité est intense. Chaque orthodontiste suit ${h.num(od?.patients)} patients par an, au-dessus de la moyenne nationale (${h.num(h.F.odf.patients)}), pour des honoraires moyens de ${h.eur(od?.tot)}, ${h.ecart(od?.tot, h.F.odf.tot)} par rapport à la référence française de la spécialité et ${h.ecart(od?.tot, h.R.odf?.tot)} par rapport à l'Occitanie. Les dépassements, la part des traitements facturée au-delà de la base de remboursement, en représentent ${h.pct(partDep)}. Une patientèle large et des cédants nombreux forment une combinaison peu courante pour un orthodontiste en quête de reprise. Sur un si petit groupe, une seule arrivée peut aussi faire bouger la moyenne d'une année sur l'autre : elle était de ${h.eur(od?.hist['2015'])} en 2015 et de ${h.eur(od?.hist['2019'])} en 2019.</p>
<h2>Omnipraticiens audois : une moyenne qui devance la France</h2>
<p>Les ${h.num(o.eff)} omnipraticiens libéraux de l'Aude déclarent ${h.eur(o.tot)} d'honoraires moyens par praticien actif à part entière. Le montant dépasse la moyenne nationale (${h.ecart(o.tot, f.tot)}) et plus encore celle d'Occitanie (${h.ecart(o.tot, h.R.omni?.tot)}), pour un rang ${r?.rank} sur ${r?.total}. Les dépassements y pèsent un peu plus qu'ailleurs, ${h.eur(o.dep)} pour ${h.eur(f.dep)} en France, à côté de ${h.eur(o.hsd)} d'actes au tarif de convention.</p>
<p>La densité, ${h.num(o.dens)} omnipraticiens pour 100 000 habitants, est voisine de celle du pays (${h.num(f.dens)}), et chaque praticien voit ${h.num(o.patients)} patients différents dans l'année. L'Aude se démarque ainsi de ses voisins méditerranéens plus denses : l'${h.a('dep-34', 'Hérault')} affiche une moyenne bien plus basse, et les ${h.a('dep-66', 'Pyrénées-Orientales')} un niveau légèrement inférieur.</p>
<h2>Une génération d'omnipraticiens qui se renouvelle</h2>
<p>À rebours de l'orthodontie, l'omnipratique audoise rajeunit. ${h.pct(o.m35)} des praticiens ont moins de 35 ans, davantage que la moyenne française (${h.pct(f.m35)}), et ${h.pct(o.p60)} ont 60 ans ou plus (France : ${h.pct(f.p60)}). L'effectif est passé de ${h.num(o.eff5)} à ${h.num(o.eff)} en cinq ans. Les jeunes installés, encore en phase de constitution de leur patientèle, tirent généralement une moyenne vers le bas ; le fait qu'elle reste au-dessus de la France malgré leur poids en dit long sur la demande locale.</p>
<p>L'exercice mixte est quasi inexistant (${h.pct(o.mixte, 1)} des praticiens), de sorte que la moyenne décrit presque uniquement de l'activité libérale. Sur dix ans, elle est passée de ${h.eur(o.hist['2015'])} en 2015 à ${h.eur(o.tot)} en 2025, soit ${h.ecart(o.tot, o.hist['2015'])}, pour ${h.ecart(f.tot, f.hist['2015'])} au niveau national.</p>`;
    },
  },
  en: {
    body: (h) => {
      const o = h.D.omni, f = h.F.omni, od = h.D.odf, r = h.rang('omni');
      const partDep = od?.dep != null && od?.tot ? od.dep / od.tot : null;
      return `
<h2>Aude's orthodontists: a generation close to retirement</h2>
<p>The figure that stands out in Aude concerns orthodontics. There are ${h.num(od?.eff)} orthodontists in private practice, the same as in 2020 (${h.num(od?.eff5)}), and ${h.pct(od?.p60)} of them are 60 or older, far above the French share of ${h.pct(h.F.odf.p60)}. In a group this small, every retirement removes a sizeable slice of local supply between Carcassonne and Narbonne, and succession is an open question for most orthodontic practices in the département.</p>
<p>For now, the work is plentiful. Each orthodontist treats ${h.num(od?.patients)} patients a year, more than the national ${h.num(h.F.odf.patients)}, and average fees reach ${h.eur(od?.tot)}, ${h.ecart(od?.tot, h.F.odf.tot)} against the French specialty benchmark and ${h.ecart(od?.tot, h.R.odf?.tot)} against Occitanie. Dépassements, the part of treatment billed above the reimbursement base, make up ${h.pct(partDep)} of that total. Large patient lists and many sellers are an unusual pairing for an orthodontist looking to take over a practice. With so few practitioners, a single retirement or arrival can also move the orthodontic average sharply from one year to the next, so the 2025 figure is best read alongside its history: ${h.eur(od?.hist['2015'])} in 2015, ${h.eur(od?.hist['2019'])} in 2019.</p>
<h2>General dentists in Aude: an average above the French level</h2>
<p>Aude's ${h.num(o.eff)} general dentists in private practice average ${h.eur(o.tot)} in fees per full-time active practitioner. That beats the national mean (${h.ecart(o.tot, f.tot)}) and the Occitanie one by a wider margin (${h.ecart(o.tot, h.R.omni?.tot)}), for a rank of ${r?.rank} out of ${r?.total}. Dépassements, the extra fees above the agreed tariff, weigh slightly more than elsewhere: ${h.eur(o.dep)} against ${h.eur(f.dep)} for France, alongside ${h.eur(o.hsd)} billed at the convention rate.</p>
<p>Density, at ${h.num(o.dens)} general dentists per 100,000 residents, is close to the national ${h.num(f.dens)}, and each practitioner sees ${h.num(o.patients)} different patients a year. That sets Aude apart from its busier Mediterranean neighbours: ${h.a('dep-34', 'Hérault')} has a much lower average, and ${h.a('dep-66', 'Pyrénées-Orientales')} a slightly lower one.</p>
<h2>A younger cohort in general practice</h2>
<p>General dentistry is heading the other way from orthodontics. ${h.pct(o.m35)} of practitioners are under 35, more than the national ${h.pct(f.m35)}, while ${h.pct(o.p60)} are 60 or over (France: ${h.pct(f.p60)}). Headcount went from ${h.num(o.eff5)} to ${h.num(o.eff)} in five years. Recently settled dentists, still building their lists, usually pull an average down, so a mean that stays above France despite their weight says a good deal about local demand.</p>
<p>Mixed practice, where a dentist also holds a salaried post, is almost absent (${h.pct(o.mixte, 1)}), so the figure reflects private activity nearly on its own. Over ten years it moved from ${h.eur(o.hist['2015'])} in 2015 to ${h.eur(o.tot)} in 2025, a change of ${h.ecart(o.tot, o.hist['2015'])}, against ${h.ecart(f.tot, f.hist['2015'])} nationally.</p>`;
    },
  },
});
