/** Cartes à choix unique (radiogroup) et puces à choix multiple du diagnostic. */
import { useRef, type KeyboardEvent } from 'react';

export interface Option<V extends string> { value: V; label: string; sub?: string }

export function Cartes<V extends string>({ id, legend, options, value, onChange }: { id: string; legend: string; options: Option<V>[]; value: V | null; onChange: (v: V) => void }) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const idx = value ? options.findIndex((o) => o.value === value) : -1;
  const key = (e: KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + options.length) % options.length;
    onChange(options[n].value); refs.current[n]?.focus();
  };
  return (
    <div className="dg-champ">
      <p id={`${id}-l`} className="dg-champ-label">{legend}</p>
      <div className="dg-choix" role="radiogroup" aria-labelledby={`${id}-l`}>
        {options.map((o, i) => (
          <button key={o.value} ref={(el) => { refs.current[i] = el; }} type="button" role="radio" aria-checked={o.value === value}
            tabIndex={i === (idx < 0 ? 0 : idx) ? 0 : -1} onClick={() => onChange(o.value)} onKeyDown={(e) => key(e, i)}>
            <b>{o.label}</b>{o.sub && <small>{o.sub}</small>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Puces<V extends string>({ legend, options, value, onChange, compte, help }: { legend: string; options: Option<V>[]; value: V[]; onChange: (v: V[]) => void; compte: string; help?: string }) {
  return (
    <fieldset className="dg-champ">
      <legend className="dg-champ-label dg-legend"><span>{legend}</span><output>{compte}</output></legend>
      <div className="dg-puces">
        {options.map((o) => {
          const on = value.includes(o.value);
          return <button key={o.value} type="button" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== o.value) : [...value, o.value])}>{o.label}</button>;
        })}
      </div>
      {help && <p className="dg-aide">{help}</p>}
    </fieldset>
  );
}
