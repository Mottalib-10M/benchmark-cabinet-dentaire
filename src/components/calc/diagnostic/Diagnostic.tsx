/**
 * Le diagnostic de l'accueil : quatre étapes à gauche, un rapport qui se débloque à droite, puis le
 * plan d'action et la demande d'échange. Moteur : lib/engine/diagnostic.ts (testé). Premier rendu =
 * valeurs par défaut du build (RECETTE §17.5) ; un lien de partage est lu dans useEffect ; l'adresse ne
 * change qu'après une action du visiteur (url-state.ts). Aucun curseur : tuiles à compteur.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import Compteur from './Compteur';
import { Cartes, Puces } from './Choix';
import { TX, PRIO_TITRE, PRIO_ARTICLE, ACTIONS, ORDRE_QUAND, type L } from './textes';
import {
  ACTES, AXES, AXE_ETAPE, DELAIS, EXERCICES, LAPINS, diagnostic, verdict, gainTotal, coutEtpMinimal, depsCompares, delaiMedianPublie,
  type Acte, type Delai, type DiagInput, type Exercice, type Lapins, type Priorite, type Verdict,
} from '../../../lib/engine/diagnostic';
import { reference, UNASA_YEAR } from '../../../lib/engine/references';
import { DEP_CODES, depName, DATA_YEAR } from '../../../lib/engine/data';
import { dansDep } from '../../../lib/dep-fr';
import { P } from '../../../lib/engine/params';
import { formatMoney, formatNumber, formatPercent } from '../../../lib/format';
import { readParams, num, str, updateURL, encodeState } from '../../../lib/url-state';
import { envoyerDemande } from '../../../lib/demande';

export interface DiagnosticProps { lang?: L; links: Record<string, string>; privacyHref: string; contactEmail: string }

const D0 = P.defauts.omni;
/** Valeurs de départ tirées des comptes UNASA : loyer et équipe d'un cabinet à la référence. */
function defauts(e: Exercice) {
  const d = e === 'odf' ? P.defauts.odf : D0;
  const U = reference(e === 'odf' ? 'odf' : 'omni', d.recettes);
  return {
    ca: d.recettes, fauteuils: d.fauteuils, jours: d.joursSemaine, semaines: d.semaines, heures: d.heuresJour,
    etp: Math.max(0.5, Math.round(((U.personnel * d.recettes) / coutEtpMinimal()) * 2) / 2),
    loyer: Math.round((U.loyer * d.recettes) / 12 / 100) * 100,
  };
}
const ACTE_BIT = (a: Acte) => 1 << ACTES.indexOf(a);

