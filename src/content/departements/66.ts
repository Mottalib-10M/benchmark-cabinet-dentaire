import { defineDep } from '../../lib/dep-types';

export default defineDep({
  code: '66',
  fr: {
    body: (h) => {
      const o = h.D.omni, f = h.F.omni, od = h.D.odf, r = h.rang('omni');
      return `
<h2>Pyrénées-Orientales : un département frontalier qui attire les installations</h2>
<p>Entre la Méditerranée, les Pyrénées et la frontière espagnole, les Pyrénées-Orientales ont gagné des chirurgiens-dentistes plus vite que la plupart des départements : ${h.num(o.eff5)} omnipraticiens libéraux fin 2020, ${h.num(o.eff)} fin 2025, soit ${h.ecart(o.eff, o.eff5)}. La densité atteint ${h.num(o.dens)} praticiens pour 100 000 habitants, au-dessus de la France (${h.num(f.dens)}). Malgré cet afflux, la moyenne d'honoraires tient bon : ${h.eur(o.tot)} par praticien actif à part entière, ${h.ecart(o.tot, f.tot)} par rapport à la référence nationale et ${h.ecart(o.tot, h.R.omni?.tot)} face à la moyenne régionale, au rang ${r?.rank} sur ${r?.total}.</p>
<p>Les arrivées ne sont pas le seul fait des jeunes diplômés. La part des moins de 35 ans, ${h.pct(o.m35)}, reste inférieure à la moyenne française (${h.pct(f.m35)}), ce qui laisse penser que des praticiens déjà expérimentés viennent aussi s'implanter autour de Perpignan ou sur la côte. À l'autre extrémité, ${h.pct(o.p60)} des omnipraticiens ont 60 ans ou plus, sous le niveau national (${h.pct(f.p60)}).</p>
<h2>Plus de soins conventionnels, moins de prothèse facturée en sus</h2>
<p>La répartition du chiffre catalan s'écarte du modèle national. La part au tarif de convention, ${h.eur(o.hsd)}, dépasse la moyenne française (${h.eur(f.hsd)}), tandis que les dépassements, c'est-à-dire ce qui est facturé au-delà de ces tarifs, en prothèse principalement, restent en retrait : ${h.eur(o.dep)} contre ${h.eur(f.dep)}. Un cabinet perpignanais dont le total ressemble à la moyenne peut donc reposer davantage sur les soins remboursés et moins sur les travaux prothétiques qu'un cabinet comparable ailleurs. Chaque praticien suit ${h.num(o.patients)} patients différents dans l'année, pour ${h.num(f.patients)} en France.</p>
<p>La progression a été régulière : ${h.eur(o.hist['2015'])} en 2015, ${h.eur(o.hist['2019'])} en 2019, ${h.eur(o.tot)} en 2025. L'exercice mixte, qui associe cabinet et poste salarié, reste rare (${h.pct(o.mixte, 1)} des praticiens, contre ${h.pct(f.mixte, 1)} en France), si bien que la moyenne départementale décrit presque uniquement de l'activité libérale.</p>
<h2>Une orthodontie resserrée mais proche des standards nationaux</h2>
<p>Seuls ${h.num(od?.eff)} orthodontistes qualifiés en orthopédie dento-faciale exercent en libéral dans les Pyrénées-Orientales, soit ${h.num(od?.dens, 1)} pour 100 000 habitants, sous la densité nationale de ${h.num(h.F.odf.dens, 1)}. Cette offre limitée va de pair avec une activité soutenue : ${h.num(od?.patients)} patients par praticien, au-dessus de la référence française (${h.num(h.F.odf.patients)}), et ${h.eur(od?.tot)} d'honoraires moyens, ${h.ecart(od?.tot, h.F.odf.tot)} face à la moyenne de la spécialité et nettement au-dessus de celle d'Occitanie (${h.eur(h.R.odf?.tot)}). ${h.pct(od?.p60)} seulement de ces orthodontistes ont 60 ans ou plus, ce qui annonce peu de départs à court terme.</p>
<p>Les stomatologues sont proportionnellement nombreux dans le département, mais leur moyenne n'est pas diffusée, faute d'un nombre suffisant de praticiens actifs à part entière pour lever le secret statistique. Pour un projet d'orthodontie ou d'association, la page ${h.a('orthodontiste', 'des orthodontistes')} rassemble les repères de la spécialité.</p>`;
    },
  },
  en: {
    body: (h) => {
      const o = h.D.omni, f = h.F.omni, od = h.D.odf, r = h.rang('omni');
      return `
<h2>Pyrénées-Orientales: a border département that keeps drawing new dentists</h2>
<p>Squeezed between the Mediterranean, the Pyrenees and Spain, Pyrénées-Orientales has added general dentists faster than most of France. There were ${h.num(o.eff5)} in private practice at the end of 2020 and ${h.num(o.eff)} at the end of 2025, a change of ${h.ecart(o.eff, o.eff5)}. Density has reached ${h.num(o.dens)} per 100,000 residents, above the French ${h.num(f.dens)}. Yet the average has held up: ${h.eur(o.tot)} in fees per full-time active practitioner, ${h.ecart(o.tot, f.tot)} against the national figure and ${h.ecart(o.tot, h.R.omni?.tot)} against Occitanie as a whole, at position ${r?.rank} of ${r?.total}.</p>
<p>Newcomers are not only fresh graduates. The under-35 share, ${h.pct(o.m35)}, is lower than the national ${h.pct(f.m35)}, which suggests that dentists with some years of practice behind them are also moving to Perpignan and the coast. At the other end, ${h.pct(o.p60)} are 60 or older, below France's ${h.pct(f.p60)}. Women represent ${h.pct(o.femmes)} of general dentists, slightly fewer than nationally (${h.pct(f.femmes)}).</p>
<h2>A fee mix weighted towards reimbursed care</h2>
<p>How the total breaks down sets this département apart. Fees at the convention rate, the tariff agreed with the health insurer, average ${h.eur(o.hsd)}, more than the French ${h.eur(f.hsd)}. Dépassements, the extra amounts billed above that tariff, mostly on prosthetics, are lower: ${h.eur(o.dep)} against ${h.eur(f.dep)}. A Perpignan practice whose total looks average may therefore lean more on routine reimbursed treatment, and less on crowns and bridges, than a similar practice elsewhere. Each dentist sees ${h.num(o.patients)} different patients a year (France: ${h.num(f.patients)}).</p>
<p>Growth has been steady, from ${h.eur(o.hist['2015'])} in 2015 to ${h.eur(o.hist['2019'])} in 2019 and ${h.eur(o.tot)} in 2025. Mixed practice, a private surgery combined with a salaried job, is uncommon here (${h.pct(o.mixte, 1)} against ${h.pct(f.mixte, 1)} nationally), so the local mean describes private work almost exclusively.</p>
<h2>A small orthodontic market close to national standards</h2>
<p>Only ${h.num(od?.eff)} orthodontists qualified in dentofacial orthopaedics (ODF) practise privately in Pyrénées-Orientales, or ${h.num(od?.dens, 1)} per 100,000 residents against ${h.num(h.F.odf.dens, 1)} nationally. Limited supply goes with busy lists: ${h.num(od?.patients)} patients per orthodontist, above the French ${h.num(h.F.odf.patients)}, and average fees of ${h.eur(od?.tot)}, ${h.ecart(od?.tot, h.F.odf.tot)} relative to the specialty benchmark and well above the Occitanie figure of ${h.eur(h.R.odf?.tot)}. Just ${h.pct(od?.p60)} of them are 60 or over, so few retirements are in sight. All of these figures rest on a small headcount, and one practitioner moving in or out can shift them noticeably from one year to the next.</p>
<p>Stomatologists are relatively numerous in the département, but their average is withheld under statistical confidentiality, since too few full-time practitioners fall within the published scope. The ${h.a('orthodontiste', 'orthodontist page')} gathers the specialty's national reference points.</p>`;
    },
  },
});
