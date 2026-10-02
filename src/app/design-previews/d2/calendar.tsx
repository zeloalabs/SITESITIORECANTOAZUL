"use client";

// Calendário de disponibilidade (Fase 2: SÓ UI/UX, dados de demonstração, nenhuma chamada à Beds24).
// Fase 3: o mesmo componente passa a receber `availability` real (ver docs/superpowers/plans/…fase2…, seção "Fase 3").
import { useEffect, useMemo, useState } from "react";

const DAY = 86_400_000;
const idx = (y: number, m: number, d: number) => Math.floor(Date.UTC(y, m, d) / DAY);
const fromIdx = (i: number) => new Date(i * DAY);
const fmtDay = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const fmtLong = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const fmtMonth = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
const WEEK = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** Dados de demonstração determinísticos por acomodação: blocos de 2–5 noites indisponíveis. Não é disponibilidade real. */
function demoUnavailable(slug: string, day: number): boolean {
  let seed = 0;
  for (const ch of slug) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const block = Math.floor((day + (seed % 5)) / 4);
  const h = (Math.imul(block ^ seed, 2654435761) >>> 0) % 100;
  return h < 34;
}

type Rules = { minAdults: number; maxAdults?: number; maxChildren?: number; maxTotal: number; hint: string };
type Props = { slug: string; name: string; rules: Rules };

