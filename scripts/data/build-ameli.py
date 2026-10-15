#!/usr/bin/env python3
"""Jeu de données du site : honoraires et effectifs des chirurgiens-dentistes libéraux
par département, région et France entière, depuis l'open data de l'Assurance Maladie
(data.ameli.fr, SNDS, licence ODbL). Rejouable : python3 scripts/data/build-ameli.py

Télécharge les exports CSV officiels dans scripts/data/raw/ (ignorés par git), puis écrit
src/data/ameli.json. Aucune valeur n'est estimée : un indicateur couvert par le secret
statistique (« NS », moins de 5 praticiens) reste nul (null) et n'est jamais affiché.
Mise à jour annuelle : la Cnam ajoute l'année N-1 en octobre (2025 ajoutée le 12/10/2026).
"""
import csv, json, os, sys, urllib.parse, urllib.request, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(os.path.dirname(HERE))
RAW = os.path.join(HERE, 'raw'); os.makedirs(RAW, exist_ok=True)
API = 'https://data.ameli.fr/api/explore/v2.1/catalog/datasets'
DATASETS = ['honoraires', 'demographie-effectifs-et-les-densites', 'demographie-exercices-liberaux', 'patientele']
WHERE = 'search(profession_sante,"dentistes") or profession_sante="Stomatologues"'
PROF = {
    "Chirurgiens-dentistes (hors spécialistes d'orthopédie dento-faciale - ODF)": 'omni',
    "Chirurgiens-dentistes spécialistes d'orthopédie dento-faciale (ODF)": 'odf',
    'Stomatologues': 'stomato',
    'Ensemble des chirurgiens-dentistes': 'ensemble',
}
FIRST_YEAR = 2015

def download(force=False):
    for ds in DATASETS:
        p = os.path.join(RAW, ds + '.csv')
        if os.path.exists(p) and not force: continue
        url = f"{API}/{ds}/exports/csv?where={urllib.parse.quote(WHERE)}&delimiter=%3B"
        print('télécharge', url)
        urllib.request.urlretrieve(url, p)

def rows(ds):
    return list(csv.DictReader(open(os.path.join(RAW, ds + '.csv'), encoding='utf-8-sig'), delimiter=';'))

def num(v):
    if v in (None, '', 'NS', 'NC'): return None
    return float(v)

def key(r):
    """('fr', None) pour la France, ('reg', code) pour une région, ('dep', code) pour un département."""
    if r['region'] == '99': return ('fr', 'FR')
    if r['departement'] == '999': return ('reg', r['region'])
    return ('dep', r['departement'])

