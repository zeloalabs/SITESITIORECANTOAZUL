import { hero } from "./hero";
import { textoEditorial } from "./textoEditorial";
import { cabecalhoPagina } from "./cabecalhoPagina";
import { intro } from "./intro";
import { acomodacoes } from "./acomodacoes";
import { blocosDestaque } from "./blocosDestaque";
import { fotoCheia } from "./fotoCheia";
import { experienciasBloco } from "./experienciasBloco";
import { extrasLista } from "./extrasLista";
import { politicasLista } from "./politicasLista";
import { faqLista } from "./faqLista";
import { textoComFoto } from "./textoComFoto";
import { localizacao } from "./localizacao";
import { depoimento } from "./depoimento";
import { chamadaFinal } from "./chamadaFinal";
import { contatoBloco } from "./contatoBloco";

export const sectionTypes = [hero, textoEditorial, cabecalhoPagina, intro, acomodacoes, blocosDestaque, fotoCheia, experienciasBloco, extrasLista, politicasLista, faqLista, textoComFoto, localizacao, depoimento, chamadaFinal, contatoBloco];
/** Nomes na ordem em que aparecem no seletor de seções da página. */
export const sectionNames = sectionTypes.map((t) => t.name);
