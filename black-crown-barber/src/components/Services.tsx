import SectionHeading from "./SectionHeading";
import { services } from "@/lib/data";

export default function Services() {
  return (
    <section id="servizi" className="bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Servizi"
          title="Il taglio giusto per ogni occasione"
          description="Ogni trattamento è eseguito con prodotti selezionati e strumenti professionali, per un risultato impeccabile e duraturo."
          light
        />

        <div className="mt-14 grid gap-px overflow-hidden rounded-sm bg-cream/10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="group flex flex-col justify-between bg-ink p-8 transition-colors hover:bg-ink-soft"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-xl text-cream">
                    {service.name}
                  </h3>
                  <span className="whitespace-nowrap font-display text-xl text-gold">
                    {service.price}
                  </span>
                </div>
                <p className="mt-3 text-sm text-cream/70">
                  {service.description}
                </p>
              </div>
              <p className="mt-6 text-xs uppercase tracking-wide text-cream/45">
                Durata: {service.duration}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="#prenota"
            className="inline-flex rounded-full bg-gold px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink transition hover:bg-gold-soft"
          >
            Prenota ora
          </a>
        </div>
      </div>
    </section>
  );
}
