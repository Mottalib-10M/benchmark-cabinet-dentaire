/**
 * Tuile à compteur − / + (aucun curseur : décision de l'éditeur). Le chiffre et son unité ont la même
 * taille ; maintenir un bouton fait défiler ; le chiffre se tape au clavier (texte brut pendant la
 * frappe, mis en forme en quittant le champ, flèches haut et bas) ; une barre de raccourcis donne les
 * valeurs courantes. Règles de saisie de la trame (RECETTE §17.1, §17.2) : le texte tapé est la source
 * de vérité, le plafond s'applique au nombre et se signale, le contenu est sélectionné au focus.
 */
import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent } from 'react';
import { formatNumber, parseLocaleNumber } from '../../../lib/format';

export interface CompteurProps {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  /** Unité au singulier et au pluriel (identiques pour « € » ou « h »). */
  unit: [string, string];
  /** Montant : séparateur de milliers, pas de décimale. */
  money?: boolean;
  raccourcis?: number[];
  help?: string;
  large?: boolean;
  lang: 'fr' | 'en';
  labels: { moins: string; plus: string; max: string };
}

const arrondi = (n: number, step: number) => Math.round(Math.round(n / step) * step * 100) / 100;

export default function Compteur({ id, label, value, onChange, min, max, step, unit, money = false, raccourcis, help, large = false, lang, labels }: CompteurProps) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState('');
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const selectPending = useRef(false);
  const guardMouseUp = useRef(false);
  const fromPointer = useRef(false);
  const timers = useRef<{ t1?: ReturnType<typeof setTimeout>; t2?: ReturnType<typeof setInterval> }>({});
  const live = useRef(value);
  live.current = value;
  useLayoutEffect(() => { if (selectPending.current) { selectPending.current = false; input.current?.select(); } });
  useEffect(() => () => { clearTimeout(timers.current.t1); clearInterval(timers.current.t2); }, []);

  const decimals = money ? 0 : step < 1 ? 1 : 0;
  const fmt = (n: number) => formatNumber(n, Number.isInteger(n) ? 0 : decimals, lang);
  const display = focused ? raw : fmt(value);
  // Accord de l'unité : « 1,5 jour » mais « 2 jours » en français ; « 1 day », « 1.5 days » en anglais.
  const pluriel = lang === 'fr' ? value >= 2 : value !== 1;
  const u = pluriel ? unit[1] : unit[0];

  const regler = (n: number) => { const v = Math.min(max, Math.max(min, arrondi(n, step))); setOver(false); onChange(v); };
  const pas = (d: number) => regler(live.current + d * step);
  const stop = () => { clearTimeout(timers.current.t1); clearInterval(timers.current.t2); };
  const bouton = (d: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault(); fromPointer.current = true; pas(d);
      stop(); timers.current.t1 = setTimeout(() => { timers.current.t2 = setInterval(() => pas(d), 70); }, 380);
    },
    onPointerUp: stop, onPointerLeave: stop, onPointerCancel: stop,
    // Clavier (Entrée, Espace) : le clic arrive seul ; après un appui pointeur, il est ignoré.
    onClick: () => { if (fromPointer.current) { fromPointer.current = false; return; } pas(d); },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.value.replace(/[^0-9.,\s  -]/g, '');
    setRaw(f);
    const n = parseLocaleNumber(f);
    setOver(n > max);
    onChange(Math.min(n, max));
  };
  const handleBlur = () => {
    guardMouseUp.current = false; setFocused(false);
    if (value < min) onChange(min);
    if (value > max) onChange(max);
  };
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const v = Math.min(max, Math.max(min, arrondi(value + (e.key === 'ArrowUp' ? 1 : -1) * step, step)));
    onChange(v); setRaw(String(v).replace('.', lang === 'fr' ? ',' : '.')); setOver(false);
  };

  return (
    <div className={`dg-tuile${large ? ' dg-large' : ''}`}>
      <label htmlFor={id} className="dg-tuile-label">{label}</label>
      <div className="dg-compteur">
        <button type="button" className="dg-rond" aria-label={`${labels.moins} : ${label}`} aria-controls={id} disabled={value <= min} {...bouton(-1)}>−</button>
        <div className="dg-val">
          <input ref={input} id={id} type="text" inputMode="decimal" autoComplete="off" value={display}
            onMouseUp={(e) => { if (guardMouseUp.current) { guardMouseUp.current = false; e.preventDefault(); } }}
            onChange={handleChange}
            onFocus={() => { setRaw(fmt(value).replace(/[\s  ]/g, '')); setFocused(true); selectPending.current = true; guardMouseUp.current = true; }}
            onBlur={handleBlur} onKeyDown={handleKey}
            aria-describedby={help || over ? `${id}-help` : undefined}
            style={{ width: `${Math.max(2, display.length + 0.5)}ch` }} />
          <span aria-hidden="true">{u}</span>
        </div>
        <button type="button" className="dg-rond" aria-label={`${labels.plus} : ${label}`} aria-controls={id} disabled={value >= max} {...bouton(1)}>+</button>
      </div>
      {raccourcis && (
        <div className="dg-raccourcis" role="group" aria-label={label}>
          {raccourcis.map((r) => (
            <button key={r} type="button" aria-pressed={value === r} className={value === r ? 'dg-actif' : ''} onClick={() => { setOver(false); onChange(r); }}>{fmt(r)}</button>
          ))}
        </div>
      )}
      {over
        ? <p id={`${id}-help`} role="status" className="dg-aide dg-alerte">{labels.max} {fmt(max)} {unit[1]}</p>
        : help && <p id={`${id}-help`} className="dg-aide">{help}</p>}
    </div>
  );
}
