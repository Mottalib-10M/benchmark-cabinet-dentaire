import { defineDep } from '../../lib/dep-types';

export default defineDep({
  code: '30',
  fr: {
    body: (h) => {
      const o = h.D.omni, f = h.F.omni, od = h.D.odf, st = h.D.stomato, r = h.rang('omni'), ro = h.rang('odf');
      return `
<h2>Le Gard, un département calé sur la moyenne nationale</h2>
<p>Dans le Gard, un omnipraticien libéral actif à part entière facture en moyenne ${h.eur(o.tot)} d'honoraires, un niveau presque aligné sur la France (${h.ecart(o.tot, f.tot)}) et supérieur de ${h.ecart(o.tot, h.R.omni?.tot)} à la moyenne d'Occitanie. Le département se place au rang ${r?.rank} sur ${r?.total}. La composition du chiffre ressemble elle aussi au profil national : ${h.eur(o.hsd)} au tarif de convention et ${h.eur(o.dep)} de dépassements, ces suppléments facturés au-delà du tarif, surtout en prothèse, quand la France affiche ${h.eur(f.hsd)} et ${h.eur(f.dep)}. Pour situer un cabinet de Nîmes ou d'Alès, la référence nationale et la référence départementale se confondent presque.</p>
<p>Cette proximité reflète un équilibre de l'offre. Le Gard compte ${h.num(o.dens)} omnipraticiens pour 100 000 habitants, à peine plus que la France (${h.num(f.dens)}), loin des densités de l'${h.a('dep-34', 'Hérault')} voisin ou de la Haute-Garonne. Chaque praticien suit ${h.num(o.patients)} patients différents par an, un peu en dessous des ${h.num(f.patients)} relevés au niveau national.</p>
<h2>Un effectif gardois presque stable, une pyramide à surveiller</h2>
<p>Là où les pôles universitaires de la région gagnent des praticiens chaque année, le Gard avance lentement : ${h.num(o.eff5)} omnipraticiens fin 2020, ${h.num(o.eff)} fin 2025. ${h.pct(o.p60)} ont 60 ans ou plus, une part légèrement supérieure à la moyenne française (${h.pct(f.p60)}), et ${h.pct(o.m35)} ont moins de 35 ans, moins qu'en France (${h.pct(f.m35)}). Avec un renouvellement aussi lent, les départs en retraite des prochaines années pèseront davantage sur l'offre, et le nombre de cabinets à céder pourrait croître plus vite que celui des repreneurs. L'exercice mixte concerne ${h.pct(o.mixte, 1)} des praticiens, contre ${h.pct(f.mixte, 1)} en France.</p>
<p>Sur dix ans, la moyenne départementale est passée de ${h.eur(o.hist['2015'])} en 2015 à ${h.eur(o.hist['2019'])} en 2019, puis à ${h.eur(o.tot)}, soit ${h.ecart(o.tot, o.hist['2015'])}. La France a progressé moins vite sur la même période (${h.ecart(f.tot, f.hist['2015'])}), ce qui a permis au département de combler l'essentiel de son retard.</p>
<h2>Orthodontie et stomatologie : deux profils opposés</h2>
<p>Les ${h.num(od?.eff)} orthodontistes du Gard, ${h.num(od?.eff5)} cinq ans plus tôt, affichent ${h.eur(od?.tot)} d'honoraires moyens, ${h.ecart(od?.tot, h.F.odf.tot)} face à la moyenne nationale de la spécialité, au rang ${ro?.rank} sur ${ro?.total}. C'est le groupe le plus âgé du tableau : ${h.pct(od?.p60)} des orthodontistes ont dépassé 60 ans, contre ${h.pct(h.F.odf.p60)} en France, ce qui laisse prévoir plusieurs cessions de cabinets d'orthodontie dans les années à venir. Chaque praticien suit aujourd'hui ${h.num(od?.patients)} patients.</p>
<p>La stomatologie se porte mieux : ${h.num(st?.eff)} stomatologues libéraux, une moyenne publiée de ${h.eur(st?.tot)}, ${h.ecart(st?.tot, h.F.stomato.tot)} par rapport à la France, et ${h.num(st?.patients)} patients par praticien, nettement au-dessus de la référence nationale (${h.num(h.F.stomato.patients)}). Le ${h.a('classement-departements', 'classement des départements')} situe ces chiffres face au reste du pays.</p>`;
    },
  },
  en: {
    body: (h) => {
      const o = h.D.omni, f = h.F.omni, od = h.D.odf, st = h.D.stomato, r = h.rang('omni'), ro = h.rang('odf');
      return `
<h2>Gard: a département that tracks the French average</h2>
<p>A full-time active general dentist in Gard bills ${h.eur(o.tot)} a year on average, almost exactly the French level (${h.ecart(o.tot, f.tot)}) and ${h.ecart(o.tot, h.R.omni?.tot)} relative to the Occitanie mean. That puts the département at position ${r?.rank} of ${r?.total}. The breakdown mirrors the national profile too: ${h.eur(o.hsd)} at the convention rate, the tariff negotiated with the health insurer, and ${h.eur(o.dep)} in dépassements, the extra fees charged on top, chiefly for prosthetics, against ${h.eur(f.hsd)} and ${h.eur(f.dep)} nationally. For a practice in Nîmes or Alès, the local and national benchmarks are practically interchangeable.</p>
<p>Supply is balanced as well. With ${h.num(o.dens)} general dentists per 100,000 residents, Gard sits just above France (${h.num(f.dens)}) and well short of the densities found in neighbouring ${h.a('dep-34', 'Hérault')} or in Haute-Garonne. Each dentist sees ${h.num(o.patients)} distinct patients a year, slightly under the national ${h.num(f.patients)}. Women account for ${h.pct(o.femmes)} of the profession, in line with France (${h.pct(f.femmes)}). The local figure therefore needs little adjustment before it serves as a yardstick for a practice here.</p>
<h2>Flat headcount and an ageing base in Gard</h2>
<p>While the region's university hubs add dentists every year, Gard barely moves: ${h.num(o.eff5)} general practitioners at the end of 2020, ${h.num(o.eff)} at the end of 2025. ${h.pct(o.p60)} are 60 or over, a touch above the French ${h.pct(f.p60)}, and ${h.pct(o.m35)} are under 35, fewer than nationally (${h.pct(f.m35)}). Slow renewal means coming retirements will weigh more heavily on supply, and practices offered for sale may come to outnumber buyers. Only ${h.pct(o.mixte, 1)} of dentists split their time between private and salaried work (France: ${h.pct(f.mixte, 1)}).</p>
<p>Over ten years the local average went from ${h.eur(o.hist['2015'])} in 2015 to ${h.eur(o.hist['2019'])} in 2019 and ${h.eur(o.tot)} in 2025, a rise of ${h.ecart(o.tot, o.hist['2015'])}. France grew by ${h.ecart(f.tot, f.hist['2015'])} over the same span, so most of the earlier gap has closed.</p>
<h2>Orthodontics and stomatology pull in opposite directions</h2>
<p>Gard's ${h.num(od?.eff)} orthodontists, against ${h.num(od?.eff5)} five years earlier, average ${h.eur(od?.tot)} in fees, ${h.ecart(od?.tot, h.F.odf.tot)} relative to the national specialty mean, at position ${ro?.rank} of ${ro?.total}. They are also the oldest group in the table: ${h.pct(od?.p60)} have passed 60, compared with ${h.pct(h.F.odf.p60)} across France, which points to a series of orthodontic practice transfers in the years ahead. Each orthodontist currently treats ${h.num(od?.patients)} patients.</p>
<p>Stomatology tells a healthier story. The ${h.num(st?.eff)} stomatologists (doctors specialising in oral and jaw surgery) report a published average of ${h.eur(st?.tot)}, ${h.ecart(st?.tot, h.F.stomato.tot)} against France, with ${h.num(st?.patients)} patients each, far above the national ${h.num(h.F.stomato.patients)}. The ${h.a('classement-departements', 'département ranking')} sets these figures against the rest of the country.</p>`;
    },
  },
});
