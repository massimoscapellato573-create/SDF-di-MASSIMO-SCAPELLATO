import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import Reviews from "@/components/Reviews";
import Booking from "@/components/Booking";
import MapSection from "@/components/MapSection";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Gallery />
      <Reviews />
      <Booking />
      <MapSection />
    </>
  );
}
