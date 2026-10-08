import { describe, expect, it } from "vitest";
import { pickContact, whatsappUrl } from "./whatsapp";

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
