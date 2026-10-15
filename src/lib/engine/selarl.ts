/**
 * Impôt sur les sociétés et dividendes d'une SELARL (règles 2026 : CGI art. 219, impots.gouv,
 * service-public). Ne calcule PAS les cotisations sociales du gérant : elles dépendent de sa
 * rémunération et de la part des dividendes au-delà de 10 % du capital (CSS art. L136-3), et le site
 * ne les modélise pas. Testé dans `selarl.test.ts`.
 */
import { P } from './params';
const F = P.fiscal_2026;

/** IS dû sur un bénéfice imposable : 15 % jusqu'au seuil (si l'entreprise y a droit), 25 % au-delà. */
export function impotSocietes(benefice: number, tauxReduit = true): number {
  const b = Math.max(0, benefice);
  if (!tauxReduit) return b * F.is_taux_normal;
  const bas = Math.min(b, F.is_seuil_reduit);
  return bas * F.is_taux_reduit + (b - bas) * F.is_taux_normal;
}

export interface Distribution { benefice: number; is: number; distribuable: number; ir: number; ps: number; horsPs: number; netAvantCotisations: number }
/**
 * Bénéfice après rémunération → IS → dividendes distribués en totalité. Impôt sur le revenu au
 * prélèvement forfaitaire (12,8 %) sur tout le dividende ; prélèvements sociaux (18,6 %) sur la part
 * qui ne dépasse pas 10 % du capital (et des comptes courants) ; au-delà, cette part entre dans
 * l'assiette des cotisations sociales de l'associé travaillant dans la société (CSS L136-3) : elle
 * est isolée dans `horsPs`, et ces cotisations ne sont pas calculées.
 */
export function distribution(beneficeApresRemuneration: number, capitalEtComptesCourants: number, tauxReduit = true): Distribution {
  const is = impotSocietes(beneficeApresRemuneration, tauxReduit);
  const distribuable = Math.max(0, beneficeApresRemuneration - is);
  const ir = distribuable * F.pfu_ir;
  const sousSeuil = Math.min(distribuable, Math.max(0, capitalEtComptesCourants) * F.seuil_dividendes_capital);
  const ps = sousSeuil * F.prelevements_sociaux;
  const horsPs = distribuable - sousSeuil;
  return { benefice: beneficeApresRemuneration, is, distribuable, ir, ps, horsPs, netAvantCotisations: distribuable - ir - ps };
}
