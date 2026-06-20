import Hero from "@/components/Hero";
import TechStack from "@/components/TechStack";
import AboutSection from "@/components/AboutSection";
import Services from "@/components/Services";
import FeaturedWork from "@/components/FeaturedWork";
import WhyChoose from "@/components/WhyChoose";
import Process from "@/components/Process";
import Testimonials from "@/components/Testimonials";
import FinalCTA from "@/components/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TechStack />
      <AboutSection />
      <Services />
      <FeaturedWork />
      <WhyChoose />
      <Process />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
