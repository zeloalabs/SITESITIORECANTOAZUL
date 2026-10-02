import { experiences, PH } from "../../content";
import { Photo } from "../../fx";
import { Shell } from "../parts";

export default async function ExperienciasPage({ searchParams }: { searchParams: Promise<{ fonts?: string }> }) {
  const { fonts } = await searchParams;
  return (
    <Shell fonts={fonts}>
      <header className="pd2-pagehead">
        <h1>Experiências</h1>
        <p>Viva o Recanto Azul além da hospedagem.</p>
      </header>
      <div className="pd2-light">
        <section className="pd2-exp" aria-label="Experiências no sítio">
          <div className="pd2-exp-text">
            <ul>
              {experiences.map((e) => (
                <li key={e.name}><b>{e.name}</b><span>{e.text}</span></li>
              ))}
            </ul>
          </div>
          <div className="pd2-exp-col">
            <Photo className="a" src={PH("exp-cavalo")} alt="Casal a cavalo com o vale ao fundo" focus="50% 45%" />
            <Photo className="b" src={PH("exp-cavalo-por-do-sol")} alt="Cavalos ao pôr do sol no campo" focus="50% 55%" />
            <Photo className="c" src={PH("exp-balanco")} alt="Balanços sobre o morro, com o vale ao fundo" focus="0% 40%" />
          </div>
        </section>
        <section className="pd2-todo" aria-labelledby="tur-t">
          <h2 id="tur-t">Turismo na região</h2>
          <p>Seção para atrativos e passeios nos arredores. Conteúdo a ser preenchido pela proprietária.</p>
        </section>
      </div>
    </Shell>
  );
}
