import { describe, it, expect } from "vitest";
import { validateOcupacaoReferencia, validateBeds24RoomId, validateGuestRules } from "./accommodation";
import { validateWhatsappNumber } from "./whatsappContact";
import { validateHref } from "./fields";
import { sectionNames } from "./sections";
import { schemaTypes } from "./index";

describe("accommodation field rules", () => {
  it("accepts reference occupancy from 1 to 20", () => {
    expect(validateOcupacaoReferencia(1)).toBe(true);
    expect(validateOcupacaoReferencia(20)).toBe(true);
  });

  it("rejects reference occupancy outside 1..20 or fractional", () => {
    expect(validateOcupacaoReferencia(0)).not.toBe(true);
    expect(validateOcupacaoReferencia(21)).not.toBe(true);
    expect(validateOcupacaoReferencia(2.5)).not.toBe(true);
  });

  it("accepts a missing Beds24 room id (site shows 'Consultar disponibilidade')", () => {
    expect(validateBeds24RoomId(undefined)).toBe(true);
  });

  it("rejects non-positive or fractional Beds24 room ids", () => {
    expect(validateBeds24RoomId(0)).not.toBe(true);
    expect(validateBeds24RoomId(12.3)).not.toBe(true);
    expect(validateBeds24RoomId(123456)).toBe(true);
  });
});

describe("guest rules", () => {
  it("aceita as regras das românticas, do Celeiro e do Chalé para Grupos", () => {
    expect(validateGuestRules({ minAdults: 1, maxAdults: 2, maxChildren: 2, maxGuests: 4 })).toBe(true);
    expect(validateGuestRules({ minAdults: 1, maxGuests: 11 })).toBe(true);
    expect(validateGuestRules({ minAdults: 1, maxGuests: 20 })).toBe(true);
  });
  it("exige máximo de hóspedes e pelo menos 1 adulto", () => {
    expect(validateGuestRules({ minAdults: 1 })).not.toBe(true);
    expect(validateGuestRules({ minAdults: 0, maxGuests: 4 })).not.toBe(true);
  });
  it("rejeita máximos incoerentes", () => {
    expect(validateGuestRules({ minAdults: 3, maxAdults: 2, maxGuests: 4 })).not.toBe(true);
    expect(validateGuestRules({ minAdults: 1, maxAdults: 5, maxGuests: 4 })).not.toBe(true);
    expect(validateGuestRules({ minAdults: 1, maxGuests: 2.5 })).not.toBe(true);
  });
});

describe("whatsapp number", () => {
  it("aceita 12–13 dígitos ou herança de outro contato", () => {
    expect(validateWhatsappNumber("5548999999999", false)).toBe(true);
    expect(validateWhatsappNumber(undefined, true)).toBe(true);
  });
  it("rejeita número ausente sem herança ou fora do formato", () => {
    expect(validateWhatsappNumber(undefined, false)).not.toBe(true);
    expect(validateWhatsappNumber("(48) 99999-9999", false)).not.toBe(true);
  });
});

describe("validateHref", () => {
  it("aceita caminho interno e https", () => {
    expect(validateHref("/extras")).toBe(true);
    expect(validateHref("https://exemplo.com")).toBe(true);
    expect(validateHref(undefined)).toBe(true);
  });
  it("rejeita protocolo relativo, http e javascript:", () => {
    expect(validateHref("//evil.com")).not.toBe(true);
    expect(validateHref("http://x.com")).not.toBe(true);
    expect(validateHref("javascript:alert(1)")).not.toBe(true);
  });
});

describe("schema registry", () => {
  it("registra todos os tipos de documento e seção sem nomes repetidos", () => {
    const names = schemaTypes.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
    for (const n of ["accommodationGroup", "extra", "experience", "faq", "review", "policy", "whatsappContact", "siteSettings", "page"]) {
      expect(names).toContain(n);
    }
  });
  it("a página aceita todas as seções", () => {
    expect(sectionNames).toContain("hero");
    expect(sectionNames).toContain("acomodacoes");
    expect(sectionNames.length).toBe(16);
  });
});
