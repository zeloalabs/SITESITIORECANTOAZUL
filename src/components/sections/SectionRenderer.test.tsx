import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionRenderer } from "./SectionRenderer";
import type { Section } from "@/lib/content/types";

describe("SectionRenderer", () => {
  it("renders sections in the given order", () => {
    const sections: Section[] = [
      { _type: "textoEditorial", _key: "b", title: "Segundo" },
      { _type: "hero", _key: "a", title: "Primeiro" },
    ];
    render(<SectionRenderer sections={sections} />);
    const headings = screen.getAllByRole("heading").map((h) => h.textContent);
    expect(headings).toEqual(["Segundo", "Primeiro"]);
  });

  it("skips unknown section types without crashing", () => {
    const sections = [
      { _type: "desconhecida", _key: "x" },
      { _type: "hero", _key: "a", title: "Ok" },
    ] as unknown as Section[];
    render(<SectionRenderer sections={sections} />);
    expect(screen.getByRole("heading", { name: "Ok" })).toBeInTheDocument();
  });

  it("renders nothing for null sections", () => {
    const { container } = render(<SectionRenderer sections={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
