import { getFaqs } from "@/lib/content/data";
import type { Faq } from "@/lib/content/types";

/** JSON-LD seguro para <script>: escapa "<" para que o texto do CMS não feche a tag. */
export function faqJsonLd(faqs: Faq[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  }).replace(/</g, "\\u003c");
}

export async function FaqLista() {
  const faqs = await getFaqs();
  return (
    <div className="pd2-light">
      <section className="pd2-faq" aria-label="Perguntas frequentes">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd(faqs) }} />
        {faqs.map((f) => (
          <details key={f.id}>
            <summary>{f.question}</summary>
            <p>{f.answer}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
