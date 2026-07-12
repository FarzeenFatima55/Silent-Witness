import Navbar from "@/app/components/sections/Navbar";
import Hero from "@/app/components/sections/Hero";
import HowItWorks from "@/app/components/sections/HowItWorks";
import PrivacyFirst from "@/app/components/sections/PrivacyFirst";
import Features from "@/app/components/sections/Features";
import WhyThisMatters from "@/app/components/sections/WhyThisMatters";
import Trust from "@/app/components/sections/Trust";
import FAQ from "@/app/components/sections/FAQ";
import FinalCTA from "@/app/components/sections/FinalCTA";
import Footer from "@/app/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <HowItWorks />
        <PrivacyFirst />
        <Features />
        <WhyThisMatters />
        <Trust />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
