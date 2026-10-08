import type { Section } from "@/lib/content/types";
import { Acomodacoes } from "./Acomodacoes";
import { BlocosDestaque } from "./BlocosDestaque";
import { CabecalhoPagina } from "./CabecalhoPagina";
import { ChamadaFinal } from "./ChamadaFinal";
import { ContatoBloco } from "./ContatoBloco";
import { Depoimento } from "./Depoimento";
import { ExperienciasBloco } from "./ExperienciasBloco";
import { ExtrasLista } from "./ExtrasLista";
import { FaqLista } from "./FaqLista";
import { FotoCheia } from "./FotoCheia";
import { Hero } from "./Hero";
import { Intro } from "./Intro";
import { Localizacao } from "./Localizacao";
import { PoliticasLista } from "./PoliticasLista";
import { TextoComFoto } from "./TextoComFoto";
import { TextoEditorial } from "./TextoEditorial";

/** Página = lista ordenada de seções do CMS. Tipo desconhecido é ignorado (nunca derruba a página). */
export function SectionRenderer({ sections }: { sections: Section[] | null }) {
  if (!sections?.length) return null;
  return (
    <>
      {sections.map((section) => {
        switch (section._type) {
          case "hero": return <Hero key={section._key} section={section} />;
          case "textoEditorial": return <TextoEditorial key={section._key} section={section} />;
          case "cabecalhoPagina": return <CabecalhoPagina key={section._key} section={section} />;
          case "intro": return <Intro key={section._key} section={section} />;
          case "acomodacoes": return <Acomodacoes key={section._key} section={section} />;
          case "blocosDestaque": return <BlocosDestaque key={section._key} section={section} />;
          case "fotoCheia": return <FotoCheia key={section._key} section={section} />;
          case "experienciasBloco": return <ExperienciasBloco key={section._key} section={section} />;
          case "extrasLista": return <ExtrasLista key={section._key} section={section} />;
          case "politicasLista": return <PoliticasLista key={section._key} />;
          case "faqLista": return <FaqLista key={section._key} />;
          case "textoComFoto": return <TextoComFoto key={section._key} section={section} />;
          case "localizacao": return <Localizacao key={section._key} section={section} />;
          case "depoimento": return <Depoimento key={section._key} section={section} />;
          case "chamadaFinal": return <ChamadaFinal key={section._key} section={section} />;
          case "contatoBloco": return <ContatoBloco key={section._key} section={section} />;
          default: return null;
        }
      })}
    </>
  );
}
