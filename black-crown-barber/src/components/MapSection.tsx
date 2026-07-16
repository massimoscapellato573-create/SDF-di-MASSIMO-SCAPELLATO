import SectionHeading from "./SectionHeading";
import { business } from "@/lib/data";

export default function MapSection() {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    business.mapsQuery
  )}&z=15&output=embed`;

  return (
    <section id="dove-siamo" className="bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Dove siamo"
          title="Vieni a trovarci"
          description="Nel cuore di Catania, a due passi dal centro. Parcheggio disponibile nelle vicinanze."
          light
        />

        <div className="mt-14 grid gap-6 overflow-hidden rounded-sm border border-cream/10 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col justify-center gap-6 bg-ink-soft p-8 sm:p-10">
            <div>
              <p className="text-xs uppercase tracking-wide text-cream/50">Indirizzo</p>
              <p className="mt-2 text-lg text-cream">
                {business.addressStreet}
                <br />
                {business.addressPostalCode} {business.addressLocality}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-cream/50">Telefono</p>
              <a
                href={`tel:${business.phoneE164}`}
                className="mt-2 block text-lg text-cream transition hover:text-gold"
              >
                {business.phoneDisplay}
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-cream/50">Email</p>
              <a
                href={`mailto:${business.email}`}
                className="mt-2 block text-lg text-cream transition hover:text-gold"
              >
                {business.email}
              </a>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                business.mapsQuery
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 text-sm font-medium text-gold transition hover:bg-gold hover:text-ink"
            >
              Apri in Google Maps
            </a>
          </div>

          <div className="h-80 w-full lg:h-auto">
            <iframe
              title={`Mappa: ${business.name}`}
              src={mapSrc}
              className="h-full w-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
