import { describe, expect, it } from "vitest";
import { normalizeWhatsappNumber, pickContact, whatsappUrl } from "./whatsapp";

const c = (key: string, number: string | null, message = "Olá!") => ({ key, label: key, number, message });

describe("whatsappUrl", () => {
  it("monta o link com a mensagem codificada", () => {
    expect(whatsappUrl(c("a", "5548999999999", "Olá! Quero reservar."))).toBe("https://wa.me/5548999999999?text=Ol%C3%A1!%20Quero%20reservar.");
  });
  it("substitui {acomodacao}", () => {
    const url = whatsappUrl(c("a", "5548999999999", "Interesse no {acomodacao}"), { acomodacao: "Domo Estelar" })!;
    expect(decodeURIComponent(url)).toContain("Interesse no Domo Estelar");
  });
  it("acrescenta texto extra (ex.: datas)", () => {
    expect(decodeURIComponent(whatsappUrl(c("a", "5548999999999", "Oi"), { extra: "De 10 a 12/12." })!)).toContain("Oi De 10 a 12/12.");
  });
  it("sem número ou número inválido não gera link", () => {
    expect(whatsappUrl(c("a", null))).toBeNull();
    expect(whatsappUrl(c("a", "123"))).toBeNull();
    expect(whatsappUrl(undefined)).toBeNull();
  });
  it("sem mensagem abre só a conversa", () => {
    expect(whatsappUrl(c("a", "5548999999999", ""))).toBe("https://wa.me/5548999999999");
  });
});

describe("pickContact", () => {
  const list = [c("romanticas", null), c("grupos", "5548999999999")];
  it("usa a primeira chave existente", () => {
    expect(pickContact(list, [null, "grupos", "romanticas"])?.key).toBe("grupos");
  });
  it("devolve undefined se nada casa", () => {
    expect(pickContact(list, ["x"])).toBeUndefined();
  });
});

describe("normalizeWhatsappNumber", () => {
  it("acrescenta 55 a número nacional (DDD + número)", () => {
    expect(normalizeWhatsappNumber("48988445797")).toBe("5548988445797");
    expect(normalizeWhatsappNumber("(48) 98844-5797")).toBe("5548988445797");
  });
  it("não duplica o código do país", () => {
    expect(normalizeWhatsappNumber("5548988445797")).toBe("5548988445797");
    expect(normalizeWhatsappNumber("+55 48 98844-5797")).toBe("5548988445797");
  });
  it("aceita fixo (10 dígitos) e rejeita o que não é número brasileiro plausível", () => {
    expect(normalizeWhatsappNumber("4833334444")).toBe("554833334444");
    expect(normalizeWhatsappNumber("123")).toBeNull();
    expect(normalizeWhatsappNumber("")).toBeNull();
    expect(normalizeWhatsappNumber(null)).toBeNull();
    expect(normalizeWhatsappNumber("14155550123")).toBe("5514155550123"); // 11 dígitos = DDD 14 + celular; não é detectável como estrangeiro
  });
});
