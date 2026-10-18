import { describe, expect, it } from 'vitest';
import { coutLapins, delaiFile, DELAI_MEDIAN } from '../src/lib/engine/organisation-agenda';
import { P } from '../src/lib/engine/params';

describe('coutLapins', () => {
  it('compte les créneaux perdus et leur valeur', () => {
    const r = coutLapins({ absJour: 1, joursSemaine: 4, semaines: 45, ca: 360_000, heuresJour: 8, dureeMin: 30 });
    expect(r.rdvParAn).toBe(180);
    expect(r.heuresAn).toBe(1440);
    expect(r.caHoraire).toBe(250);
    expect(r.valeurRdv).toBe(125);
    expect(r.perdu).toBe(22_500);
    expect(r.recuperable).toBeCloseTo(22_500 * P.diagnostic.part_recuperable_lapins);
    expect(r.taux).toBeCloseTo(1 / 16);
  });
  it('prend la durée des hypothèses par défaut et ne divise jamais par zéro', () => {
    expect(coutLapins({ absJour: 2, joursSemaine: 4, semaines: 45, ca: 300_000, heuresJour: 7 }).valeurRdv).toBeCloseTo((300_000 / 1260) * (P.diagnostic.duree_rdv_min / 60));
    const z = coutLapins({ absJour: 1, joursSemaine: 0, semaines: 45, ca: 300_000, heuresJour: 7 });
    expect(z.caHoraire).toBeNull(); expect(z.perdu).toBe(0);
    expect(coutLapins({ absJour: 1, joursSemaine: 4, semaines: 45, ca: 1, heuresJour: 0 }).taux).toBeNull();
  });
});

describe('delaiFile', () => {
  it('applique la loi de Little', () => {
    const r = delaiFile({ demandes: 5, creneaux: 6, file: 12 });
    expect(r.delaiJours).toBe(14);
    expect(r.variation).toBe(-1);
    expect(r.semainesResorption).toBe(12);
    expect(r.creneauxPourCible(7)).toBe(12);
  });
  it('signale une file qui s’allonge et l’absence de créneau', () => {
    expect(delaiFile({ demandes: 8, creneaux: 6, file: 10 }).semainesResorption).toBeNull();
    expect(delaiFile({ demandes: 3, creneaux: 0, file: 4 }).delaiJours).toBeNull();
    expect(delaiFile({ demandes: 3, creneaux: 3, file: 0 }).semainesResorption).toBe(0);
  });
  it('lit le délai médian publié', () => { expect(DELAI_MEDIAN).toBe(P.delais_rdv.dentiste_median_jours); });
});
