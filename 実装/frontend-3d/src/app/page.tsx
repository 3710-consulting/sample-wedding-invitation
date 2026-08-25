import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { BottomNav } from "@/components/ui/BottomNav";
import { Hero } from "@/components/sections/Hero";
import { Countdown } from "@/components/sections/Countdown";
import { Greeting } from "@/components/sections/Greeting";
import { Host } from "@/components/sections/Host";
import { Gallery } from "@/components/sections/Gallery";
import { Schedule } from "@/components/sections/Schedule";
import { Venue } from "@/components/sections/Venue";
import { RSVP } from "@/components/sections/RSVP";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <Hero />
      <Countdown />
      <Greeting />
      <Host />
      <Gallery />
      <Schedule />
      <Venue />
      <RSVP />
      <Contact />
      <Footer />
      <BottomNav />
    </>
  );
}
