import SectionHeading from "./SectionHeading";
import { reviews } from "@/lib/data";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 text-gold" aria-label={`Valutazione ${rating} su 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="h-4 w-4"
          fill={i < rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.2}
        >
          <path d="M10 1.5l2.6 5.4 5.9.7-4.3 4.1 1.1 5.9L10 14.8l-5.3 2.8 1.1-5.9L1.5 7.6l5.9-.7L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section id="recensioni" className="bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Recensioni"
          title="La parola ai nostri clienti"
          description="La qualità del nostro lavoro si vede dai risultati, ma si racconta meglio con le parole di chi si è seduto sulla nostra poltrona."
          light
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {reviews.map((review) => (
            <figure
              key={review.name}
              className="flex flex-col gap-4 rounded-sm border border-cream/10 bg-ink-soft p-7"
            >
              <Stars rating={review.rating} />
              <blockquote className="text-cream/85">
                &ldquo;{review.text}&rdquo;
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3 pt-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 font-display text-sm text-gold">
                  {review.initials}
                </span>
                <span className="text-sm font-medium text-cream">
                  {review.name}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
