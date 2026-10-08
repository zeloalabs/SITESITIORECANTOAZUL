import { getReviews } from "@/lib/content/data";
import type { DepoimentoSection, Review } from "@/lib/content/types";

export const pickReview = (reviews: Review[], id?: string) => reviews.find((r) => r.id === id) ?? reviews[0];

export async function Depoimento({ section }: { section: DepoimentoSection }) {
  const review = pickReview(await getReviews(), section.reviewId);
  if (!review) return null;
  const meta = [review.author, review.source, review.when].filter(Boolean).join(", ");
  return (
    <section className="pd2-voice" aria-label="Avaliação de hóspede">
      <div>
        <q>{review.quote}</q>
        <p>{meta}</p>
      </div>
    </section>
  );
}
