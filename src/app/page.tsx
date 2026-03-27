import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import HowItWorks from "@/components/sections/HowItWorks";
import PlansTeaser from "@/components/sections/PlansTeaser";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import FaqSection from "@/components/sections/FaqSection";
import CtaSection from "@/components/sections/CtaSection";

function SectionDivider() {
  return <div className="section-divider" />;
}

export default function HomePage() {
  return (
    <div className="bg-black text-white">
      <Navbar />
      <main>
        <HeroSection />
        <SectionDivider />
        <ServicesSection />
        <SectionDivider />
        <PlansTeaser />
        <SectionDivider />
        <HowItWorks />
        <SectionDivider />
        <TestimonialsSection />
        <SectionDivider />
        <FaqSection />
        <SectionDivider />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
