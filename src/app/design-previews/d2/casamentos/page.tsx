import { PH, waContacts } from "../../content";
import { Photo } from "@/components/site/fx";
import { Shell } from "../parts";
import { WhatsApp } from "@/components/site/whatsapp";

export default async function CasamentosPage({ searchParams }: { searchParams: Promise<{ fonts?: string }> }) {
  const { fonts } = await searchParams;
  return (
    <Shell fonts={fonts} direct="casamentos">
      <header className="pd2-pagehead">
        <h1>Casamentos no sítio</h1>
        <p>Fale com a gente sobre o seu casamento.</p>
        <div className="cta"><WhatsApp groups={waContacts} label="Falar pelo WhatsApp" direct="casamentos" /></div>
      </header>
      <div className="pd2-light">
        <section className="pd2-todo wide" aria-label="Sobre casamentos no sítio">
          <Photo className="ph" src={PH("grupos-vista")} alt="Vista do sítio ao entardecer, a partir da varanda do Chalé para Grupos" focus="50% 55%" />
          <div>
            <h2>O sítio para o seu casamento</h2>
            <p>Texto, fotos de casamentos e o que o sítio oferece serão fornecidos pela proprietária. A foto acima é apenas ilustrativa do local.</p>
          </div>
        </section>
      </div>
    </Shell>
  );
}
