"use client";

// Calendário de disponibilidade (Fase 2: SÓ UI/UX, dados de demonstração, nenhuma chamada à Beds24).
// Fase 3: o mesmo componente passa a receber `availability` real (ver docs/superpowers/plans/…fase2…, seção "Fase 3").
import { useEffect, useMemo, useState } from "react";
import { GuestControls, useGuests, type GuestRules } from "./guests";

const DAY = 86_400_000;
const idx = (y: number, m: number, d: number) => Math.floor(Date.UTC(y, m, d) / DAY);
const fromIdx = (i: number) => new Date(i * DAY);
const fmtDay = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const fmtLong = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const fmtMonth = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
const isoDay = (i: number) => fromIdx(i).toISOString().slice(0, 10);
const WEEK = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

type Props = {
  slug: string;
  name: string;
  rules: GuestRules;
  /** Dia (índice UTC em dias desde 1970) indisponível. Na Fase 3 vem da Beds24; nos previews, de dados de demonstração. */
  isUnavailable: (day: number) => boolean;
  /** Destino do botão "Reservar estas datas". Sem ele, o botão não navega (previews). */
  bookingHref?: (sel: { checkin: string; nights: number; adults: number; children: number }) => string;
};

export function AvailabilityCalendar({ slug, name, rules, isUnavailable, bookingHref }: Props) {
  const [today, setToday] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const [end, setEnd] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const guests = useGuests(rules);
  const { adults, children } = guests;

  useEffect(() => {
    const n = new Date();
    setToday(idx(n.getFullYear(), n.getMonth(), n.getDate())); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const un = isUnavailable;

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
      <GuestControls guests={guests} hint={rules.hint} />
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
          <a
            className="pd2-link strong"
            href={bookingHref && start !== null ? bookingHref({ checkin: isoDay(start), nights, adults, children }) : "#reservar"}
            {...(bookingHref ? { target: "_blank", rel: "noopener noreferrer" } : { onClick: (e: React.MouseEvent) => e.preventDefault() })}
            data-room={slug}
            data-adults={adults}
            data-children={children}
          >
            Reservar estas datas<span className="sr"> — {name}</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}