def main():
    download('--force' in sys.argv)
    ent = {}   # (niveau, code) -> {name, region, prof: {...}}
    def slot(r):
        k = key(r)
        e = ent.setdefault(k, {'name': r['libelle_departement'] if k[0] == 'dep' else (r['libelle_region'] if k[0] == 'reg' else 'France'), 'region': r['region'] if k[0] == 'dep' else None, 'p': {}})
        return e['p'].setdefault(PROF[r['profession_sante']], {'hist': {}})
    years = set()
    for r in rows('honoraires'):
        y = int(r['annee'][:4]); years.add(y)
        if y < FIRST_YEAR: continue
        s = slot(r)
        hsd, dep = num(r['hono_sans_depassement_moyens']), num(r['depassements_moyens'])
        tot_sd, tot_dep = num(r['hono_sans_depassement_totaux']), num(r['depassements_totaux'])
        if hsd is not None and dep is not None and hsd + dep > 0:
            s['hist'][y] = round(hsd + dep)
        if y == max(int(x['annee'][:4]) for x in [r]) and False: pass
        s.setdefault('_y', {})[y] = dict(hsd=hsd, dep=dep, tot_sd=tot_sd, tot_dep=tot_dep)
    Y = max(years)
    for r in rows('demographie-effectifs-et-les-densites'):
        if int(r['annee'][:4]) not in (Y, Y - 5): continue
        if r['libelle_sexe'] not in ('tout sexe', 'femmes'): continue
        s = slot(r); y = int(r['annee'][:4])
        d = s.setdefault('_d', {}).setdefault(y, {'age': {}, 'f': None, 'eff': None, 'dens': None})
        if r['libelle_sexe'] == 'tout sexe':
            if r['classe_age'] == 'tout_age': d['eff'] = int(r['effectif']); d['dens'] = num(r['densite'])
            else: d['age'][r['classe_age']] = d['age'].get(r['classe_age'], 0) + int(r['effectif'])
        elif r['classe_age'] == 'tout_age': d['f'] = int(r['effectif'])
    for r in rows('demographie-exercices-liberaux'):
        if int(r['annee'][:4]) != Y: continue
        slot(r).setdefault('_x', {})[r['libelle_type_exercice_liberal']] = int(r['effectif'])
    for r in rows('patientele'):
        if int(r['annee'][:4]) != Y: continue
        slot(r)['patients'] = num(r['nombre_patients_uniques'])
    out = {'fr': None, 'regions': {}, 'departements': {}}
    for (lvl, code), e in sorted(ent.items()):
        P = {}
        for prof, s in e['p'].items():
            yv = s.get('_y', {}).get(Y, {}); d = s.get('_d', {}).get(Y, {}); d5 = s.get('_d', {}).get(Y - 5, {})
            eff = d.get('eff'); age = d.get('age', {})
            old = sum(v for k, v in age.items() if k in ('60-64', '65-69', '70 et +'))
            young = sum(v for k, v in age.items() if k in ('0-24', '00-24', '25-29', '30-34'))
            hsd, dep = yv.get('hsd'), yv.get('dep')
            ape = round(yv['tot_sd'] / hsd) if yv.get('tot_sd') and hsd else None
            mixte = s.get('_x', {}).get('libéral mixte'); excl = s.get('_x', {}).get('libéral exclusif')
            P[prof] = {
                'eff': eff, 'eff5': d5.get('eff'), 'dens': d.get('dens'), 'ape': ape,
                'hsd': round(hsd) if hsd else None, 'dep': round(dep) if dep is not None and hsd else None,
                'tot': round(hsd + dep) if hsd and dep is not None and hsd + dep > 0 else None,
                'femmes': round(d['f'] / eff, 3) if eff and d.get('f') is not None else None,
                'p60': round(old / eff, 3) if eff else None, 'm35': round(young / eff, 3) if eff else None,
                'mixte': round(mixte / (mixte + excl), 3) if mixte is not None and excl else None,
                'patients': round(s['patients']) if s.get('patients') else None,
                'hist': {str(k): v for k, v in sorted(s['hist'].items())},
            }
            if not P[prof]['tot']: P[prof]['hist'] = {}
        rec = {'name': e['name'], 'p': P}
        if lvl == 'fr': out['fr'] = rec
        elif lvl == 'reg': out['regions'][code] = rec
        else: rec['region'] = e['region']; out['departements'][code] = rec
    out['meta'] = {
        'year': Y, 'retrieved_at': datetime.date.today().isoformat(),
        'source': "Assurance Maladie (Cnam), data.ameli.fr, « Professionnels de santé libéraux » : honoraires, effectifs et densités, type d'exercice, patientèle (SNDS), licence ODbL",
        'datasets': {ds: f'https://data.ameli.fr/explore/dataset/{ds}/' for ds in DATASETS},
        'secret': 'Indicateurs non diffusés (NS) quand moins de 5 praticiens : null ici, jamais affichés.',
    }
    p = os.path.join(SITE, 'src', 'data', 'ameli.json')
    json.dump(out, open(p, 'w'), ensure_ascii=False, separators=(',', ':'))
    print('écrit', p, os.path.getsize(p), 'octets ; année', Y, ';', len(out['departements']), 'départements,', len(out['regions']), 'régions')

if __name__ == '__main__':
    main()
