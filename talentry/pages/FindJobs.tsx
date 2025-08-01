// pages/jobs/index.tsx or pages/FindJobs.tsx
"use client";
import React from "react";
import { useRouter } from "next/router";
import HeroSection from "@/components/jobs/HeroSection"; // Assuming this is your reusable HeroSection
import JobFilterAndListings from "@/components/jobs/JobFilterAndListings"; // Your job listing component

const FindJobsPage: React.FC = () => {
  const router = useRouter();
  // Extract query parameters from the URL
  const { q, loc, fetch_all } = router.query;

  // Ensure query parameters are always strings (or empty strings) for consistency
  const initialSearchQuery = typeof q === "string" ? q : "";
  const initialLocation = typeof loc === "string" ? loc : "";
  // Convert 'fetch_all' to a boolean. It's 'true' if the param exists and is 'true'.
  const shouldFetchAllJobs = fetch_all === "true";

  // This function will be passed to HeroSection for when a search is performed
  // directly on the /FindJobs page. It updates the URL.
  const handleSearchSubmit = (query: string, location: string) => {
    router.push({
      pathname: "/FindJobs", // Ensure this matches your actual page path
      query: {
        q: query,
        loc: location,
        fetch_all: "true", // When searching from this page, always fetch all relevant results
      },
    });
  };

  return (
    <>
      <HeroSection
        mainTitle={
          <>
            Find your{" "}
            <span className="relative inline-block text-[#26A4FF]">
              dream job
              <img
                src="/underline.png" // Added the underline image here
                className="absolute left-0 -bottom-6 w-full py-3 max-w-[800px] pointer-events-none"
                alt="Underline"
              />
            </span>
          </>
        }
        subTitle="Find your next career at companies like HubSpot, Nike, and Dropbox."
        searchPlaceholder="Job title or keyword"
        searchButtonText="Find Job"
        popularSearches={[
          { text: "technology", link: "/FindJobs?q=technology" },
          { text: "UX Researcher", link: "/FindJobs?q=UX+UX+Researcher" }, // Corrected typo
          { text: "Android", link: "/FindJobs?q=Android" },
          { text: "Admin", link: "/FindJobs?q=Admin" },
        ]}
        searchType="job"
        // Pass the initial values derived from URL query parameters
        initialSearchQuery={initialSearchQuery}
        initialLocation={initialLocation}
        // Pass the handler for search submissions from this HeroSection
        onSearchSubmit={handleSearchSubmit}
      />
      <JobFilterAndListings
        // Pass the initial values derived from URL query parameters
        searchQuery={initialSearchQuery}
        location={initialLocation}
        shouldFetchAll={shouldFetchAllJobs} // Pass the boolean flag
      />
    </>
  );
};

export default FindJobsPage;
