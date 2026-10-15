/**
 * Cotisations 2026 d'un chirurgien-dentiste à la CARCDSF (barème de la caisse, params-2026.json >
 * cotisations_2026) : retraite de base (RBL), complémentaire (RC), prestation complémentaire de
 * vieillesse (PCV, part du praticien conventionné) et invalidité-décès (RID). Hors cotisations Urssaf
 * (maladie, allocations familiales, CSG-CRDS, CURPS, formation). Testé dans `carcdsf.test.ts`.
 */
import { P } from './params';
const C = P.cotisations_2026;
export interface Carcdsf { rbl: number; rc: number; pcv: number; rid: number; total: number }
export function cotisationsCarcdsf(revenu: number): Carcdsf {
  const r = Math.max(0, revenu); const pass = C.pass;
  const base = Math.max(r, C.rbl_assiette_minimale);
  const rbl = C.rbl_tranche1 * Math.min(base, pass) + C.rbl_tranche2 * Math.min(base, 5 * pass);
  const rc = C.rc_forfait + C.rc_taux * Math.max(0, Math.min(r, C.rc_plafond_pass * pass) - C.rc_plancher_pass * pass);
  const pcv = C.pcv_forfait + C.pcv_taux * Math.min(r, 5 * pass);
  const rid = C.rid_forfait;
  return { rbl, rc, pcv, rid, total: rbl + rc + pcv + rid };
}
