import { business } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="border-t border-cream/10 bg-ink pb-28 pt-16 text-cream sm:pb-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-xl">
              Black<span className="text-gold"> Crown</span> Barber
            </p>
            <p className="mt-3 max-w-xs text-sm text-cream/60">
              {business.claim}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-cream/50">Contatti</p>
            <ul className="mt-3 space-y-2 text-sm text-cream/75">
              <li>{business.addressStreet}, {business.addressLocality}</li>
              <li>
                <a href={`tel:${business.phoneE164}`} className="hover:text-gold">
                  {business.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${business.email}`} className="hover:text-gold">
                  {business.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-cream/50">Seguici</p>
            <ul className="mt-3 space-y-2 text-sm text-cream/75">
              <li>
                <a
                  href={business.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={business.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-cream/10 pt-6 text-xs text-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {business.name}. Tutti i diritti riservati.</p>
          <p>Sito demo — progettato per mostrare cosa possiamo realizzare per la tua attività.</p>
        </div>
      </div>
    </footer>
  );
}
