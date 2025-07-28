import React, { useEffect } from "react"; // Import useRef and useEffect
import { useJobs } from "@/context/JobsContext"; // Import useJobs
import CallToActionSection from "@/components/home/CallToActionSection";
import Hero from "@/components/home/Hero";
import JobCategories from "@/components/home/JobCategories";
import LogoMarquee from "@/components/home/LogoMarquee";
import FeaturedJobsSection from "@/components/home/FeaturedJobsSection"; // You'd create this next
import LatestJobsOpenSection from "@/components/home/LatestJobsOpenSection"; // You'd create this next
import HomePageSearchResults from "@/components/home/HomePageSearchResults";
import { scroller } from "react-scroll"; // Import scroller from react-scroll

export default function Home() {
  const { searchQuery, location } = useJobs();

  useEffect(() => {
    // Only scroll if a search query or location is present (i.e., a search has been initiated)
    if (searchQuery !== "" || location !== "") {
      scroller.scrollTo("home-page-search-results", {
        // Scroll to the element with this name
        duration: 2000, // Smoothness duration in milliseconds
        delay: 0,
        smooth: "easeInOutQuart", // Animation type
        offset: -80, // Offset to account for fixed header/navbar, adjust as needed
      });
    }
  }, [searchQuery, location]); // Re-run this effect when searchQuery or location changes
  return (
    <>
      <Hero />
      <div className="home-page-search-results">
        <HomePageSearchResults />
      </div>
      <LogoMarquee />
      <JobCategories />
      <CallToActionSection />
      {/* Placeholder sections for Featured and Latest Jobs (will be built next) */}
      {/* These will also consume JobsContext for their data */}
      <FeaturedJobsSection />
      <LatestJobsOpenSection />
    </>
  );
}
