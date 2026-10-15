/**
 * Contrôle des fichiers de `src/content/` (un guide = un fichier) avant même le build.
 * Une seule fiche : PAGE_FILES=carte-vtc npx vitest run tests/pages.test.ts
 */
import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { P } from '../src/lib/engine/params';
import { MINIS } from '../src/lib/mini-specs';
import type { PageDef, Helpers, Lang } from '../src/lib/guide-types';

const dirs = ['guides'];
const only = process.env.PAGE_FILES?.split(',').map((s) => s.trim().replace(/\.ts$/, ''));
const all: PageDef[] = [];
for (const d of dirs) {
  for (const f of readdirSync(new URL(`../src/content/${d}/`, import.meta.url))) {
    if (!f.endsWith('.ts')) continue;
    const mod = await import(`../src/content/${d}/${f}`);
    all.push(mod.default as PageDef);
  }
}
const CORE = ['home', 'method', 'about', 'widget', 'contact', 'editorial', 'privacy', 'terms', 'cookies'];
const ids = new Set([...CORE, ...all.map((p) => p.id)]);
const pages = only ? all.filter((p) => only.includes(p.id)) : all;
/** Les ébauches réservées (titre vide) ne comptent pas dans les contrôles d'unicité. */
const written = all.filter((p) => p.fr.title !== '');
const words = (s: string) => s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

/** Helpers factices : enregistrent les liens internes et les sources citées. */
function spy(lang: Lang) {
  const links: string[] = [], srcs: string[] = [];
  const h: Helpers = {
    lang, P,
    a: (id, text) => { links.push(id); return `<a href="#${id}">${text}</a>`; },
    eur: (n) => `${n} €`, num: (n) => String(n), pct: (x) => `${x * 100} %`, date: (d) => d,
    table: (hd, rows) => `<table>${hd.join('')}${rows.flat().join('')}</table>`,
    src: (k, t) => { srcs.push(k); return t ?? P.sources[k].label[lang]; },
  };
  return { h, links, srcs };
}

describe('registre des pages', () => {
  it('identifiants et slugs uniques, sans année ni nombre de trois chiffres', () => {
    expect(new Set(all.map((p) => p.id)).size).toBe(all.length);
    for (const l of ['fr', 'en'] as const) {
      const slugs = all.map((p) => p[l].slug);
      expect(new Set(slugs).size).toBe(slugs.length);
      for (const s of slugs) { expect(s).toMatch(/^[a-z0-9-]+$/); expect(s).not.toMatch(/20[2-3]\d|\d{3}/); }
    }
  });
  it('aucune question de FAQ partagée entre deux pages', () => {
    const seen = new Map<string, string>();
    for (const p of written) for (const l of ['fr', 'en'] as const) for (const f of p[l].faqs) {
      const k = f.q.toLowerCase().replace(/[\s?¿!.]+$/, '');
      expect(seen.get(k), `« ${f.q} » déjà sur ${seen.get(k)}`).toBeUndefined();
      seen.set(k, p.id);
    }
  });
  it('titres et descriptions uniques', () => {
    const t = written.flatMap((p) => [p.fr.title, p.en.title]); expect(new Set(t).size).toBe(t.length);
    const d = written.flatMap((p) => [p.fr.description, p.en.description]); expect(new Set(d).size).toBe(d.length);
  });
});

