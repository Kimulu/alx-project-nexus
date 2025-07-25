import CallToActionSection from "@/components/CallToActionSection";
import Hero from "@/components/Hero";
import JobCategories from "@/components/JobCategories";
import LogoMarquee from "@/components/LogoMarquee";

export default function Home() {
  return (
    <>
      <Hero />
      <LogoMarquee />
      <JobCategories />
      <CallToActionSection />
    </>
  );
}
