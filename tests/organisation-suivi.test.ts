import { describe, expect, it } from 'vitest';
import { tableauBord, devisAnnuel, repereHoraireNational } from '../src/lib/engine/organisation-suivi';
import { FR } from '../src/lib/engine/data';
import { P } from '../src/lib/engine/params';

describe('tableau de bord mensuel', () => {
  it('calcule CA horaire, absences et CA par rendez-vous honoré', () => {
    const t = tableauBord({ ca: 25000, heures: 100, prevus: 400, manques: 20, nouveaux: 38 });
    expect(t.caHoraire).toBe(250);
    expect(t.honores).toBe(380);
    expect(t.tauxAbsence).toBeCloseTo(0.05);
    expect(t.caParRdv).toBeCloseTo(25000 / 380);
    expect(t.partNouveaux).toBeCloseTo(0.1);
  });
  it('reste défini quand les entrées sont nulles ou incohérentes', () => {
    const t = tableauBord({ ca: 1000, heures: 0, prevus: 10, manques: 50, nouveaux: 3 });
    expect(t.caHoraire).toBeNull();
    expect(t.honores).toBe(0);
    expect(t.tauxAbsence).toBe(1);
    expect(t.caParRdv).toBeNull();
    expect(tableauBord({ ca: 0, heures: 0, prevus: 0, manques: 0, nouveaux: 0 }).tauxAbsence).toBeNull();
  });
  it('repère horaire = moyenne Ameli / heures ORS', () => {
    expect(repereHoraireNational()).toBeCloseTo(FR.p.omni!.tot! / P.temps_travail.heures_an);
  });
});

describe('devis', () => {
  it('production signée et effet de 10 points', () => {
    const d = devisAnnuel({ parMois: 20, taux: 0.5, montant: 1500, mois: 11 });
    expect(d.signesAn).toBe(110);
    expect(d.productionAn).toBe(165000);
    expect(d.gainParPoints).toBeCloseTo(33000);
  });
  it('le taux est borné à 100 %', () => {
    const d = devisAnnuel({ parMois: 10, taux: 0.95, montant: 1000, mois: 10 });
    expect(d.productionPlus).toBe(100000);
    expect(d.gainParPoints).toBeCloseTo(5000);
  });
});
