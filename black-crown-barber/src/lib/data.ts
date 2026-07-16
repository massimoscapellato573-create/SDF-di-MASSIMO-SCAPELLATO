export const business = {
  name: "Black Crown Barber",
  claim: "L'arte del taglio, l'eleganza del dettaglio.",
  city: "Catania",
  addressStreet: "Via Etnea 100",
  addressLocality: "Catania (CT)",
  addressPostalCode: "95131",
  addressCountry: "IT",
  phoneDisplay: "+39 095 700 1234",
  phoneE164: "+390957001234",
  whatsapp: "390957001234",
  email: "info@blackcrownbarber.it",
  instagram: "https://instagram.com/blackcrownbarber",
  facebook: "https://facebook.com/blackcrownbarber",
  mapsQuery: "Via Etnea 100, 95131 Catania CT",
  hours: [
    { day: "Lunedì", time: "Chiuso" },
    { day: "Martedì – Venerdì", time: "9:00 – 20:00" },
    { day: "Sabato", time: "9:00 – 19:00" },
    { day: "Domenica", time: "Su appuntamento" },
  ],
};

export type Service = {
  name: string;
  description: string;
  price: string;
  duration: string;
};

export const services: Service[] = [
  {
    name: "Taglio Classico",
    description: "Taglio su misura, lavaggio e styling finale.",
    price: "25€",
    duration: "30 min",
  },
  {
    name: "Taglio + Barba",
    description: "Il rituale completo: taglio, rasatura e rifinitura barba.",
    price: "40€",
    duration: "50 min",
  },
  {
    name: "Rifinitura Barba",
    description: "Contorno, sfumatura e prodotti specifici per la barba.",
    price: "15€",
    duration: "20 min",
  },
  {
    name: "Rasatura a Mano Libera",
    description: "Rasoio tradizionale, panno caldo e olii lenitivi.",
    price: "22€",
    duration: "30 min",
  },
  {
    name: "Trattamento Viso Premium",
    description: "Pulizia profonda, maschera e massaggio rilassante.",
    price: "30€",
    duration: "35 min",
  },
  {
    name: "Taglio Bambino",
    description: "Taglio dedicato ai più piccoli, fino a 12 anni.",
    price: "18€",
    duration: "25 min",
  },
];

export type GalleryImage = {
  src: string;
  alt: string;
};

export const galleryImages: GalleryImage[] = [
  {
    src: "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=1200&q=80",
    alt: "Poltrona da barbiere vintage in pelle",
  },
  {
    src: "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=1200&q=80",
    alt: "Barbiere al lavoro su un taglio uomo",
  },
  {
    src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80",
    alt: "Rasatura della barba con rasoio a mano libera",
  },
  {
    src: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1200&q=80",
    alt: "Rifinitura barba con forbici in bianco e nero",
  },
  {
    src: "https://images.unsplash.com/photo-1596728325488-58c87691e9af?auto=format&fit=crop&w=1200&q=80",
    alt: "Trattamento barba con panno caldo",
  },
  {
    src: "https://images.unsplash.com/photo-1635273051839-003bf06a8751?auto=format&fit=crop&w=1200&q=80",
    alt: "Dettaglio taglio con rifinitore",
  },
  {
    src: "https://images.unsplash.com/photo-1587909209111-5097ee578ec3?auto=format&fit=crop&w=1200&q=80",
    alt: "Prodotti da barbiere su un tavolo in legno",
  },
  {
    src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
    alt: "Interno del salone con postazioni da barbiere",
  },
  {
    src: "https://images.unsplash.com/photo-1583864697784-a0efc8379f70?auto=format&fit=crop&w=1200&q=80",
    alt: "Cliente soddisfatto dopo il taglio",
  },
];

export type Review = {
  name: string;
  initials: string;
  rating: number;
  text: string;
};

export const reviews: Review[] = [
  {
    name: "Marco Russo",
    initials: "MR",
    rating: 5,
    text: "Ambiente curato nei minimi dettagli e barbieri veramente competenti. Il miglior taglio che abbia mai avuto a Catania.",
  },
  {
    name: "Giuseppe Lo Faro",
    initials: "GL",
    rating: 5,
    text: "Prenotazione facilissima dal sito, nessuna attesa e risultato impeccabile. Ci torno ogni mese.",
  },
  {
    name: "Andrea Conti",
    initials: "AC",
    rating: 5,
    text: "La rasatura a mano libera è un'esperienza unica. Professionalità e attenzione al cliente al top.",
  },
  {
    name: "Salvatore Greco",
    initials: "SG",
    rating: 4,
    text: "Locale elegante, staff gentilissimo. Consigliato a chi cerca un barbiere di livello.",
  },
];
