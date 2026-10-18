import { redevance, tauxPointMort } from '../engine/organisation-equipe';
import { T, eur, pct, type L } from './_kit';
/** Redevance versée par un collaborateur libéral au titulaire du cabinet. */
export default (l: L) => ({
  title: T(l, 'Redevance d’un collaborateur libéral', 'An associate dentist’s fee to the practice'),
  cta: T(l, 'Faire le diagnostic du cabinet', 'Run the practice check-up'),
  inputs: [
    { id: 'h', label: T(l, 'Honoraires encaissés par le collaborateur', 'Fees collected by the associate'), def: 200000, unit: '€', max: 3_000_000 },
    { id: 't', label: T(l, 'Taux de redevance (exemple, à remplacer par celui de votre contrat)', 'Fee rate (example, replace with your contract’s)'), def: 30, unit: '%', max: 100, decimals: 1 },
    { id: 'c', label: T(l, 'Charges annuelles du fauteuil mis à disposition', 'Annual costs of the chair provided'), def: 50000, unit: '€', max: 1_000_000 },
  ],
  run: ({ h, t, c }: Record<string, number>) => {
    const r = redevance({ honoraires: h, taux: t / 100, chargesFauteuil: c });
    const pm = tauxPointMort(h, c);
    return {
      head: [T(l, 'Redevance versée au titulaire', 'Fee paid to the practice owner'), eur(r.redevance, l)],
      rows: [
        [T(l, 'Reste au collaborateur, avant ses cotisations', 'Left to the associate, before contributions'), eur(r.reste, l)],
        [T(l, 'Charges du fauteuil couvertes', 'Chair costs covered'), r.couverture != null ? pct(r.couverture, l, 0) : '–'],
        [T(l, 'Taux qui couvre juste ces charges', 'Rate that just covers those costs'), pm != null ? pct(pm, l, 1) : '–'],
      ] as [string, string][],
      note: T(l,
        'Aucun texte ni l’Ordre ne fixe de taux de redevance : il se négocie et figure au contrat écrit. Le taux proposé n’est qu’un exemple de saisie.',
        'No law and no Ordre guidance sets the fee rate: it is negotiated and written into the contract. The rate shown is only a sample entry.'),
    };
  },
});
