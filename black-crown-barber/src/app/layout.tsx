import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyCta from "@/components/StickyCta";
import { business } from "@/lib/data";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://black-crown-barber-demo.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${business.name} — Barbiere Premium a Catania`,
    template: `%s — ${business.name}`,
  },
  description:
    "Black Crown Barber: barbiere premium a Catania. Taglio, barba e rasatura a mano libera in un ambiente elegante. Prenota il tuo appuntamento online in pochi secondi.",
  keywords: [
    "barbiere Catania",
    "barber shop Catania",
    "taglio uomo Catania",
    "rasatura barba Catania",
    "prenotazione barbiere online",
    "Black Crown Barber",
  ],
  authors: [{ name: business.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: siteUrl,
    siteName: business.name,
    title: `${business.name} — Barbiere Premium a Catania`,
    description:
      "Design elegante, prenotazioni integrate e uno stile impeccabile. Scopri Black Crown Barber, il barbiere premium di Catania.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${business.name} — Barbiere Premium a Catania`,
    description:
      "Design elegante, prenotazioni integrate e uno stile impeccabile a Catania.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: business.name,
  description:
    "Barbiere premium a Catania: taglio, barba e rasatura a mano libera in un ambiente elegante e curato.",
  image: `${siteUrl}/opengraph-image`,
  telephone: business.phoneE164,
  email: business.email,
  priceRange: "€€",
  address: {
    "@type": "PostalAddress",
    streetAddress: business.addressStreet,
    addressLocality: "Catania",
    addressRegion: "CT",
    postalCode: business.addressPostalCode,
    addressCountry: business.addressCountry,
  },
  url: siteUrl,
  sameAs: [business.instagram, business.facebook],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "09:00",
      closes: "19:00",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-cream">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <StickyCta />
      </body>
    </html>
  );
}
