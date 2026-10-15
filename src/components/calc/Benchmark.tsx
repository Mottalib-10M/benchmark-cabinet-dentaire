/**
 * Le simulateur du site : honoraires, bénéfice et ratios d'un cabinet dentaire face aux moyennes
 * officielles de la spécialité dans le département, la région et la France (Assurance Maladie).
 * Moteurs : lib/engine/benchmark.ts (comparaisons), lib/engine/cabinet.ts (ratios, bénéfice),
 * lib/engine/distinction.ts (points forts et points à surveiller).
 * Premier rendu = valeurs par défaut du build (RECETTE §17.5) ; le lien partagé est lu dans useEffect.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import ResultBar from './ResultBar';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { comparable, depsBelow, gap, refs, depShare } from '../../lib/engine/benchmark';
import { cabinet } from '../../lib/engine/cabinet';
import { distinctions, type Point } from '../../lib/engine/distinction';
import { reference, rangRevenu, UNASA_YEAR } from '../../lib/engine/references';
import { DEP_CODES, depName, regName, type Spec, SPECS, DATA_YEAR } from '../../lib/engine/data';
import { dansDep } from '../../lib/dep-fr';
import { P } from '../../lib/engine/params';
import { formatMoney, formatPercent, formatNumber, ordinal } from '../../lib/format';
import { readParams, num, str, updateURL } from '../../lib/url-state';

type L = 'fr' | 'en';
const TX = {
  fr: {
    spec: 'Spécialité', s_omni: 'Omnipraticien', s_odf: 'Orthodontiste (ODF)', s_stomato: 'Stomatologue (médecin)',
    dep: 'Département', recettes: 'Vos honoraires de l’année', recettesHelp: 'Votre activité personnelle, tous actes confondus (relevé de recettes, ligne AG de la 2035).',
    hn: 'Dont non remboursables', hnHelp: 'Implants, parodontie, blanchiment, orthodontie adulte… : absents des chiffres de l’Assurance Maladie.',
    fauteuils: 'Fauteuils à votre disposition', salaries: 'Salariés qui travaillent avec vous', salariesHelp: 'En équivalent temps plein : assistantes, secrétaire, aide dentaire.', unitEtp: 'ETP',
    jours: 'Jours travaillés par semaine', semaines: 'Semaines travaillées par an',
    adv: 'Charges, statut et patientèle (facultatif)', advHelp: 'Sans charges saisies, le bénéfice est estimé avec le taux de charges de référence de la spécialité.',
    statut: 'Statut : libéral en BNC ou SELARL à l’IS', bnc: 'BNC', selarl: 'SELARL',
    personnel: 'Salaires et cotisations patronales', prothesiste: 'Laboratoire de prothèse', fournitures: 'Fournitures et consommables', loyer: 'Loyer et charges locatives', autres: 'Autres charges (amortissements, assurances, logiciel…)',
    cotis: 'Vos cotisations personnelles (Urssaf, CARCDSF)', cotisHelpSelarl: 'En SELARL : laissez à 0, elles sont réglées sur votre rémunération.',
    patients: 'Patients différents vus dans l’année', patientsHelp: 'Facultatif : votre logiciel le donne (file active).',
    depPart: 'Part de vos honoraires au-dessus des tarifs de convention', depPartHelp: 'Facultatif : prothèse, ODF, dépassements. 0 = non renseigné.', an: '€/an',
    head: 'Vos honoraires face à la moyenne', headSub: 'honoraires comparables, hors actes non remboursables',
    above: 'au-dessus de la moyenne', below: 'en dessous de la moyenne', secret: 'Moyenne non publiée (moins de 5 praticiens) : comparaison avec la région et la France.',
    you: 'Vous', lDep: 'Département', lReg: 'Région', lFr: 'France',
    rankLine: 'Votre montant dépasse la moyenne des {spec} de {n} départements sur {t}.',
    ratios: 'Vos ratios', parFauteuil: 'Honoraires par fauteuil', parJour: 'Honoraires par jour travaillé', parSalarie: 'Honoraires par salarié (ETP)', parPatient: 'Honoraires par patient',
    taux: 'Taux de charges', tauxEst: 'estimé', tauxRef: 'référence', partPersonnel: 'Personnel / honoraires', partProthese: 'Prothésiste / honoraires', partLoyer: 'Loyer / honoraires',
    benefice: 'Bénéfice avant impôt (BNC)', beneficeAvantCotis: 'Bénéfice avant vos cotisations personnelles', beneficeSelarl: 'Résultat avant votre rémunération et vos cotisations', moisLabel: 'soit par mois', horsCotis: 'hors cotisations personnelles',
    cabinets: 'cabinets', quart: 'cabinets du {q}e quart de recettes', proxy: 'référence des chirurgiens-dentistes, faute de statistique publique pour les stomatologues', fragile: 'petit échantillon',
    rangSous: 'Ce bénéfice serait sous le 1er décile des revenus 2021 des dentistes libéraux (DREES).', rangAu: 'Ce bénéfice dépasserait le 9e décile des revenus 2021 des dentistes libéraux (DREES).', rangCentile: 'Ce bénéfice se placerait vers le {c} centile des revenus 2021 des dentistes libéraux (DREES, interpolation entre déciles et quartiles publiés).',
    distinguish: 'Ce qui vous distingue', fort: 'Point fort', surveiller: 'À surveiller', neutre: 'Repère',
    hyp: 'Méthode de ce calcul', hypText: 'Moyennes {annee} de l’Assurance Maladie par praticien actif à part entière (open data data.ameli.fr). Ce sont des moyennes, pas des percentiles : la distribution n’est pas publiée. Les honoraires non remboursables sont retirés avant comparaison. Taux de charges de référence : {src}.',
    method: 'Méthode et sources', copy: 'Copier le résultat', copied: 'Copié', share: 'Lien de partage', print: 'Imprimer',
    bar: 'vs moyenne',
  },
  en: {
    spec: 'Specialty', s_omni: 'General dentist', s_odf: 'Orthodontist (ODF)', s_stomato: 'Stomatologist (doctor)',
    dep: 'Département', recettes: 'Your fees this year', recettesHelp: 'Your own activity, all procedures (receipts ledger, line AG of form 2035).',
    hn: 'Of which non-reimbursable', hnHelp: 'Implants, periodontics, whitening, adult orthodontics: missing from health insurance figures.',
    fauteuils: 'Dental chairs you use', salaries: 'Staff working with you', salariesHelp: 'Full-time equivalent: dental nurses, receptionist, dental aide.', unitEtp: 'FTE',
    jours: 'Days worked per week', semaines: 'Weeks worked per year',
    adv: 'Costs, legal form and patients (optional)', advHelp: 'With no costs entered, profit is estimated with the specialty’s reference cost ratio.',
    statut: 'Legal form: sole practice (BNC) or company (SELARL)', bnc: 'BNC', selarl: 'SELARL',
    personnel: 'Salaries and employer contributions', prothesiste: 'Dental laboratory', fournitures: 'Supplies and consumables', loyer: 'Rent and service charges', autres: 'Other costs (depreciation, insurance, software…)',
    cotis: 'Your personal contributions (Urssaf, CARCDSF)', cotisHelpSelarl: 'In a SELARL: leave at 0, they are paid on your salary.',
    patients: 'Different patients seen in the year', patientsHelp: 'Optional: your practice software shows it.',
    depPart: 'Share of fees above the agreed tariffs', depPartHelp: 'Optional: prosthetics, orthodontics, extra fees. 0 = not entered.', an: '€/yr',
    head: 'Your fees against the average', headSub: 'comparable fees, excluding non-reimbursable work',
    above: 'above the average', below: 'below the average', secret: 'Average not published (fewer than 5 practitioners): compared with the region and France.',
    you: 'You', lDep: 'Département', lReg: 'Region', lFr: 'France',
    rankLine: 'Your figure is above the {spec} average of {n} départements out of {t}.',
    ratios: 'Your ratios', parFauteuil: 'Fees per chair', parJour: 'Fees per day worked', parSalarie: 'Fees per staff member (FTE)', parPatient: 'Fees per patient',
    taux: 'Cost ratio', tauxEst: 'estimated', tauxRef: 'reference', partPersonnel: 'Staff / fees', partProthese: 'Laboratory / fees', partLoyer: 'Rent / fees',
    benefice: 'Profit before income tax (BNC)', beneficeAvantCotis: 'Profit before your personal contributions', beneficeSelarl: 'Result before your pay and contributions', moisLabel: 'per month', horsCotis: 'excluding personal contributions',
    cabinets: 'practices', quart: 'practices in receipts quarter {q}', proxy: 'dentists’ benchmark, as no public figure exists for stomatologists', fragile: 'small sample',
    rangSous: 'This profit would sit below the bottom decile of 2021 dentists’ income (DREES).', rangAu: 'This profit would sit above the top decile of 2021 dentists’ income (DREES).', rangCentile: 'This profit would sit near the {c} percentile of 2021 private dentists’ income (DREES, interpolated between published deciles and quartiles).',
    distinguish: 'What sets you apart', fort: 'Strength', surveiller: 'Worth watching', neutre: 'Benchmark',
    hyp: 'How this is calculated', hypText: '{annee} Assurance Maladie averages per full-time active practitioner (data.ameli.fr open data). These are averages, not percentiles: the distribution is not published. Non-reimbursable fees are removed before comparing. Reference cost ratio: {src}.',
    method: 'Method and sources', copy: 'Copy result', copied: 'Copied', share: 'Share link', print: 'Print',
    bar: 'vs average',
  },
};
const SPEC_PLURAL = { fr: { omni: 'omnipraticiens', odf: 'orthodontistes', stomato: 'stomatologues' }, en: { omni: 'general dentists', odf: 'orthodontists', stomato: 'stomatologists' } };

export interface BenchmarkProps { lang?: L; methodHref?: string; spec?: Spec; dep?: string }

export default function Benchmark({ lang = 'fr', methodHref, spec: spec0 = 'omni', dep: dep0 = '69' }: BenchmarkProps) {
  const t = TX[lang];
  const $ = (x: number) => formatMoney(x, 0, lang);
  const pc = (x: number, d = 1) => formatPercent(x, d, lang);
  const D = P.defauts[spec0];
  const [spec, setSpec] = useState<Spec>(spec0);
  const [dep, setDep] = useState(dep0);
  const [recettes, setRecettes] = useState(D.recettes);
  const [hn, setHn] = useState(D.horsNomenclature * 100);
  const [fauteuils, setFauteuils] = useState(D.fauteuils);
  const [salaries, setSalaries] = useState(D.salaries);
  const [jours, setJours] = useState(D.joursSemaine);
  const [semaines, setSemaines] = useState(D.semaines);
  const [statut, setStatut] = useState<'bnc' | 'selarl'>('bnc');
  const [personnel, setPersonnel] = useState(0);
  const [prothesiste, setProthesiste] = useState(0);
  const [fournitures, setFournitures] = useState(0);
  const [loyer, setLoyer] = useState(0);
  const [autres, setAutres] = useState(0);
  const [cotis, setCotis] = useState(0);
  const [patients, setPatients] = useState(0);
  const [depPart, setDepPart] = useState(0);
  const [copied, setCopied] = useState(false);

  const applyDefaults = (s: Spec) => {
    const d = P.defauts[s];
    setRecettes(d.recettes); setHn(d.horsNomenclature * 100); setFauteuils(d.fauteuils); setSalaries(d.salaries); setJours(d.joursSemaine); setSemaines(d.semaines);
  };
  useEffect(() => {
    const u = readParams(window.location.search);
    if (![...u.keys()].length) return;
    const s = (SPECS.includes(str(u, 'sp', spec0) as Spec) ? str(u, 'sp', spec0) : spec0) as Spec;
    const d = P.defauts[s];
    setSpec(s); setDep(DEP_CODES.includes(str(u, 'd', dep0)) ? str(u, 'd', dep0) : dep0);
    setRecettes(num(u, 'r', d.recettes)); setHn(num(u, 'hn', d.horsNomenclature * 100)); setFauteuils(num(u, 'f', d.fauteuils)); setSalaries(num(u, 'sa', d.salaries));
    setJours(num(u, 'j', d.joursSemaine)); setSemaines(num(u, 'w', d.semaines)); setStatut(str(u, 'st', 'bnc') === 'selarl' ? 'selarl' : 'bnc');
    setPersonnel(num(u, 'cp', 0)); setProthesiste(num(u, 'cl', 0)); setFournitures(num(u, 'cf', 0)); setLoyer(num(u, 'cy', 0)); setAutres(num(u, 'ca', 0)); setCotis(num(u, 'co', 0));
    setPatients(num(u, 'pa', 0)); setDepPart(num(u, 'dp', 0));
  }, []);
  useEffect(() => {
    updateURL({ sp: spec, d: dep, r: recettes, hn, f: fauteuils, sa: salaries, j: jours, w: semaines, st: statut, cp: personnel || undefined, cl: prothesiste || undefined, cf: fournitures || undefined, cy: loyer || undefined, ca: autres || undefined, co: cotis || undefined, pa: patients || undefined, dp: depPart || undefined });
  }, [spec, dep, recettes, hn, fauteuils, salaries, jours, semaines, statut, personnel, prothesiste, fournitures, loyer, autres, cotis, patients, depPart]);

  const R = useMemo(() => {
    const ref = refs(spec, dep);
    const comp = comparable(recettes, hn / 100);
    const gDep = gap(comp, ref.dep?.tot), gReg = gap(comp, ref.reg?.tot), gFr = gap(comp, ref.fr?.tot);
    const main = gDep ?? gReg ?? gFr;
    const below = depsBelow(spec, comp);
    const U = reference(spec, recettes);
    const avecCotis = statut === 'bnc';
    const c = cabinet({ recettes, fauteuils, salaries, joursSemaine: jours, semaines, charges: { personnel, prothesiste, fournitures, loyer, autres }, cotisationsPerso: avecCotis ? cotis : 0 }, avecCotis ? U.taux : U.tauxHorsCotis);
    // Taux de référence comparable à ce qui a été saisi : cotisations personnelles comprises seulement si elles le sont.
    const cotisIncluses = avecCotis && (c.chargesEstimees || cotis > 0);
    const tauxRef = cotisIncluses ? U.taux : U.tauxHorsCotis;
    const parPatient = patients > 0 ? comp / patients : null;
    const refParPatient = ref.dep?.tot && ref.dep.patients ? ref.dep.tot / ref.dep.patients : null;
    const points = distinctions({ spec, gDep, gFr, cab: c, tauxRef, refPersonnel: U.personnel, patients, refPatients: ref.dep?.patients ?? ref.fr?.patients ?? null, parPatient, refParPatient, depPart: depPart / 100, refDepPart: depShare(ref.dep) ?? depShare(ref.fr), hn: hn / 100 });
    const rang = cotisIncluses && spec !== 'stomato' ? rangRevenu(c.benefice) : null;
    return { ref, comp, gDep, gReg, gFr, main, below, c, tauxRef, U, cotisIncluses, parPatient, points, rang };
  }, [spec, dep, recettes, hn, fauteuils, salaries, jours, semaines, statut, personnel, prothesiste, fournitures, loyer, autres, cotis, patients, depPart]);

  const sp = SPEC_PLURAL[lang][spec];
  const bars = [
    { label: t.you, v: R.comp, you: true },
    { label: `${t.lDep} · ${depName(dep)}`, v: R.ref.dep?.tot ?? null },
    { label: `${t.lReg} · ${regName(R.ref.region)}`, v: R.ref.reg?.tot ?? null },
    { label: t.lFr, v: R.ref.fr?.tot ?? null },
  ];
  const vmax = Math.max(1, ...bars.map((b) => b.v ?? 0));
  const ratioTxt = R.main ? `${R.main.ratio >= 0 ? '+' : '−'}${pc(Math.abs(R.main.ratio), 0)}` : '';
  const headline = R.main ? `${ratioTxt} ${R.main.above ? t.above : t.below}` : '';
  const benefLabel = statut === 'selarl' ? t.beneficeSelarl : R.cotisIncluses ? t.benefice : t.beneficeAvantCotis;
  const label = (k: Point['kind']) => (k === 'fort' ? t.fort : k === 'surveiller' ? t.surveiller : t.neutre);
  const rows: Array<[string, string, string?]> = [
    ...(R.c.parFauteuil != null ? [[t.parFauteuil, $(R.c.parFauteuil)] as [string, string]] : []),
    ...(R.c.parJour != null ? [[t.parJour, $(R.c.parJour)] as [string, string]] : []),
    ...(R.c.parSalarie != null ? [[t.parSalarie, $(R.c.parSalarie)] as [string, string]] : []),
    ...(R.parPatient != null ? [[t.parPatient, $(R.parPatient)] as [string, string]] : []),
    [t.taux, R.c.tauxCharges != null ? pc(R.c.tauxCharges) : '–', R.c.chargesEstimees ? `${t.tauxEst} · ${t.tauxRef} ${pc(R.tauxRef)}` : `${t.tauxRef} ${pc(R.tauxRef)}${R.cotisIncluses ? '' : ` (${t.horsCotis})`}`],
    ...(R.c.partPersonnel != null ? [[t.partPersonnel, pc(R.c.partPersonnel)] as [string, string]] : []),
    ...(R.c.partProthese != null ? [[t.partProthese, pc(R.c.partProthese)] as [string, string]] : []),
    ...(R.c.partLoyer != null ? [[t.partLoyer, pc(R.c.partLoyer)] as [string, string]] : []),
  ];
  const srcLabel = `UNASA ${UNASA_YEAR}, ${formatNumber(R.U.echantillon, 0, lang)} ${t.cabinets}${R.U.quartile ? `, ${t.quart.replace('{q}', String(R.U.quartile))}` : ''}${R.U.proxy ? `, ${t.proxy}` : ''}${R.U.fragile ? `, ${t.fragile}` : ''}`;
  const fill = (s: string) => s.replace('{annee}', String(DATA_YEAR)).replace('{src}', srcLabel);
  const rangTxt = R.rang ? (R.rang.sous ? t.rangSous : R.rang.au ? t.rangAu : t.rangCentile.replace('{c}', ordinal(R.rang.centile!, lang))) : '';
  const copy = () => { const txt = `${t.head} : ${headline} (${$(R.comp)}) · ${benefLabel} : ${$(R.c.benefice)} · ${window.location.href}`; navigator.clipboard?.writeText(txt).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); };
  const resRef = useRef<HTMLDivElement>(null);
  const depOptions = DEP_CODES.map((c) => ({ value: c, label: `${c} · ${depName(c)}` }));

  return (
    <div className="rechner not-prose rounded-xl border border-navy-200 bg-white p-4 sm:p-6" data-chrome>
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-6">
        <form onSubmit={(e) => e.preventDefault()} className="grid content-start gap-y-4">
          <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
            <SelectField id="bm-sp" label={t.spec} value={spec} onChange={(x) => { const s = x as Spec; setSpec(s); applyDefaults(s); }} options={SPECS.map((s) => ({ value: s, label: t[`s_${s}` as const] }))} />
            <SelectField id="bm-d" label={t.dep} value={dep} onChange={setDep} options={depOptions} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <NumberField id="bm-r" label={t.recettes} value={recettes} onChange={setRecettes} unit="€" max={10_000_000} help={t.recettesHelp} lang={lang} />
            <NumberField id="bm-hn" label={t.hn} value={hn} onChange={setHn} unit="%" max={100} decimals={0} help={t.hnHelp} lang={lang} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <NumberField id="bm-f" label={t.fauteuils} value={fauteuils} onChange={setFauteuils} max={30} lang={lang} />
            <NumberField id="bm-sa" label={t.salaries} value={salaries} onChange={setSalaries} unit={t.unitEtp} max={100} decimals={1} help={t.salariesHelp} lang={lang} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <NumberField id="bm-j" label={t.jours} value={jours} onChange={setJours} max={7} decimals={1} lang={lang} />
            <NumberField id="bm-w" label={t.semaines} value={semaines} onChange={setSemaines} max={52} lang={lang} />
          </div>
          <details className="rounded-lg border border-navy-200 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-navy-900">{t.adv}</summary>
            <p className="mt-2 text-xs text-navy-600">{t.advHelp}</p>
            <div className="mt-4 grid gap-y-4">
              <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                <Toggle id="bm-st" label={t.statut} value={statut} onChange={(x) => setStatut(x as 'bnc' | 'selarl')} options={[{ value: 'bnc', label: t.bnc }, { value: 'selarl', label: t.selarl }]} />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <NumberField id="bm-cp" label={t.personnel} value={personnel} onChange={setPersonnel} unit={t.an} max={5_000_000} lang={lang} />
                <NumberField id="bm-cl" label={t.prothesiste} value={prothesiste} onChange={setProthesiste} unit={t.an} max={5_000_000} lang={lang} />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <NumberField id="bm-cf" label={t.fournitures} value={fournitures} onChange={setFournitures} unit={t.an} max={5_000_000} lang={lang} />
                <NumberField id="bm-cy" label={t.loyer} value={loyer} onChange={setLoyer} unit={t.an} max={5_000_000} lang={lang} />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <NumberField id="bm-ca" label={t.autres} value={autres} onChange={setAutres} unit={t.an} max={5_000_000} lang={lang} />
                <NumberField id="bm-co" label={t.cotis} value={statut === 'selarl' ? 0 : cotis} onChange={setCotis} unit={t.an} max={2_000_000} help={statut === 'selarl' ? t.cotisHelpSelarl : undefined} lang={lang} />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <NumberField id="bm-pa" label={t.patients} value={patients} onChange={setPatients} max={20_000} help={t.patientsHelp} lang={lang} />
                <NumberField id="bm-dp" label={t.depPart} value={depPart} onChange={setDepPart} unit="%" max={100} help={t.depPartHelp} lang={lang} />
              </div>
            </div>
          </details>
        </form>

        <div ref={resRef} aria-live="polite" data-resultat className="mt-6 rounded-xl border border-accent-200 bg-accent-50/60 p-4 sm:p-5 lg:sticky lg:top-20 lg:mt-0">
          <p className="text-sm font-medium text-navy-700">{t.head} · {sp} {lang === 'fr' ? dansDep(dep) : `in ${depName(dep)}`}</p>
          <p className={`tabular-nums mt-1 text-4xl font-bold ${R.main?.above ? 'text-accent-700' : 'text-navy-900'}`}>{ratioTxt || '–'}</p>
          <p className="mt-1 text-sm text-navy-700">{R.main ? (R.main.above ? t.above : t.below) : ''} · <span className="tabular-nums">{$(R.comp)}</span> <span className="text-navy-600">({t.headSub})</span></p>
          {!R.gDep && <p className="mt-2 text-xs font-medium text-amber-800">{t.secret}</p>}
          <div className="mt-4 space-y-2" role="img" aria-label={bars.filter((b) => b.v).map((b) => `${b.label} : ${$(b.v!)}`).join(', ')}>
            {bars.map((b) => (
              <div key={b.label}>
                <div className="flex items-baseline justify-between gap-3 text-xs"><span className={b.you ? 'font-semibold text-navy-900' : 'text-navy-700'}>{b.label}</span><span className="tabular-nums text-navy-900">{b.v ? $(b.v) : '–'}</span></div>
                <div className="mt-0.5 h-2.5 rounded-full bg-white"><div className={`h-2.5 rounded-full ${b.you ? 'bg-accent-600' : 'bg-navy-400'}`} style={{ width: `${b.v ? Math.max(2, (b.v / vmax) * 100) : 0}%` }} /></div>
              </div>
            ))}
          </div>
          {R.below.total > 0 && <p className="mt-3 text-sm text-navy-700">{t.rankLine.replace('{spec}', sp).replace('{n}', formatNumber(R.below.below, 0, lang)).replace('{t}', formatNumber(R.below.total, 0, lang))}</p>}
          <div className="mt-4 rounded-lg bg-white p-3">
            <p className="text-sm font-medium text-navy-700">{benefLabel}{R.c.chargesEstimees ? ` (${t.tauxEst})` : ''}</p>
            <p className="tabular-nums text-2xl font-bold text-navy-900">{$(R.c.benefice)}</p>
            <p className="tabular-nums text-xs text-navy-600">{t.moisLabel} {$(R.c.benefice / 12)}</p>
            {rangTxt && <p className="mt-1 text-xs text-navy-700">{rangTxt}</p>}
          </div>
          <table className="mt-3 w-full text-sm"><caption className="sr-only">{t.ratios}</caption><tbody className="divide-y divide-navy-200">
            {rows.map(([l, x, n]) => <tr key={l}><td className="py-1.5 pr-3 text-navy-700">{l}{n && <span className="block text-xs text-navy-600">{n}</span>}</td><td className="tabular-nums py-1.5 text-right align-top text-navy-900">{x}</td></tr>)}
          </tbody></table>
          {R.points.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-navy-900">{t.distinguish}</p>
              <ul className="mt-2 space-y-2 text-sm text-navy-800">
                {R.points.map((p) => <li key={p.code} className={`border-l-2 pl-3 ${p.kind === 'fort' ? 'border-accent-600' : p.kind === 'surveiller' ? 'border-amber-600' : 'border-navy-300'}`}><span className="block text-xs font-semibold uppercase tracking-wide text-navy-600">{label(p.kind)}</span>{p.text[lang]}</li>)}
              </ul>
            </div>
          )}
          <details className="mt-3 text-sm text-navy-700"><summary className="cursor-pointer font-medium">{t.hyp}</summary><p className="mt-2">{fill(t.hypText)} {methodHref && <a href={methodHref} className="underline">{t.method}</a>}</p></details>
          <div className="no-print mt-4 flex flex-wrap gap-2 text-sm">
            <button type="button" onClick={copy} className="rounded-lg border border-navy-300 bg-white px-3 py-2 font-medium text-navy-800 hover:bg-navy-50">{copied ? t.copied : t.copy}</button>
            <button type="button" onClick={() => navigator.clipboard?.writeText(window.location.href)} className="rounded-lg border border-navy-300 bg-white px-3 py-2 font-medium text-navy-800 hover:bg-navy-50">{t.share}</button>
            <button type="button" onClick={() => window.print()} className="rounded-lg border border-navy-300 bg-white px-3 py-2 font-medium text-navy-800 hover:bg-navy-50">{t.print}</button>
          </div>
        </div>
      </div>
      <ResultBar target={resRef} label={`${t.bar} · ${depName(dep)}`} value={ratioTxt} />
    </div>
  );
}
