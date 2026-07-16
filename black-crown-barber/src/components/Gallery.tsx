"use client";

import { useState } from "react";
import Image from "next/image";
import { galleryImages } from "@/lib/data";
import SectionHeading from "./SectionHeading";

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = () => setActiveIndex(null);
  const show = (delta: number) =>
    setActiveIndex((current) => {
      if (current === null) return current;
      const next = (current + delta + galleryImages.length) % galleryImages.length;
      return next;
    });

  return (
    <section id="galleria" className="bg-cream py-24 text-ink sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Galleria"
          title="Lo stile parla da sé"
          description="Uno sguardo al nostro salone, ai dettagli del mestiere e ai risultati che ci rendono orgogliosi."
        />

        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
          {galleryImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`group relative overflow-hidden rounded-sm bg-ink/5 ${
                index % 5 === 0 ? "col-span-2 aspect-[4/3] sm:col-span-1 sm:aspect-square" : "aspect-square"
              }`}
              aria-label={`Apri immagine: ${image.alt}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-ink/0 transition group-hover:bg-ink/20" />
            </button>
          ))}
        </div>
      </div>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Chiudi"
            className="absolute right-5 top-5 text-3xl text-cream/80 transition hover:text-gold"
          >
            &times;
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              show(-1);
            }}
            aria-label="Immagine precedente"
            className="absolute left-3 text-3xl text-cream/70 transition hover:text-gold sm:left-8"
          >
            &#8249;
          </button>
          <div
            className="relative h-[70vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={galleryImages[activeIndex].src}
              alt={galleryImages[activeIndex].alt}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              show(1);
            }}
            aria-label="Immagine successiva"
            className="absolute right-3 text-3xl text-cream/70 transition hover:text-gold sm:right-8"
          >
            &#8250;
          </button>
        </div>
      )}
    </section>
  );
}
