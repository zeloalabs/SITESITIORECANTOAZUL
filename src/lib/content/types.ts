export type SanityImage = { asset?: { _ref: string }; alt?: string; hotspot?: { x: number; y: number } };

export type HeroSection = {
  _type: "hero";
  _key: string;
  eyebrow?: string;
  title: string;
  text?: string;
  image?: SanityImage;
  showSearch?: boolean;
};

export type TextoEditorialSection = {
  _type: "textoEditorial";
  _key: string;
  eyebrow?: string;
  title?: string;
  body?: unknown[];
};

export type Section = HeroSection | TextoEditorialSection;

export type PageDoc = {
  _id: string;
  title: string;
  slug: string;
  sections: Section[] | null;
  seoTitle?: string;
  seoDescription?: string;
};
