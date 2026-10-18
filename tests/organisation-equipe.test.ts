import { describe, expect, it } from 'vitest';
import { tempsDelegue, redevance, tauxPointMort, coutAssistantAnnuel, caHoraireRepere } from '../src/lib/engine/organisation-equipe';
import { coutEmployeur, brutMinimal } from '../src/lib/engine/employeur';
import { P } from '../src/lib/engine/params';

describe('délégation à l’assistant dentaire', () => {
  it('heures libérées = tâches × minutes × jours × semaines', () => {
    const d = tempsDelegue({ taches: 2, minutes: 15, jours: 4, semaines: 45, caHoraire: 200 }, 0.5);
    expect(d.heuresAn).toBeCloseTo(90);
    expect(d.production).toBeCloseTo(9000);
  });
  it('utilise par défaut l’hypothèse publiée', () => {
    const d = tempsDelegue({ taches: 1, minutes: 60, jours: 1, semaines: 1, caHoraire: 100 });
    expect(d.part).toBe(P.diagnostic.part_convertie_temps);
    expect(d.production).toBeCloseTo(100 * P.diagnostic.part_convertie_temps);
  });
  it('valeurs négatives ou absurdes ramenées à zéro', () => {
    const d = tempsDelegue({ taches: -1, minutes: NaN, jours: 4, semaines: 45, caHoraire: 200 });
    expect(d.heuresAn).toBe(0); expect(d.production).toBe(0);
  });
  it('coût d’un mi-temps au minimum conventionnel', () => {
    const h = P.salaires_2026.heures_mois / 2;
    expect(coutAssistantAnnuel(0.5)).toBeCloseTo(coutEmployeur(brutMinimal('assistant_dentaire', h), h).coutAnnuel);
    expect(coutAssistantAnnuel(1)).toBeGreaterThan(coutAssistantAnnuel(0.5));
    expect(coutAssistantAnnuel(0)).toBe(0);
  });
  it('repère horaire publié', () => {
    const r = caHoraireRepere();
    expect(r).not.toBeNull(); expect(r!).toBeGreaterThan(50);
  });
});

describe('redevance de collaboration', () => {
  it('redevance, reste et couverture', () => {
    const r = redevance({ honoraires: 200000, taux: 0.3, chargesFauteuil: 50000 });
    expect(r.redevance).toBe(60000); expect(r.reste).toBe(140000); expect(r.couverture).toBeCloseTo(1.2); expect(r.solde).toBe(10000);
  });
  it('taux borné entre 0 et 1, couverture nulle sans charges', () => {
    expect(redevance({ honoraires: 1000, taux: 2, chargesFauteuil: 0 }).redevance).toBe(1000);
    expect(redevance({ honoraires: 1000, taux: 0.2, chargesFauteuil: 0 }).couverture).toBeNull();
  });
  it('taux de point mort', () => {
    expect(tauxPointMort(200000, 50000)).toBeCloseTo(0.25);
    expect(tauxPointMort(0, 50000)).toBeNull();
  });
});
