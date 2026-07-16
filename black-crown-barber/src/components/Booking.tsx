"use client";

import { useState, type FormEvent } from "react";
import { business, services } from "@/lib/data";

export default function Booking() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const phone = formData.get("phone");
    const service = formData.get("service");
    const date = formData.get("date");
    const time = formData.get("time");

    const message = [
      `Ciao Black Crown Barber, vorrei prenotare un appuntamento.`,
      `Nome: ${name}`,
      `Telefono: ${phone}`,
      `Servizio: ${service}`,
      `Data preferita: ${date}`,
      `Ora preferita: ${time}`,
    ].join("\n");

    window.open(
      `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
    setSubmitted(true);
  };

  return (
    <section id="prenota" className="bg-cream py-24 text-ink sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-sm bg-ink p-8 text-cream sm:p-10">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-gold">
            Prenota ora
          </p>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl">
            Prenota il tuo appuntamento
          </h2>
          <p className="mt-3 text-sm text-cream/70">
            Compila il modulo: ti risponderemo su WhatsApp per confermare data
            e ora in pochi minuti.
          </p>

          {submitted ? (
            <div className="mt-8 rounded-sm border border-gold/40 bg-gold/10 p-6">
              <p className="font-display text-xl text-gold">Richiesta inviata!</p>
              <p className="mt-2 text-sm text-cream/80">
                Abbiamo aperto WhatsApp con il riepilogo della tua richiesta:
                inviaci il messaggio per confermare l&apos;appuntamento. Ti
                risponderemo il prima possibile.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-5 text-sm font-medium text-gold underline underline-offset-4"
              >
                Compila un&apos;altra richiesta
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label htmlFor="name" className="text-xs uppercase tracking-wide text-cream/60">
                  Nome e cognome
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Mario Rossi"
                  className="mt-2 w-full rounded-sm border border-cream/20 bg-ink-soft px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold"
                />
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="phone" className="text-xs uppercase tracking-wide text-cream/60">
                  Telefono
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="333 1234567"
                  className="mt-2 w-full rounded-sm border border-cream/20 bg-ink-soft px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="service" className="text-xs uppercase tracking-wide text-cream/60">
                  Servizio
                </label>
                <select
                  id="service"
                  name="service"
                  required
                  defaultValue=""
                  className="mt-2 w-full rounded-sm border border-cream/20 bg-ink-soft px-4 py-3 text-sm text-cream outline-none focus:border-gold"
                >
                  <option value="" disabled>
                    Scegli un servizio
                  </option>
                  {services.map((service) => (
                    <option key={service.name} value={service.name}>
                      {service.name} — {service.price}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="date" className="text-xs uppercase tracking-wide text-cream/60">
                  Data preferita
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  className="mt-2 w-full rounded-sm border border-cream/20 bg-ink-soft px-4 py-3 text-sm text-cream outline-none focus:border-gold"
                />
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="time" className="text-xs uppercase tracking-wide text-cream/60">
                  Ora preferita
                </label>
                <input
                  id="time"
                  name="time"
                  type="time"
                  required
                  className="mt-2 w-full rounded-sm border border-cream/20 bg-ink-soft px-4 py-3 text-sm text-cream outline-none focus:border-gold"
                />
              </div>

              <button
                type="submit"
                className="mt-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink transition hover:bg-gold-soft sm:col-span-2"
              >
                Invia richiesta su WhatsApp
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-sm border border-ink/10 bg-white/40 p-8">
            <h3 className="font-display text-xl text-ink">Orari di apertura</h3>
            <dl className="mt-5 space-y-3">
              {business.hours.map((entry) => (
                <div
                  key={entry.day}
                  className="flex items-center justify-between border-b border-ink/10 pb-3 text-sm last:border-0 last:pb-0"
                >
                  <dt className="text-ink/70">{entry.day}</dt>
                  <dd className="font-medium text-ink">{entry.time}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-sm border border-ink/10 bg-white/40 p-8">
            <h3 className="font-display text-xl text-ink">Contatti rapidi</h3>
            <div className="mt-5 flex flex-col gap-3">
              <a
                href={`tel:${business.phoneE164}`}
                className="flex items-center justify-between rounded-sm border border-ink/15 px-4 py-3 text-sm font-medium text-ink transition hover:border-gold hover:text-gold"
              >
                Chiama {business.phoneDisplay}
                <span aria-hidden>→</span>
              </a>
              <a
                href={`https://wa.me/${business.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-sm border border-ink/15 px-4 py-3 text-sm font-medium text-ink transition hover:border-gold hover:text-gold"
              >
                Scrivi su WhatsApp
                <span aria-hidden>→</span>
              </a>
              <a
                href={`mailto:${business.email}`}
                className="flex items-center justify-between rounded-sm border border-ink/15 px-4 py-3 text-sm font-medium text-ink transition hover:border-gold hover:text-gold"
              >
                {business.email}
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
