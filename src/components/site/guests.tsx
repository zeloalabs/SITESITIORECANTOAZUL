"use client";

// Seletor de hóspedes (adultos/crianças) compartilhado pelo calendário e pela página de acomodação.
// As regras (limites e texto) vêm da acomodação no CMS; sempre pelo menos 1 adulto.
import { useState } from "react";

export type GuestRules = { minAdults: number; maxAdults?: number; maxChildren?: number; maxTotal: number; hint: string };

export function useGuests(rules: GuestRules) {
  const [adults, setAdults] = useState(Math.min(Math.max(2, rules.minAdults), rules.maxAdults ?? rules.maxTotal));
  const [children, setChildren] = useState(0);
  const [gmsg, setGmsg] = useState("");
  const total = adults + children;
  const canAdultUp = adults < (rules.maxAdults ?? rules.maxTotal) && total < rules.maxTotal;
  const canChildUp = children < (rules.maxChildren ?? rules.maxTotal) && total < rules.maxTotal;
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
  return { adults, children, gmsg, canAdultUp, canChildUp, bump, rules };
}

export type Guests = ReturnType<typeof useGuests>;

export function GuestControls({ guests: g, hint }: { guests: Guests; hint: string }) {
  const { adults, children, rules } = g;
  return (
    <div className="cal-guests" role="group" aria-label="Hóspedes">
      <div className="row">
        <span className="lab" id="g-ad">Adultos</span>
        <div className="step">
          <button type="button" onClick={() => g.bump("a", -1)} aria-label="Menos um adulto" aria-describedby="g-ad" disabled={adults <= rules.minAdults}>−</button>
          <output aria-live="polite">{adults}</output>
          <button type="button" onClick={() => g.bump("a", 1)} aria-label="Mais um adulto" aria-describedby="g-ad" disabled={!g.canAdultUp}>+</button>
        </div>
      </div>
      <div className="row">
        <span className="lab" id="g-ch">Crianças</span>
        <div className="step">
          <button type="button" onClick={() => g.bump("c", -1)} aria-label="Menos uma criança" aria-describedby="g-ch" disabled={children <= 0}>−</button>
          <output aria-live="polite">{children}</output>
          <button type="button" onClick={() => g.bump("c", 1)} aria-label="Mais uma criança" aria-describedby="g-ch" disabled={!g.canChildUp}>+</button>
        </div>
      </div>
      <p className="hint" role="status">{g.gmsg || hint}</p>
    </div>
  );
}
