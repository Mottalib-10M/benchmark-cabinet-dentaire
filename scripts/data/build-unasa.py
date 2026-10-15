#!/usr/bin/env python3
"""Statistiques professionnelles UNASA (fédération des organismes de gestion agréés), en accès
libre sur https://unasa.fr/statistiques/ : comptes des adhérents chirurgiens-dentistes (code 851EAA)
et orthodontistes (851EAB). Les réponses du formulaire officiel (requête `cedstats_get_stats`,
relevées le 2026-10-15) sont conservées telles quelles dans scripts/data/unasa/*.json ; ce script
en extrait les tableaux vers src/data/unasa.json. Rejouable : python3 scripts/data/build-unasa.py
"""
import glob, html, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); SITE = os.path.dirname(os.path.dirname(HERE))
def cell(s):
    s = html.unescape(re.sub(r'<[^>]+>', '', s)).replace(' ', ' ').replace('\xa0', ' ').strip()
    if not s: return None
    v = s.replace('€', '').replace(' ', '').replace(',', '.')
    try: return float(v)
    except ValueError: return s
out = {}
for f in sorted(glob.glob(os.path.join(HERE, 'unasa', '*.json'))):
    code, year = os.path.basename(f)[:-5].split('_')
    h = json.load(open(f))['data']['html']
    m = re.search(r'Échantillon\s*:\s*([\d\s]+)', h)
    rows = {}
    for tr in re.findall(r'<tr[^>]*>(.*?)</tr>', h, re.S):
        tds = re.findall(r'<td[^>]*>(.*?)</td>', tr, re.S)
        if len(tds) >= 2 and cell(tds[0]) and isinstance(cell(tds[0]), str):
            k = cell(tds[0]); k = k if k not in rows else k + ' (évolution, %)'
            rows[k] = [cell(x) for x in tds[1:]]
    out[f'{code}_{year}'] = {'echantillon': int(m.group(1).replace(' ', '')) if m else None, 'colonnes': ['ensemble', 'q1', 'q2', 'q3', 'q4'], 'lignes': rows}
out['_source'] = {'url': 'https://unasa.fr/statistiques/', 'retrieved_at': '2026-10-15', 'note': "Postes en % du montant net des recettes ; quartiles de recettes ; adhérents en BNC d'un organisme de gestion agréé, hors sociétés à l'IS."}
json.dump(out, open(os.path.join(SITE, 'src', 'data', 'unasa.json'), 'w'), ensure_ascii=False, indent=1)
print({k: (v['echantillon'], len(v['lignes'])) for k, v in out.items() if not k.startswith('_')})
