import { getPolicies } from "@/lib/content/data";

export async function PoliticasLista() {
  const policies = await getPolicies();
  return (
    <div className="pd2-light">
      <div className="pd2-policies">
        <nav aria-label="Nesta página">
          <ul>{policies.map((p) => <li key={p.id}><a href={`#${p.anchor}`}>{p.title}</a></li>)}</ul>
        </nav>
        <div className="docs">
          {policies.map((p) => (
            <section key={p.id} id={p.anchor} aria-labelledby={`${p.anchor}-t`}>
              <h2 id={`${p.anchor}-t`}>{p.title}</h2>
              {p.paragraphs.map((t, i) => <p key={i}>{t}</p>)}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
