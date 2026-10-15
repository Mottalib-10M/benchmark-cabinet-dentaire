/**
 * Ratios de gestion d'un cabinet dentaire et bénéfice estimé. Fonctions pures, testées dans
 * `cabinet.test.ts`. Les références de la profession (taux de charges, bénéfice moyen) viennent
 * de `data/params-2026.json` et sont passées en argument : le moteur n'en écrit aucune en dur.
 */
export interface Charges {
  /** Salaires bruts et cotisations patronales des salariés du cabinet. */
  personnel: number;
  /** Factures du laboratoire de prothèse. */
  prothesiste: number;
  /** Fournitures, consommables, petit matériel, implants achetés. */
  fournitures: number;
  /** Loyer et charges locatives. */
  loyer: number;
  /** Tout le reste : amortissements, entretien, assurances, logiciel, honoraires comptables… */
  autres: number;
}
export interface CabinetInput {
  recettes: number;
  fauteuils: number;
  /** Salariés en équivalent temps plein. */
  salaries: number;
  joursSemaine: number;
  semaines: number;
  /** Charges saisies. Un total nul déclenche l'estimation par le taux de référence. */
  charges: Charges;
  /** Cotisations sociales personnelles du praticien (Urssaf, CARCDSF) de l'année. 0 = non saisies. */
  cotisationsPerso: number;
}
export interface CabinetOut {
  joursAn: number;
  parFauteuil: number | null;
  parJour: number | null;
  parSalarie: number | null;
  /** Charges retenues : saisies, ou estimées par le taux de référence. */
  charges: number;
  chargesEstimees: boolean;
  tauxCharges: number | null;
  partPersonnel: number | null;
  partProthese: number | null;
  partLoyer: number | null;
  /** Bénéfice avant impôt : recettes − charges − cotisations personnelles saisies. */
  benefice: number;
}

export const totalCharges = (c: Charges) => Math.max(0, c.personnel) + Math.max(0, c.prothesiste) + Math.max(0, c.fournitures) + Math.max(0, c.loyer) + Math.max(0, c.autres);

const share = (x: number, r: number) => (r > 0 && x > 0 ? x / r : null);

/**
 * @param tauxReference taux de charges de référence de la spécialité (charges / recettes), utilisé
 *   seulement si aucune charge n'est saisie. Il comprend ce que la source y met : voir params.
 */
export function cabinet(i: CabinetInput, tauxReference: number): CabinetOut {
  const r = Math.max(0, i.recettes);
  const joursAn = Math.max(0, i.joursSemaine) * Math.max(0, i.semaines);
  const saisies = totalCharges(i.charges) + Math.max(0, i.cotisationsPerso);
  const chargesEstimees = saisies === 0;
  const charges = chargesEstimees ? r * tauxReference : saisies;
  return {
    joursAn,
    parFauteuil: i.fauteuils > 0 ? r / i.fauteuils : null,
    parJour: joursAn > 0 ? r / joursAn : null,
    parSalarie: i.salaries > 0 ? r / i.salaries : null,
    charges,
    chargesEstimees,
    tauxCharges: r > 0 ? charges / r : null,
    partPersonnel: share(i.charges.personnel, r),
    partProthese: share(i.charges.prothesiste, r),
    partLoyer: share(i.charges.loyer, r),
    benefice: r - charges,
  };
}