export default function Diagnostic({ lang = 'fr', links, privacyHref, contactEmail }: DiagnosticProps) {
  const t = TX[lang];
  const $ = (x: number) => formatMoney(x, 0, lang);
  const pc = (x: number, d = 1) => formatPercent(x, d, lang);
  const n0 = (x: number, d = 0) => formatNumber(x, d, lang);
  const d0 = defauts('omni');

  const [exercice, setExercice] = useState<Exercice>('omni');
  const [dep, setDep] = useState('');
  const [ca, setCa] = useState(d0.ca);
  const [fauteuils, setFauteuils] = useState(d0.fauteuils);
  const [jours, setJours] = useState(d0.jours);
  const [heures, setHeures] = useState(d0.heures);
  const [semaines, setSemaines] = useState(d0.semaines);
  const [etp, setEtp] = useState(d0.etp);
  const [loyer, setLoyer] = useState(d0.loyer);
  const [lapins, setLapins] = useState<Lapins | null>(null);
  const [delai, setDelai] = useState<Delai | null>(null);
  const [actes, setActes] = useState<Acte[]>([]);
  const [etape, setEtape] = useState(0);
  const [valide, setValide] = useState(0);
  const [plan, setPlan] = useState(false);
  const [copie, setCopie] = useState(false);
  const parcours = useRef<HTMLDivElement>(null);
  const suivant = useRef<HTMLButtonElement>(null);

  // Lien de partage : appliqué après le premier rendu, jamais pendant (hydratation).
  useEffect(() => {
    const u = readParams(window.location.search);
    if (!u.has('d')) return;
    const e = (EXERCICES as string[]).includes(str(u, 'e', 'omni')) ? (str(u, 'e', 'omni') as Exercice) : 'omni';
    const df = defauts(e);
    const dd = str(u, 'd', '');
    setExercice(e); setDep(DEP_CODES.includes(dd) ? dd : '');
    setCa(num(u, 'ca', df.ca)); setFauteuils(num(u, 'f', df.fauteuils)); setJours(num(u, 'j', df.jours)); setHeures(num(u, 'h', df.heures)); setSemaines(num(u, 's', df.semaines));
    setEtp(num(u, 'a', df.etp)); setLoyer(num(u, 'l', df.loyer));
    const lp = str(u, 'r', ''); setLapins((LAPINS as string[]).includes(lp) ? (lp as Lapins) : null);
    const dl = str(u, 't', ''); setDelai((DELAIS as string[]).includes(dl) ? (dl as Delai) : null);
    const bits = num(u, 'x', 0); setActes(ACTES.filter((a) => bits & ACTE_BIT(a)));
    const v = Math.max(0, Math.min(4, Math.round(num(u, 'v', 1))));
    const vOk = DEP_CODES.includes(dd) ? (v === 4 && !(LAPINS as string[]).includes(lp) ? 3 : v) : 0;
    setValide(vOk); setEtape(Math.min(3, vOk)); setPlan(vOk === 4);
  }, []);

  const etat = () => ({ e: exercice, d: dep || undefined, ca, f: fauteuils, j: jours, h: heures, s: semaines, a: etp, l: loyer, r: lapins ?? undefined, t: delai ?? undefined, x: actes.reduce((s, a) => s | ACTE_BIT(a), 0) || undefined, v: valide || undefined });
  useEffect(() => { updateURL(etat()); }, [exercice, dep, ca, fauteuils, jours, heures, semaines, etp, loyer, lapins, delai, actes, valide]);

  const input: DiagInput = { exercice, dep: dep || '75', ca, fauteuils, jours, heures, semaines, etp, loyer, lapins, delai, actes };
  const R = useMemo(() => diagnostic(input, valide), [exercice, dep, ca, fauteuils, jours, heures, semaines, etp, loyer, lapins, delai, actes, valide]);
  const X = R.x;
  const choisirExercice = (e: Exercice) => {
    setExercice(e);
    if (valide < 2) { const d = defauts(e); setCa(d.ca); setFauteuils(d.fauteuils); setJours(d.jours); setHeures(d.heures); setSemaines(d.semaines); setEtp(d.etp); setLoyer(d.loyer); }
  };

  const peutSuivre = etape === 0 ? !!dep : etape === 3 ? !!lapins && !!delai : true;
  const avancer = () => {
    if (!peutSuivre) return;
    const v = Math.max(valide, etape + 1);
    setValide(v);
    if (etape < 3) setEtape(etape + 1);
    else { setPlan(true); requestAnimationFrame(() => parcours.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })); }
  };

  // ---- Rapport ----
  const conf = t.confreres[X.spec];
  const dans = lang === 'fr' ? dansDep(input.dep) : `in ${depName(input.dep)}`;
  const ecart = X.ref ? ca / X.ref.value - 1 : 0;
  const sens: 'au-dessus' | 'en dessous' = ecart >= 0 ? 'au-dessus' : 'en dessous';
  const reste = 4 - valide;
  const score = R.note;
  const titre = valide >= 4 && score != null ? t.verdict(score) : valide === 0 ? t.rapportVide : t.complete(valide * 25);
  const resume = valide === 0 ? t.rapportResume0
    : valide === 1 ? t.resume1(conf, dans, X.ref ? $(X.ref.value) : '–', X.ref ? t.niveau[X.ref.level] : '')
    : valide < 4 ? t.resumeN(pc(Math.abs(ecart), 0), sens, dans, reste)
    : t.resumeFin(pc(Math.abs(ecart), 0), sens, conf, dans);
  const couleur = (s: number) => (s >= 60 ? 'var(--dg-bon)' : s >= 40 ? 'var(--dg-moyen)' : 'var(--dg-faible)');
  const C = 326.7;
  const arc = score == null ? C * (1 - valide / 4) : C * (1 - score / 100);
  const jaugeSous = valide >= 4 ? t.sur100 : score == null ? t.etapesFaites : t.provisoire;

  const med = delaiMedianPublie();
  type Ligne = { k: string; vous: string; rep: string; v: Verdict; pas: Record<Verdict, string>; etape: number };
  const lignes: Ligne[] = [
    { k: 'ca', vous: $(ca), rep: X.ref ? $(X.ref.value) : '–', v: verdict(ca, X.ref?.value ?? null), pas: t.pas, etape: 2 },
    { k: 'caH', vous: X.caHoraire != null ? `${$(X.caHoraire)} /h` : '–', rep: X.refHoraire ? `${$(X.refHoraire)} /h` : t.sansRepere, v: verdict(X.caHoraire, X.refHoraire, true, 0.15), pas: t.pas, etape: 2 },
    { k: 'caF', vous: X.caFauteuil != null ? $(X.caFauteuil) : '–', rep: t.sansRepere, v: 'neutre', pas: t.pas, etape: 2 },
    { k: 'loyer', vous: X.partLoyer != null ? pc(X.partLoyer) : '–', rep: pc(X.U.loyer), v: verdict(X.partLoyer, X.U.loyer, false, 0.1), pas: t.pasInv, etape: 3 },
    { k: 'benef', vous: $(X.benefice / 12), rep: $(X.refBenefice / 12), v: verdict(X.benefice, X.refBenefice), pas: t.pas, etape: 3 },
    { k: 'lapins', vous: lapins ? t.lapinsMots[lapins] : '–', rep: t.repLapins, v: X.tauxLapins == null ? 'neutre' : X.tauxLapins < 0.03 ? 'bon' : X.tauxLapins < 0.08 ? 'moyen' : 'faible', pas: t.pasLapins, etape: 4 },
    { k: 'delai', vous: delai ? t.delaiOpt[delai] : '–', rep: med != null ? (lang === 'fr' ? `${n0(med)} jours (médiane)` : `${n0(med)} days (median)`) : t.sansRepere, v: med != null && X.delaiJours != null ? verdict(X.delaiJours, med, false, 0.25) : 'neutre', pas: t.pasDelai, etape: 4 },
  ];

  const prios = R.priorites;
  const top = prios.slice(0, 3);
  const texte = (p: Priorite): string => {
    const g = p.gain != null ? $(p.gain) : '';
    if (lang === 'fr') switch (p.id) {
      case 'lapins': return `Environ ${n0(p.data.parAn)} rendez-vous manqués par an, soit près de ${$(p.data.perdu)} de production qui ne se fait pas. Un rappel la veille et une liste d’attente en récupèrent une partie : on en compte prudemment un tiers, ≈ ${g}.`;
      case 'production': return `Votre chiffre d’affaires est ${pc(Math.abs(ecart), 0)} sous la moyenne de vos confrères (${$(p.data.ref)}). Sur ${n0(jours, 1)} jours par semaine, l’écart vient le plus souvent de créneaux vides ou d’actes courts. Combler un quart de l’écart représente ≈ ${g}.`;
      case 'delegation': return `${n0(p.data.manquants)} tâches sur ${ACTES.length} restent à votre charge. À une demi-heure par tâche et par semaine, cela fait ≈ ${n0(p.data.heures)} heures de fauteuil par an ; si la moitié devient de la production, ≈ ${g}.`;
      case 'loyer': return `Le loyer prend ${pc(X.partLoyer ?? 0)} de votre chiffre d’affaires, contre ${pc(X.U.loyer)} dans les cabinets de taille comparable (UNASA ${UNASA_YEAR}). L’écart coûte ${$(p.data.ecart)} par an ; partager les locaux ou louer les créneaux vides en récupère une partie, ≈ ${g}.`;
      case 'equipe': return `Avec moins d’un mi-temps d’assistante, vous préparez, stérilisez et accueillez vous-même. Un mi-temps au minimum de la convention collective coûte ≈ ${$(coutEtpMinimal() / 2)} par an à l’employeur : à comparer aux heures de fauteuil qu’il libère.`;
      case 'fauteuil': return `${n0(p.data.libres)} fauteuil${p.data.libres > 1 ? 's' : ''} au-delà de deux pour un praticien reste${p.data.libres > 1 ? 'nt' : ''} souvent vide${p.data.libres > 1 ? 's' : ''} une partie de la semaine. Un collaborateur libéral qui l’utilise verse une redevance au cabinet ; aucun barème officiel n’en fixe le taux.`;
      case 'delai': return med != null ? `Un nouveau patient attend ${t.delaiOpt[delai!].toLowerCase()}, quand la DREES mesure un délai médian de ${n0(med)} jours chez le chirurgien-dentiste (${P.delais_rdv!.annee_enquete}). Réserver chaque jour des créneaux aux nouveaux patients évite qu’ils aillent ailleurs.` : `Un nouveau patient attend ${t.delaiOpt[delai!].toLowerCase()}. Réserver chaque jour des créneaux aux nouveaux patients évite qu’ils aillent ailleurs.`;
      default: return 'Vos indicateurs sont au niveau des repères ou au-dessus. Suivez-les chaque mois pour voir tôt une baisse.';
    }
    switch (p.id) {
      case 'lapins': return `Around ${n0(p.data.parAn)} missed appointments a year, close to ${$(p.data.perdu)} of work that never happens. A reminder the day before and a waiting list win some of it back: we count a cautious third, ≈ ${g}.`;
      case 'production': return `Your turnover is ${pc(Math.abs(ecart), 0)} below your peers’ average (${$(p.data.ref)}). Over ${n0(jours, 1)} days a week, the gap usually comes from empty slots or short appointments. Closing a quarter of it is worth ≈ ${g}.`;
      case 'delegation': return `${n0(p.data.manquants)} of ${ACTES.length} tasks are still on your plate. At half an hour per task per week that is ≈ ${n0(p.data.heures)} chairside hours a year; if half becomes treatment time, ≈ ${g}.`;
      case 'loyer': return `Rent takes ${pc(X.partLoyer ?? 0)} of your turnover, against ${pc(X.U.loyer)} in practices of similar size (UNASA ${UNASA_YEAR}). The gap costs ${$(p.data.ecart)} a year; sharing the premises or letting empty slots recovers part of it, ≈ ${g}.`;
      case 'equipe': return `With less than a half-time dental nurse you set up, sterilise and greet patients yourself. A half-timer at the collective agreement minimum costs the employer ≈ ${$(coutEtpMinimal() / 2)} a year: weigh it against the chair hours it frees.`;
      case 'fauteuil': return `${n0(p.data.libres)} chair${p.data.libres > 1 ? 's' : ''} beyond two per dentist often stand${p.data.libres > 1 ? '' : 's'} empty part of the week. An associate dentist using it pays the practice a fee; no official scale sets the rate.`;
      case 'delai': return med != null ? `A new patient waits ${t.delaiOpt[delai!].toLowerCase()}, while DREES measured a median wait of ${n0(med)} days for a dentist (${P.delais_rdv!.annee_enquete}). Keeping slots for new patients every day stops them going elsewhere.` : `A new patient waits ${t.delaiOpt[delai!].toLowerCase()}. Keeping slots for new patients every day stops them going elsewhere.`;
      default: return 'Your indicators are at or above the benchmarks. Track them monthly to spot any dip early.';
    }
  };
  const gainVu = gainTotal(prios);

  const lienPartage = () => `${window.location.origin}${window.location.pathname}?${encodeState(etat())}`;
  const copier = () => { navigator.clipboard?.writeText(lienPartage()).then(() => { setCopie(true); setTimeout(() => setCopie(false), 1800); }); };
  const imprimer = () => { document.body.classList.add('dg-print'); const off = () => { document.body.classList.remove('dg-print'); window.removeEventListener('afterprint', off); }; window.addEventListener('afterprint', off); window.print(); setTimeout(off, 1500); };

  const rapportJson = () => ({
    reponses: { ...input, dep: dep, depNom: dep ? depName(dep) : '' },
    note: R.note, axes: R.notes,
    indicateurs: { ca, caHoraire: X.caHoraire, refHoraire: X.refHoraire, caFauteuil: X.caFauteuil, partLoyer: X.partLoyer, refLoyer: X.U.loyer, beneficeMois: X.benefice / 12, refBeneficeMois: X.refBenefice / 12, refCA: X.ref?.value ?? null, niveauRef: X.ref?.level ?? null, lapins, delai },
    priorites: top.map((p) => ({ id: p.id, titre: PRIO_TITRE[lang][p.id], gain: p.gain != null ? Math.round(p.gain) : null })),
    gainTotal: Math.round(gainVu), donnees: { ameli: DATA_YEAR, unasa: UNASA_YEAR }, lien: typeof window !== 'undefined' ? lienPartage() : '',
  });

  const depOptions = DEP_CODES.map((c) => ({ value: c, label: `${c} · ${depName(c)}` }));
  const etapeCourante = () => {
    if (etape === 0) return (
      <>
        <div className="dg-champ">
          <label htmlFor="dg-ex" className="dg-champ-label">{t.exercice}</label>
          <div className="dg-select"><select id="dg-ex" value={exercice} onChange={(e) => choisirExercice(e.target.value as Exercice)} aria-describedby="dg-ex-help">
            {EXERCICES.map((e) => <option key={e} value={e}>{t.ex[e]}</option>)}
          </select><Chevron /></div>
          <p id="dg-ex-help" className="dg-aide">{t.exAide}</p>
        </div>
        <div className="dg-champ">
          <label htmlFor="dg-dep" className="dg-champ-label">{t.dep}</label>
          <div className="dg-select"><select id="dg-dep" value={dep} onChange={(e) => setDep(e.target.value)}>
            <option value="" disabled>{t.depChoisir}</option>
            {depOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select><Chevron /></div>
        </div>
      </>
    );
    const lab = { moins: t.moins, plus: t.plus, max: t.max };
    if (etape === 1) return (
      <>
        <Compteur id="dg-ca" label={t.ca} value={ca} onChange={setCa} min={0} max={5_000_000} step={10_000} unit={t.u.eur} money large help={t.caAide} lang={lang} labels={lab} />
        <Compteur id="dg-f" label={t.fauteuils} value={fauteuils} onChange={setFauteuils} min={1} max={12} step={1} unit={t.u.fauteuil} raccourcis={[1, 2, 3, 4]} lang={lang} labels={lab} />
        <Compteur id="dg-j" label={t.jours} value={jours} onChange={setJours} min={0.5} max={6} step={0.5} unit={t.u.jour} raccourcis={[3, 4, 4.5, 5]} lang={lang} labels={lab} />
        <Compteur id="dg-h" label={t.heures} value={heures} onChange={setHeures} min={1} max={12} step={0.5} unit={t.u.heure} raccourcis={[6, 7, 8, 9]} lang={lang} labels={lab} />
        <Compteur id="dg-s" label={t.semaines} value={semaines} onChange={setSemaines} min={10} max={52} step={1} unit={t.u.semaine} raccourcis={[44, 45, 46, 47]} lang={lang} labels={lab} />
      </>
    );
    if (etape === 2) return (
      <>
        <Compteur id="dg-a" large label={t.etp} value={etp} onChange={setEtp} min={0} max={20} step={0.5} unit={t.u.etp} raccourcis={[1, 1.5, 2, 3]} help={t.etpAide} lang={lang} labels={lab} />
        <Compteur id="dg-l" large label={t.loyer} value={loyer} onChange={setLoyer} min={0} max={50_000} step={100} unit={t.u.eurMois} money help={t.loyerAide} lang={lang} labels={lab} />
      </>
    );
    return (
      <>
        <Cartes id="dg-r" legend={t.lapins} value={lapins} onChange={setLapins} options={LAPINS.map((v) => ({ value: v, label: t.lapinsOpt[v][0], sub: t.lapinsOpt[v][1] }))} />
        <Cartes id="dg-t" legend={t.delai} value={delai} onChange={setDelai} options={DELAIS.map((v) => ({ value: v, label: t.delaiOpt[v] }))} />
        <Puces legend={t.actes} value={actes} onChange={setActes} compte={`${actes.length} / ${ACTES.length}`} help={t.actesAide} options={ACTES.map((a) => ({ value: a, label: t.acteOpt[a] }))} />
      </>
    );
  };

  const taches = top.flatMap((p, i) => (ACTIONS[lang][p.id] ?? []).map(([q, a, d]) => ({ q, a, d, p: i + 1 })));
  taches.push({ q: 'm3', a: t.refaire[1], d: t.refaire[2], p: 0 });
  taches.sort((a, b) => ORDRE_QUAND.indexOf(a.q) - ORDRE_QUAND.indexOf(b.q));

  return (
    <div className="dg rechner not-prose" id="diagnostic" data-chrome>
      <div className="dg-grille">
        <div className="dg-panneau dg-parcours" ref={parcours}>
          {!plan ? (
            <div className="dg-noprint">
              <div className="dg-etapes" role="tablist" aria-label={lang === 'fr' ? 'Étapes du diagnostic' : 'Check-up steps'}>
                {t.etapes.map((e, i) => (
                  <button key={e} type="button" role="tab" aria-selected={i === etape} aria-current={i === etape ? 'step' : undefined} disabled={i > valide}
                    className={i < valide && i !== etape ? 'dg-fait' : ''} onClick={() => setEtape(i)}>
                    <span>{t.etapeN(i + 1)}</span>{e}
                  </button>
                ))}
              </div>
              <form className="dg-form" onSubmit={(e) => { e.preventDefault(); avancer(); }}>
                <h2>{t.etapes[etape]}</h2>
                <p className="dg-sous">{t.aides[etape]}</p>
                {etapeCourante()}
                <div className="dg-nav">
                  <button type="button" className="dg-btn" disabled={etape === 0} onClick={() => setEtape(Math.max(0, etape - 1))}>{t.prec}</button>
                  <button ref={suivant} type="submit" className="dg-btn dg-primaire" disabled={!peutSuivre}>{etape === 3 ? t.fin : t.suiv}</button>
                </div>
                {!peutSuivre && <p className="dg-aide dg-manque" role="status">{etape === 0 ? t.manque1 : t.manque4}</p>}
              </form>
            </div>
          ) : (
            <div className="dg-plan">
              <div className="dg-plan-haut"><h2>{t.plan}</h2><button type="button" className="dg-lien dg-noprint" onClick={() => { setPlan(false); setEtape(3); }}>{t.modifier}</button></div>
              <p className="dg-sous">{t.planSous}</p>
              <ol className="dg-frise">
                {taches.map((x, i) => (
                  <li key={i}><span className="dg-quand">{t.quand[x.q]}</span><span className={`dg-point${x.p ? ` dg-p${x.p}` : ''}`} aria-hidden="true" /><div><b>{x.a}</b><small>{x.p ? `${t.priorite(x.p)} · ` : ''}{x.d}</small></div></li>
                ))}
              </ol>
              <div className="dg-noprint">
                <p className="dg-ensuite">{t.ensuite}</p>
                <Echange lang={lang} rapport={rapportJson} privacyHref={privacyHref} contactEmail={contactEmail} />
              </div>
            </div>
          )}
        </div>

        <div className="dg-panneau dg-rapport" data-resultat>
          {valide === 0 ? (
            <div className="dg-vide" aria-live="polite">
              <div className="dg-feuille" aria-hidden="true"><span>{t.feuille}</span><i /><i /><i /></div>
              <div><h3>{titre}</h3><p>{resume}</p></div>
              <ul className="dg-recoit">
                {t.recoit.map(([a, b], i) => <li key={a}><span className="dg-rondn">{i + 1}</span><div><b>{a}</b><small>{b}</small></div></li>)}
              </ul>
            </div>
          ) : (<>
          <div className="dg-tete" aria-live="polite">
            <div className="dg-jauge">
              <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="none" stroke="var(--dg-ligne)" strokeWidth="12" /><circle cx="60" cy="60" r="52" fill="none" stroke={score == null ? 'var(--dg-accent)' : couleur(score)} strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={arc} /></svg>
              <div className="dg-jauge-val"><div><b>{score == null ? `${valide}/4` : score}</b><small>{jaugeSous}</small></div></div>
            </div>
            <div><h3>{titre}</h3><p>{resume}</p>{valide >= 2 && exercice === 'implanto' && <p className="dg-note">{t.implantoNote}</p>}</div>
          </div>

          {AXES.some((a) => valide >= AXE_ETAPE[a]) && (
            <div>
              <div className="dg-axes">
                {AXES.filter((a) => valide >= AXE_ETAPE[a]).map((a) => {
                  const s = R.notes[a];
                  if (s != null) return <div key={a} className="dg-axe"><span>{t.axes[a]}</span><div className="dg-barre"><i style={{ width: `${s}%`, background: couleur(s) }} /></div><span className="dg-axe-note">{s}</span></div>;
                  return <div key={a} className="dg-axe dg-verrou"><span>{t.axes[a]}</span><div className="dg-barre" /><span className="dg-axe-note dg-petit">{t.axeSansRepere}</span></div>;
                })}
              </div>
              <p className="dg-legende">{t.legende}</p>
            </div>
          )}

          {lignes.some((l) => valide >= l.etape) && <div className="dg-bloc">
            <h4>{t.indics}</h4>
            <div className="dg-indics" role="table" aria-label={t.indics}>
              <div className="dg-indic dg-entete" role="row">{t.th.map((h, i) => <span key={i} role="columnheader">{h}</span>)}</div>
              {lignes.filter((l) => valide >= l.etape).map((l) => {
                const [nom, aide] = t.i[l.k];
                return (
                  <div key={l.k} className="dg-indic" role="row">
                    <div className="dg-nom" role="cell"><b>{nom}</b><small>{aide}</small></div>
                    <span className="dg-vous" role="cell">{l.vous}</span>
                    <span className="dg-rep" role="cell">{l.rep}</span>
                    <span role="cell" className={`dg-pastille dg-${l.v}`}>{l.pas[l.v]}</span>
                  </div>
                );
              })}
            </div>
          </div>}

          {valide < 4 && (
            <div className="dg-prochain">
              <span className="dg-eyebrow">{t.apres(valide + 1)}</span>
              <b>{t.deb[valide][0]}</b>
              <p>{t.deb[valide][1]}</p>
              {valide < 3 && <div className="dg-suite" aria-label={t.ensuite}>{t.deb.slice(valide + 1).map(([a]) => <span key={a}>{a}</span>)}</div>}
            </div>
          )}

          <div className="dg-bloc">
            <h4>{t.priorites}</h4>
            {valide >= 4 ? (
              <ul className="dg-recos">
                {top.map((p, i) => (
                  <li key={p.id} className={`dg-reco dg-p${i + 1}`}>
                    <div className="dg-reco-haut"><b>{i + 1}. {PRIO_TITRE[lang][p.id]}</b>{p.gain != null && p.gain > 0 && <span className="dg-gain">≈ +{$(p.gain)} {t.parAn}</span>}</div>
                    <p>{texte(p)}</p>
                    {links[PRIO_ARTICLE[p.id]] && <a href={links[PRIO_ARTICLE[p.id]]}>{t.lire} {links[`${PRIO_ARTICLE[p.id]}:label`]} →</a>}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dg-teaser">
                <ul className="dg-recos dg-flou" aria-hidden="true">
                  {[1, 2, 3].map((i) => <li key={i} className={`dg-reco dg-p${i}`}><div className="dg-reco-haut"><b>{i}. {t.prioFactice}</b><span className="dg-gain">≈ +00 000 € {t.parAn}</span></div><p>{t.prioFacticeTxt}</p></li>)}
                </ul>
                <div className="dg-voile"><div>
                  {gainVu > 0
                    ? <><span className="dg-montant">≈ {$(gainVu)} {t.parAn}</span><p>{t.gainRepere}</p></>
                    : <p><b>{t.gainAucunTitre}</b> {t.gainAucun}</p>}
                  <button type="button" className="dg-btn dg-primaire" onClick={() => { parcours.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); suivant.current?.focus({ preventScroll: true }); }}>
                    {valide === 0 && etape === 0 ? t.commencer : t.continuer(Math.min(etape + 1, 4))} · {t.minutes(reste)}
                  </button>
                </div></div>
              </div>
            )}
          </div>

          {valide >= 4 && (
            <div className="dg-actions dg-noprint">
              <button type="button" className="dg-btn dg-primaire" onClick={imprimer}>{t.pdf}</button>
              <button type="button" className="dg-btn" onClick={copier}>{copie ? t.copie : t.lien}</button>
            </div>
          )}
          <p className="dg-imprime">{t.imprimeLe} dentimetre.fr · Assurance Maladie {DATA_YEAR}, UNASA {UNASA_YEAR}</p>
          </>)}
          <p className="dg-confiance dg-noprint"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1 2.5 3v4.3c0 3.3 2.3 6.3 5.5 7.2 3.2-.9 5.5-3.9 5.5-7.2V3L8 1Z" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>{t.confiance}</p>
        </div>
      </div>
    </div>
  );
}

function Chevron() {
  return <svg className="dg-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/** Demande d'échange : enregistrée dans la base (Supabase, insertion seule), rapport joint. */
function Echange({ lang, rapport, privacyHref, contactEmail }: { lang: L; rapport: () => unknown; privacyHref: string; contactEmail: string }) {
  const t = TX[lang];
  const [nom, setNom] = useState(''); const [ville, setVille] = useState(''); const [mail, setMail] = useState(''); const [tel, setTel] = useState('');
  const [creneau, setCreneau] = useState(t.creneaux[0]);
  const [etat, setEtat] = useState<'saisie' | 'envoi' | 'ok' | 'erreur'>('saisie');
  const [mailKo, setMailKo] = useState(false);
  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.trim())) { setMailKo(true); return; }
    setMailKo(false); setEtat('envoi');
    const ok = await envoyerDemande({ nom: nom.trim(), email: mail.trim(), telephone: tel.trim() || null, ville: ville.trim() || null, creneau, rapport: rapport(), lang });
    setEtat(ok ? 'ok' : 'erreur');
  };
  return (
    <div className="dg-rdv">
      <h3>{t.rdvTitre}</h3>
      <p>{t.rdvTxt}</p>
      <ul>{t.rdvPuces.map((x) => <li key={x}>{x}</li>)}</ul>
      {etat === 'ok' ? (
        <div className="dg-ok" role="status"><b>{t.fOk}</b> {t.fOkTxt}</div>
      ) : (
        <form className="dg-rdv-form" onSubmit={envoyer} id="dg-contact">
          <div className="dg-ligne">
            <label className="sr-only" htmlFor="dg-nom">{t.fNom}</label><input id="dg-nom" required placeholder={t.fNom} autoComplete="name" value={nom} onChange={(e) => setNom(e.target.value)} />
            <label className="sr-only" htmlFor="dg-ville">{t.fVille}</label><input id="dg-ville" placeholder={t.fVille} autoComplete="address-level2" value={ville} onChange={(e) => setVille(e.target.value)} />
          </div>
          <div className="dg-ligne">
            <label className="sr-only" htmlFor="dg-mail">{t.fMail}</label><input id="dg-mail" type="email" required placeholder={t.fMail} autoComplete="email" value={mail} onChange={(e) => setMail(e.target.value)} aria-invalid={mailKo || undefined} />
            <label className="sr-only" htmlFor="dg-tel">{t.fTel}</label><input id="dg-tel" type="tel" placeholder={t.fTel} autoComplete="tel" value={tel} onChange={(e) => setTel(e.target.value)} />
          </div>
          <label className="sr-only" htmlFor="dg-creneau">{t.fCreneau}</label>
          <div className="dg-select"><select id="dg-creneau" value={creneau} onChange={(e) => setCreneau(e.target.value)}>{t.creneaux.map((c) => <option key={c}>{c}</option>)}</select><Chevron /></div>
          {mailKo && <p className="dg-aide dg-alerte" role="status">{t.fMailInvalide}</p>}
          {etat === 'erreur' && <p className="dg-aide dg-alerte" role="status">{t.fErr} <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.</p>}
          <button type="submit" className="dg-btn dg-primaire" disabled={etat === 'envoi'}>{etat === 'envoi' ? t.fEnvoi : t.fEnvoyer}</button>
          <p className="dg-aide">{t.fJoint} {t.fPrivacy} <a href={privacyHref}>{t.fPrivacyLien}</a>.</p>
        </form>
      )}
    </div>
  );
}
