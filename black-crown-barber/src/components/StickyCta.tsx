import { business } from "@/lib/data";

export default function StickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-stretch gap-px border-t border-cream/10 bg-ink/95 backdrop-blur-sm md:hidden">
      <a
        href={`tel:${business.phoneE164}`}
        aria-label="Chiama ora"
        className="flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-medium text-cream/85"
      >
        Chiama
      </a>
      <a
        href="#prenota"
        className="flex flex-[1.4] items-center justify-center bg-gold py-3.5 text-sm font-semibold uppercase tracking-wide text-ink"
      >
        Prenota ora
      </a>
    </div>
  );
}
