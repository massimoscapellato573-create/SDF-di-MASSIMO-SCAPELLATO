# Black Crown Barber — sito demo

Sito demo "premium" per un barbiere moderno, pensato come esempio concreto da
mostrare a potenziali clienti (barbieri, saloni) prima di adattarlo al loro
brand, prezzi e foto reali.

Stack: Next.js (App Router) + TypeScript + Tailwind CSS 4.

## Cosa include

- Hero con call-to-action "Prenota ora" sempre visibile (anche in una barra
  sticky su mobile)
- Sezione servizi con prezzi e durata
- Galleria con lightbox
- Recensioni
- Modulo di prenotazione che genera un messaggio WhatsApp precompilato
  (facilmente sostituibile con Calendly, Fresha, Treatwise o un backend reale)
- Mappa Google integrata e contatti rapidi
- SEO: metadata, Open Graph/Twitter image generate dinamicamente, dati
  strutturati `HairSalon` (JSON-LD), `sitemap.xml` e `robots.txt`
- Immagini ottimizzate con `next/image` (nessun asset locale: le foto sono
  segnaposto da Unsplash, da sostituire con gli scatti reali del cliente)

Tutti i contenuti (nome attività, indirizzo, telefono, prezzi, recensioni)
sono dati di esempio in `src/lib/data.ts` — un unico file da modificare per
adattare il sito a un cliente reale.

## Sviluppo

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Build di produzione

```bash
npm run build
npm run start
```
