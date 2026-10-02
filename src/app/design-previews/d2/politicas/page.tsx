import { Shell } from "../parts";

const sections = [
  { id: "privacidade", title: "Política de privacidade" },
  { id: "hospedagem", title: "Política de hospedagem" },
  { id: "pagamento", title: "Formas de pagamento" },
];

export default async function PoliticasPage({ searchParams }: { searchParams: Promise<{ fonts?: string }> }) {
  const { fonts } = await searchParams;
  return (
    <Shell fonts={fonts}>
      <header className="pd2-pagehead">
        <h1>Políticas</h1>
        <p>Privacidade, hospedagem e formas de pagamento.</p>
      </header>
      <div className="pd2-light">
        <div className="pd2-policies">
          <nav aria-label="Nesta página">
            <ul>{sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}</ul>
          </nav>
          <div className="docs">
            {sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-t`}>
                <h2 id={`${s.id}-t`}>{s.title}</h2>
                <p className="todo">Texto provisório. O conteúdo oficial desta política será fornecido pela proprietária e editado no Studio.</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
