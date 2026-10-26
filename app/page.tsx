import Hero from "@/components/Hero";
import TechStack from "@/components/TechStack";
import AboutSection from "@/components/AboutSection";
import Services from "@/components/Services";
import FeaturedWork from "@/components/FeaturedWork";
import WhyChoose from "@/components/WhyChoose";
import Process from "@/components/Process";
import InsightsPreview from "@/components/InsightsPreview";
import FinalCTA from "@/components/FinalCTA";
import JourneyPreview from "@/components/strategy/JourneyPreview";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <JourneyPreview />
      <Services />
      <FeaturedWork />
      <WhyChoose />
      <Process />
      <InsightsPreview />
      <TechStack />
      <FinalCTA />
    </>
  );
}
