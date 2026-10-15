import { defineDep } from '../../lib/dep-types';

export default defineDep({
  code: '06',
  fr: {
    body: (h) => {
      const o = h.D.omni, f = h.F.omni, od = h.D.odf, r = h.rang('omni'), ro = h.rang('odf');
      const partDep = od?.dep != null && od?.tot ? od.dep / od.tot : null;
      return `
<h2>Alpes-Maritimes : l'offre la plus abondante, la patientèle la plus mince</h2>
<p>Sur la Côte d'Azur, la concurrence entre cabinets dentaires atteint un niveau que presque aucun autre département ne connaît. Les Alpes-Maritimes comptent ${h.num(o.dens)} omnipraticiens libéraux pour 100 000 habitants, ${h.ecart(o.dens, f.dens)} par rapport à la France, soit ${h.num(o.eff)} praticiens. Chacun ne suit en moyenne que ${h.num(o.patients)} patients différents par an, quand la référence nationale est de ${h.num(f.patients)}. Les honoraires en découlent : ${h.eur(o.tot)} par praticien actif à part entière, ${h.ecart(o.tot, f.tot)} face à la moyenne française et ${h.ecart(o.tot, h.R.omni?.tot)} face à celle de la région. Le département occupe le rang ${r?.rank} sur ${r?.total}, tout au bas du tableau.</p>
<p>Le retard porte sur les deux composantes : ${h.eur(o.hsd)} au tarif de convention et ${h.eur(o.dep)} de dépassements, ce supplément facturé au-delà du tarif, surtout en prothèse, pour ${h.eur(f.hsd)} et ${h.eur(f.dep)} en France. L'écart semble donc tenir au volume d'actes par cabinet, entre Nice, Cannes, Antibes et Menton, plus qu'aux tarifs pratiqués.</p>
<h2>Une pyramide azuréenne plus âgée et un exercice partagé</h2>
<p>${h.pct(o.p60)} des omnipraticiens du département ont 60 ans ou plus, au-dessus de la moyenne nationale (${h.pct(f.p60)}), et ${h.pct(o.m35)} ont moins de 35 ans, moins qu'en France (${h.pct(f.m35)}). Des praticiens en fin de carrière qui réduisent leur activité pèsent sur la moyenne, tout comme les ${h.pct(o.mixte)} qui partagent leur temps entre libéral et salariat (France : ${h.pct(f.mixte)}). L'effectif a pourtant continué de croître, de ${h.num(o.eff5)} à ${h.num(o.eff)} en cinq ans, avec la faculté d'odontologie de Nice à proximité. La progression des honoraires a été plus lente qu'au niveau national : ${h.ecart(o.tot, o.hist['2015'])} depuis 2015, contre ${h.ecart(f.tot, f.hist['2015'])} pour la France.</p>
<p>Pour une reprise ou une installation, le constat a deux faces. Une moyenne départementale basse rend la comparaison flatteuse pour un cabinet établi, alors que la référence nationale reste bien plus exigeante. Mettre un cabinet niçois face aux deux chiffres, puis face au ${h.a('ca-par-fauteuil', "chiffre d'affaires par fauteuil")}, donne une image plus juste de sa position.</p>
<h2>Orthodontie sur la Côte d'Azur : densité record, moyenne au plancher</h2>
<p>Le même phénomène touche l'orthodontie. Les ${h.num(od?.eff)} spécialistes en orthopédie dento-faciale représentent ${h.num(od?.dens, 1)} praticiens pour 100 000 habitants, presque le double de la France (${h.num(h.F.odf.dens, 1)}). Leur moyenne, ${h.eur(od?.tot)}, se situe ${h.ecart(od?.tot, h.F.odf.tot)} par rapport à la référence nationale, au rang ${ro?.rank} sur ${ro?.total}, avec ${h.num(od?.patients)} patients par orthodontiste contre ${h.num(h.F.odf.patients)} en France. Les dépassements, part des traitements facturée au-delà de la base de remboursement, y pèsent ${h.pct(partDep)} du total, et ${h.pct(od?.mixte)} des orthodontistes ont aussi une activité salariée. Juger un cabinet d'orthodontie azuréen à l'aune de la seule moyenne française donnerait une image trompeuse du marché local.</p>`;
    },
  },
  en: {
    body: (h) => {
      const o = h.D.omni, f = h.F.omni, od = h.D.odf, r = h.rang('omni'), ro = h.rang('odf');
      const partDep = od?.dep != null && od?.tot ? od.dep / od.tot : null;
      return `
<h2>Alpes-Maritimes: the densest supply and the thinnest patient lists</h2>
<p>On the Riviera, competition between dental practices reaches a level almost no other département experiences. Alpes-Maritimes has ${h.num(o.dens)} general dentists in private practice per 100,000 residents, ${h.ecart(o.dens, f.dens)} on France, or ${h.num(o.eff)} practitioners in all. Each one sees only ${h.num(o.patients)} different patients a year on average, where the national figure is ${h.num(f.patients)}. Fees follow: ${h.eur(o.tot)} per full-time active practitioner, ${h.ecart(o.tot, f.tot)} against the French mean and ${h.ecart(o.tot, h.R.omni?.tot)} against the regional one, placing the département at position ${r?.rank} of ${r?.total}, at the very foot of the table.</p>
<p>Both components lag: ${h.eur(o.hsd)} billed at the convention rate, the tariff agreed with the health insurer, and ${h.eur(o.dep)} in dépassements, the extra fees charged above it, mostly on prosthetics, compared with ${h.eur(f.hsd)} and ${h.eur(f.dep)} nationally. The shortfall seems to come from the volume of treatment per practice across Nice, Cannes, Antibes and Menton rather than from pricing.</p>
<h2>An older profile and shared working time</h2>
<p>${h.pct(o.p60)} of general dentists here are 60 or older, above the French ${h.pct(f.p60)}, and ${h.pct(o.m35)} are under 35, fewer than nationally (${h.pct(f.m35)}). Dentists winding down towards retirement weigh on the mean, as do the ${h.pct(o.mixte)} who divide their week between private and salaried work (France: ${h.pct(f.mixte)}). Headcount has nonetheless kept rising, from ${h.num(o.eff5)} to ${h.num(o.eff)} in five years, with Nice's dental school close by. Women make up ${h.pct(o.femmes)} of general dentists, fewer than the national ${h.pct(f.femmes)}. Fees have grown more slowly than in France as a whole: ${h.ecart(o.tot, o.hist['2015'])} since 2015, against ${h.ecart(f.tot, f.hist['2015'])} nationally.</p>
<p>For a purchase or a new practice, this cuts both ways. A low local average makes an established practice look strong by comparison, while the national benchmark sets a much higher bar. Reading a Nice practice against both figures, and then against ${h.a('ca-par-fauteuil', 'turnover per dental chair')}, gives a fairer picture of where it stands.</p>
<h2>Riviera orthodontics: record density, rock-bottom average</h2>
<p>Orthodontics shows the same pattern. The ${h.num(od?.eff)} specialists in dentofacial orthopaedics (ODF, the French orthodontic qualification) amount to ${h.num(od?.dens, 1)} per 100,000 residents, nearly twice the French ${h.num(h.F.odf.dens, 1)}. Their average of ${h.eur(od?.tot)} is ${h.ecart(od?.tot, h.F.odf.tot)} relative to the national benchmark, at position ${ro?.rank} of ${ro?.total}, with ${h.num(od?.patients)} patients per orthodontist against ${h.num(h.F.odf.patients)} in France. Dépassements, the share of treatment billed above the reimbursement base, account for ${h.pct(partDep)} of the total, and ${h.pct(od?.mixte)} of orthodontists also hold a salaried post. Measuring a Riviera orthodontic practice against the French mean alone would misrepresent the local market.</p>`;
    },
  },
});