for (const p of pages) {
  describe(p.id, () => {
    it('mini-simulateur ou outil, liens et sources existants', () => {
      if (!p.tool) { expect(p.mini, 'mini manquant').toBeTruthy(); expect(MINIS[p.mini!], `src/lib/minis/${p.mini}.ts absent`).toBeTruthy(); }
      if (p.miniHref) expect(ids.has(p.miniHref)).toBe(true);
      expect(p.related.length).toBeGreaterThanOrEqual(3);
      for (const r of p.related) expect(ids.has(r), `related inconnu : ${r}`).toBe(true);
      expect(p.sources.length).toBeGreaterThanOrEqual(2);
      for (const s of p.sources) expect(P.sources[s], `source inconnue : ${s}`).toBeTruthy();
    });
    for (const l of ['fr', 'en'] as const) {
      it(`${l} : titre 50-60, description 150-160, sans tiret cadratin`, () => {
        const x = p[l];
        expect(x.title.length, x.title).toBeGreaterThanOrEqual(50); expect(x.title.length, x.title).toBeLessThanOrEqual(60);
        expect(x.description.length, x.description).toBeGreaterThanOrEqual(150); expect(x.description.length, x.description).toBeLessThanOrEqual(160);
        expect(x.title).toMatch(/202[56]/); expect(x.description).toMatch(/202[56]/);
        for (const s of [x.title, x.description, x.h1, x.intro, x.resume]) expect(s).not.toMatch(/—/);
      });
      it(`${l} : bloc citable ≥ 120 mots, FAQ 4 à 8 questions de 40 à 90 mots`, () => {
        const x = p[l];
        expect(words(x.resume)).toBeGreaterThanOrEqual(120);
        expect(x.faqs.length).toBeGreaterThanOrEqual(p.tool ? 3 : 4); expect(x.faqs.length).toBeLessThanOrEqual(8);
        for (const f of x.faqs) { const n = words(f.a); expect(n, `${n} mots : ${f.q}`).toBeGreaterThanOrEqual(40); expect(n, `${n} mots : ${f.q}`).toBeLessThanOrEqual(90); }
      });
      it(`${l} : corps, liens internes valides, aucun tiret cadratin`, () => {
        const { h, links, srcs } = spy(l);
        const body = p[l].body(h);
        for (const id of links) expect(ids.has(id), `lien vers une page inconnue : ${id}`).toBe(true);
        for (const s of srcs) expect(P.sources[s as keyof typeof P.sources]).toBeTruthy();
        expect(body).not.toMatch(/—|&mdash;/);
        for (const m of body.matchAll(/<!--mini:([A-Za-z0-9_]+)-->/g)) expect(MINIS[m[1]], `mini ${m[1]} absent`).toBeTruthy();
        const total = words(body) + words(p[l].resume) + p[l].faqs.reduce((s, f) => s + words(f.q) + words(f.a), 0);
        expect(total, 'longueur').toBeGreaterThanOrEqual(p.tool ? 450 : 1100);
      });
    }
  });
}

describe('mini-simulateurs', () => {
  for (const [k, f] of Object.entries(MINIS)) {
    it(`${k} : résultat calculé dans les deux langues, sans NaN`, () => {
      for (const l of ['fr', 'en'] as const) {
        const s = f(l);
        const v = Object.fromEntries(s.inputs.map((i) => [i.id, i.def]));
        const o = s.run(v);
        expect(o.head[1]).not.toMatch(/NaN|undefined|Infinity/);
        for (const [, x] of o.rows) expect(x).not.toMatch(/NaN|undefined|Infinity/);
      }
    });
  }
});

/* Pages département : texte rédigé propre à chaque département (src/content/departements/<code>.ts). */
import { DEP_PAGES } from '../src/lib/departements';
import { DEPS, FR, REGS } from '../src/lib/engine/data';
import type { DepDef, DepHelpers } from '../src/lib/dep-types';
import { depGen } from '../src/lib/dep-gen';
const deps: DepDef[] = [];
for (const f of readdirSync(new URL('../src/content/departements/', import.meta.url))) if (f.endsWith('.ts')) deps.push((await import(`../src/content/departements/${f}`)).default as DepDef);
describe('pages département', () => {
  it('une page rédigée par département publié, pas d’ébauche', () => {
    expect(deps.map((d) => d.code).sort()).toEqual(DEP_PAGES.map((d) => d.code).sort());
  });
  const allIds = new Set([...ids, ...DEP_PAGES.map((d) => d.id)]);
  for (const d of deps) for (const l of ['fr', 'en'] as const) {
    it(`${d.code} ${l} : 380 mots au moins, liens valides, aucune valeur manquante`, () => {
      const z = DEPS[d.code]; const reg = z.region ? REGS[z.region] : undefined; const links: string[] = [];
      const h: DepHelpers = { lang: l, region: reg?.name ?? '', D: z.p as DepHelpers['D'], R: (reg?.p ?? {}) as DepHelpers['R'], F: FR.p as DepHelpers['F'], rang: () => ({ rank: 1, total: 101 }),
        eur: (x) => (x == null ? 'NUL' : `${x} €`), num: (x) => (x == null ? 'NUL' : String(x)), pct: (x) => (x == null ? 'NUL' : `${x}%`), ecart: (a, b) => (a == null || b == null ? 'NUL' : '+1 %'), a: (id, t) => { links.push(id); return t; } };
      const body = d[l].body(h);
      expect(body).not.toMatch(/STUB/);
      expect(body, 'valeur absente du jeu de données').not.toMatch(/NUL|undefined|NaN/);
      expect(body).not.toMatch(/—|&mdash;/);
      for (const id of links) expect(allIds.has(id), `lien inconnu ${id}`).toBe(true);
      expect(words(body), 'longueur').toBeGreaterThanOrEqual(380);
      const g = depGen(d.code, l);
      for (const f of g.faqs) { const n = words(f.a); expect(n, f.q).toBeGreaterThanOrEqual(40); expect(n, f.q).toBeLessThanOrEqual(90); }
      expect(words(g.resume)).toBeGreaterThanOrEqual(120);
    });
  }
});
