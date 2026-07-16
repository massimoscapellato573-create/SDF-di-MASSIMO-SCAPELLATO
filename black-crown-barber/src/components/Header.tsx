"use client";

import { useEffect, useState } from "react";
import { business } from "@/lib/data";

const links = [
  { href: "#servizi", label: "Servizi" },
  { href: "#galleria", label: "Galleria" },
  { href: "#recensioni", label: "Recensioni" },
  { href: "#dove-siamo", label: "Dove siamo" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "bg-ink/95 backdrop-blur-sm border-b border-cream/10 py-3"
          : "bg-gradient-to-b from-ink/70 to-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
        <a
          href="#top"
          className="font-display text-xl tracking-wide text-cream"
          onClick={() => setOpen(false)}
        >
          Black<span className="text-gold"> Crown</span> Barber
        </a>

        <nav className="hidden items-center gap-9 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative text-sm font-medium text-cream/85 transition hover:text-cream"
            >
              {link.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <a
            href="#prenota"
            className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-gold-soft"
          >
            Prenota ora
          </a>
        </nav>

        <button
          type="button"
          aria-label={open ? "Chiudi menu" : "Apri menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-1.5 md:hidden"
        >
          <span
            className={`h-px w-6 bg-cream transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`h-px w-6 bg-cream transition-opacity ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`h-px w-6 bg-cream transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {open && (
        <div className="mx-auto flex max-w-6xl flex-col gap-1 border-t border-cream/10 px-6 py-6 md:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-cream/5 py-3 text-base text-cream/90"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#prenota"
            onClick={() => setOpen(false)}
            className="mt-4 rounded-full bg-gold px-5 py-3 text-center text-sm font-semibold text-ink"
          >
            Prenota ora
          </a>
          <a
            href={`tel:${business.phoneE164}`}
            className="mt-3 text-center text-sm text-cream/70"
          >
            {business.phoneDisplay}
          </a>
        </div>
      )}
    </header>
  );
}
