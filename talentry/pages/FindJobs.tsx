// pages/FindJobs.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router"; // Correct hook for Pages Router
import HeroSection from "@/components/jobs/HeroSection"; // Ensure this path is correct
import JobFilterAndListings from "@/components/jobs/JobFilterAndListings"; // Ensure this path is correct

const FindJobsPage: React.FC = () => {
  const router = useRouter();

  // State to hold the current search query and location for this page
  // Initialize from URL query parameters if they exist
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string>("");
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [shouldFetchAll, setShouldFetchAll] = useState<boolean>(false); // State to control num_pages

  // Effect to read URL parameters on initial load and when router query changes
  useEffect(() => {
    const { q, loc, fetch_all } = router.query;

    // Set initial search query from 'q' parameter
    // Only update if the URL param is different to prevent unnecessary re-renders
    if (typeof q === "string" && q !== currentSearchQuery) {
      setCurrentSearchQuery(q);
    } else if (typeof q !== "string" && currentSearchQuery !== "") {
      // If 'q' is removed from URL
      setCurrentSearchQuery("");
    }

    // Set initial location from 'loc' parameter
    if (typeof loc === "string" && loc !== currentLocation) {
      setCurrentLocation(loc);
    } else if (typeof loc !== "string" && currentLocation !== "") {
      // If 'loc' is removed from URL
      setCurrentLocation("");
    }

    // Set shouldFetchAll from 'fetch_all' parameter
    // Ensure it's a boolean comparison
    setShouldFetchAll(fetch_all === "true");
  }, [router.query, currentSearchQuery, currentLocation, shouldFetchAll]); // Depend on router.query and current states

  // Callback function passed to HeroSection
  const handleHeroSearchSubmit = (query: string, location: string) => {
    setCurrentSearchQuery(query);
    setCurrentLocation(location);
    setShouldFetchAll(false); // When a new search is submitted directly on this page, don't force 'fetch_all'

    // Update the URL to reflect the new search parameters
    const newQueryParams: { [key: string]: string } = {};
    if (query) newQueryParams.q = query;
    if (location) newQueryParams.loc = location;
    // Do NOT include fetch_all=true here, as it's a fresh search from this page.
    // It will default to num_pages=1 in JobFilterAndListings unless explicitly set.

    router.push(
      {
        pathname: "/jobs",
        query: newQueryParams,
      },
      undefined,
      { shallow: true }
    ); // shallow: true keeps URL update client-side
  };

  const popularJobSearches = [
    // Ensure these links point to /jobs and pass fetch_all=true
    { text: "UI Designer", link: "/jobs?q=UI+Designer&fetch_all=true" },
    { text: "UX Researcher", link: "/jobs?q=UX+Researcher&fetch_all=true" },
    { text: "Android", link: "/jobs?q=Android&fetch_all=true" },
    { text: "Admin", link: "/jobs?q=Admin&fetch_all=true" },
  ];

  return (
    <>
      <HeroSection
        mainTitle={
          <>
            Find your{" "}
            <span className="relative inline-block text-[#26A4FF]">
              {" "}
              {/* Changed color to #26A4FF */}
              dream job
              <img
                src="/underline.png" // Ensure this path is correct
                alt="Underline"
                className="absolute left-0 -bottom-6 w-full max-w-[500px] pointer-events-none"
              />
            </span>
          </>
        }
        subTitle="Find your next career at companies like HubSpot, Nike, and Dropbox."
        searchPlaceholder="Job title or keyword"
        locationDefaultValue="Select a Region" // This is for the dropdown's initial display
        searchButtonText="Search my job"
        popularSearches={popularJobSearches}
        searchType="job"
        onSearchSubmit={handleHeroSearchSubmit}
        // Pass current state as initial value to keep inputs in sync
        initialSearchQuery={currentSearchQuery}
        initialLocation={currentLocation}
      />

      <JobFilterAndListings
        searchQuery={currentSearchQuery}
        location={currentLocation}
        shouldFetchAll={shouldFetchAll}
      />
    </>
  );
};

export default FindJobsPage;
