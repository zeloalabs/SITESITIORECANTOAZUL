import { describe, it, expect } from "vitest";
import { validateOcupacaoReferencia, validateBeds24RoomId } from "./accommodation";

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
