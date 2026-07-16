import Image from "next/image";

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink">
      <Image
        src="https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=1920&q=80"
        alt="Poltrona da barbiere vintage in un salone dai toni scuri"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-ink/60" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24 pt-40 sm:pb-32">
        <p className="animate-fade-up mb-5 text-xs font-medium uppercase tracking-[0.35em] text-gold">
          Barbiere premium · Catania
        </p>
        <h1 className="animate-fade-up text-balance font-display text-5xl leading-[1.05] text-cream sm:text-6xl md:text-7xl">
          L&apos;arte del taglio,
          <br />
          l&apos;eleganza del <span className="text-gold">dettaglio</span>.
        </h1>
        <p className="animate-fade-up mt-6 max-w-xl text-balance text-base text-cream/80 sm:text-lg">
          Taglio, barba e rasatura a mano libera in un ambiente curato nei minimi
          dettagli. Prenota il tuo posto in pochi secondi, senza attese.
        </p>
        <div className="animate-fade-up mt-9 flex flex-wrap items-center gap-4">
          <a
            href="#prenota"
            className="rounded-full bg-gold px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink transition hover:bg-gold-soft"
          >
            Prenota ora
          </a>
          <a
            href="#servizi"
            className="rounded-full border border-cream/30 px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-cream transition hover:border-gold hover:text-gold"
          >
            Scopri i servizi
          </a>
        </div>
      </div>
    </section>
  );
}
