import Image from "next/image";
import SectionHeading from "./SectionHeading";

const stats = [
  { value: "12+", label: "Anni di esperienza" },
  { value: "4.9/5", label: "Valutazione media" },
  { value: "3.000+", label: "Clienti serviti" },
];

export default function About() {
  return (
    <section className="bg-cream py-24 text-ink sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
          <Image
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80"
            alt="Interno del salone Black Crown Barber"
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
          />
        </div>

        <div>
          <SectionHeading
            eyebrow="La nostra storia"
            title="Non è solo un taglio. È un rituale."
            description="Da oltre dodici anni Black Crown Barber unisce tecniche classiche e stile contemporaneo per offrire un'esperienza su misura per ogni cliente. Ogni dettaglio, dagli strumenti agli ambienti, è pensato per farti sentire al centro dell'attenzione."
          />

          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-ink/10 pt-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-3xl text-ink">{stat.value}</dd>
                <p className="mt-1 text-xs uppercase tracking-wide text-ink/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