export function AvailabilityCalendar({ slug, name, rules }: Props) {
  const [today, setToday] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const [end, setEnd] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [adults, setAdults] = useState(Math.min(2, rules.maxAdults ?? rules.maxTotal));
  const [children, setChildren] = useState(0);
  const [gmsg, setGmsg] = useState("");

  useEffect(() => {
    const n = new Date();
    setToday(idx(n.getFullYear(), n.getMonth(), n.getDate())); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const un = (d: number) => demoUnavailable(slug, d);

  const months = useMemo(() => {
    if (today === null) return [];
    const t = fromIdx(today);
    return [0, 1].map((k) => {
      const y = t.getUTCFullYear();
      const m = t.getUTCMonth() + offset + k;
      const first = new Date(Date.UTC(y, m, 1));
      const total = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      return { first, lead: first.getUTCDay(), days: Array.from({ length: total }, (_, i) => idx(first.getUTCFullYear(), first.getUTCMonth(), i + 1)) };
    });
  }, [today, offset]);

  if (today === null) return <div className="cal-skel" aria-hidden="true" />;

  // as noites [start, d) precisam estar livres; o dia de saída pode ser um dia indisponível (saída pela manhã)
  const nightsFree = (s: number, d: number) => {
    for (let i = s; i < d; i++) if (un(i)) return false;
    return true;
  };
  const selecting = start !== null && end === null;
  const selectable = (d: number) => {
    if (d < today) return false;
    if (!selecting) return !un(d);
    if (d <= (start as number)) return !un(d);
    return nightsFree(start as number, d);
  };

  const pick = (d: number) => {
    setMsg("");
    if (!selectable(d)) {
      if (selecting && d > (start as number) && d >= today && !nightsFree(start as number, d)) setMsg("Há datas indisponíveis nesse período.");
      return;
    }
    if (!selecting || d <= (start as number)) {
      setStart(d);
      setEnd(null);
    } else setEnd(d);
  };

  const clear = () => {
    setStart(null);
    setEnd(null);
    setMsg("");
  };

  const total = adults + children;
  const canAdultUp = adults < (rules.maxAdults ?? rules.maxTotal) && total < rules.maxTotal;
  const canChildUp = children < (rules.maxChildren ?? rules.maxTotal) && total < rules.maxTotal;
  const limitText = rules.hint; // texto exibido, editável no CMS
  const bump = (kind: "a" | "c", d: 1 | -1) => {
    setGmsg("");
    if (kind === "a") {
      if (d === 1 && !canAdultUp) return setGmsg("Limite de hóspedes atingido.");
      if (d === -1 && adults <= rules.minAdults) return setGmsg("É necessário pelo menos 1 adulto.");
      setAdults(adults + d);
    } else {
      if (d === 1 && !canChildUp) return setGmsg("Limite de hóspedes atingido.");
      if (d === -1 && children <= 0) return;
      setChildren(children + d);
    }
  };
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const guestsText = `${plural(adults, "adulto", "adultos")}${children ? `, ${plural(children, "criança", "crianças")}` : ""}`;

  const nights = start !== null && end !== null ? end - start : 0;
  const status =
    msg ||
    (start === null
      ? "Selecione a data de chegada."
      : end === null
        ? `Chegada ${fmtDay.format(fromIdx(start))} · selecione a saída.`
        : `${fmtDay.format(fromIdx(start))} até ${fmtDay.format(fromIdx(end))} · ${nights} ${nights === 1 ? "noite" : "noites"} · ${guestsText}`);

  return (
    <div className="cal" data-slug={slug}>
      <div className="cal-guests" role="group" aria-label="Hóspedes">
        <div className="row">
          <span className="lab" id="g-ad">Adultos</span>
          <div className="step">
            <button type="button" onClick={() => bump("a", -1)} aria-label="Menos um adulto" aria-describedby="g-ad" disabled={adults <= rules.minAdults}>−</button>
            <output aria-live="polite">{adults}</output>
            <button type="button" onClick={() => bump("a", 1)} aria-label="Mais um adulto" aria-describedby="g-ad" disabled={!canAdultUp}>+</button>
          </div>
        </div>
        <div className="row">
          <span className="lab" id="g-ch">Crianças</span>
          <div className="step">
            <button type="button" onClick={() => bump("c", -1)} aria-label="Menos uma criança" aria-describedby="g-ch" disabled={children <= 0}>−</button>
            <output aria-live="polite">{children}</output>
            <button type="button" onClick={() => bump("c", 1)} aria-label="Mais uma criança" aria-describedby="g-ch" disabled={!canChildUp}>+</button>
          </div>
        </div>
        <p className="hint" role="status">{gmsg || limitText}</p>
      </div>
      <div className="cal-nav">
        <button type="button" onClick={() => setOffset((o) => Math.max(0, o - 1))} disabled={offset === 0} aria-label="Mês anterior">←</button>
        <button type="button" onClick={() => setOffset((o) => Math.min(10, o + 1))} disabled={offset >= 10} aria-label="Próximo mês">→</button>
      </div>
      <div className="cal-months">
        {months.map((mo, k) => (
          <div key={k} className={`cal-month ${k === 1 ? "second" : ""}`} role="group" aria-label={fmtMonth.format(mo.first)}>
            <h3>{fmtMonth.format(mo.first)}</h3>
            <div className="cal-week" aria-hidden="true">{WEEK.map((w) => <span key={w}>{w}</span>)}</div>
            <div className="cal-grid">
              {Array.from({ length: mo.lead }, (_, i) => <span key={`l${i}`} />)}
              {mo.days.map((d) => {
                const past = d < today;
                const blocked = !past && un(d);
                const isStart = d === start;
                const isEnd = d === end;
                const inRange = start !== null && end !== null && d > start && d < end;
                const ok = selectable(d);
                const cls = ["cal-day", past && "is-past", blocked && "is-un", d === today && "is-today", isStart && "is-start", isEnd && "is-end", inRange && "is-in", start !== null && end !== null && isStart && "has-band", ok && "is-ok"].filter(Boolean).join(" ");
                const state = past ? "data passada" : isStart ? "chegada" : isEnd ? "saída" : blocked ? (ok ? "Indisponível, saída possível" : "Indisponível") : "Disponível";
                return (
                  <button
                    key={d}
                    type="button"
                    className={cls}
                    onClick={() => pick(d)}
                    aria-disabled={!ok}
                    aria-pressed={isStart || isEnd}
                    aria-label={`${fmtLong.format(fromIdx(d))}${d === today ? ", hoje" : ""}, ${state}`}
                  >
                    {fromIdx(d).getUTCDate()}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <ul className="cal-legend" aria-label="Legenda">
        <li><i className="k k-ok">12</i>Disponível</li>
        <li><i className="k k-un">12</i>Indisponível</li>
        <li><i className="k k-today">12</i>Hoje</li>
        <li><i className="k k-sel">12</i>Selecionado</li>
      </ul>

      <div className="cal-bar">
        <p role="status" aria-live="polite" className={msg ? "warn" : ""}>{status}</p>
        {start !== null ? <button type="button" className="cal-clear" onClick={clear}>Limpar</button> : null}
        {end !== null ? (
          <a className="pd2-link strong" href="#reservar" onClick={(e) => e.preventDefault()} data-room={slug} data-adults={adults} data-children={children}>
            Reservar estas datas<span className="sr"> — {name}</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}
