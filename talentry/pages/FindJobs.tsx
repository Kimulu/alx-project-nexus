"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // Import useSearchParams
import HeroSection from "@/components/jobs/HeroSection"; // Ensure this path is correct
import JobFilterAndListings from "@/components/jobs/JobFilterAndListings"; // Ensure this path is correct

const JobsPage = () => {
  const searchParams = useSearchParams();

  // Get initial query, location, and fetch_all status from URL search parameters
  const initialUrlQuery = searchParams.get("q") || "";
  const initialUrlLocation = searchParams.get("loc") || "";
  const initialFetchAll = searchParams.get("fetch_all") === "true"; // Check for 'fetch_all=true'

  // State to hold the search query and location, initialized from URL params
  const [currentSearchQuery, setCurrentSearchQuery] = useState(initialUrlQuery);
  const [currentLocation, setCurrentLocation] = useState(initialUrlLocation);
  const [shouldFetchAll, setShouldFetchAll] = useState(initialFetchAll); // New state for fetch_all

  // This useEffect will now *only* update the component's internal state
  // if the URL search parameters *change* after the initial render.
  // This handles cases like browser back/forward or programmatic URL changes.
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    const urlLocation = searchParams.get("loc") || "";
    const urlFetchAll = searchParams.get("fetch_all") === "true";

    // Only update state if the URL parameters are different from current state
    if (urlQuery !== currentSearchQuery) {
      setCurrentSearchQuery(urlQuery);
    }
    if (urlLocation !== currentLocation) {
      setCurrentLocation(urlLocation);
    }
    if (urlFetchAll !== shouldFetchAll) {
      // Update shouldFetchAll if URL changes
      setShouldFetchAll(urlFetchAll);
    }
  }, [searchParams, currentSearchQuery, currentLocation, shouldFetchAll]); // Added shouldFetchAll to dependencies

  // This function is passed down to HeroSection.
  // When HeroSection's search button is clicked, it calls this function
  // with the latest input values, updating the state here.
  // We also update the URL here to keep it in sync with the search.
  const handleSearchSubmit = (query: string, location: string) => {
    setCurrentSearchQuery(query);
    setCurrentLocation(location);
    setShouldFetchAll(false); // Reset fetch_all if a new search is performed on this page

    // Update the URL to reflect the new search parameters
    const newParams = new URLSearchParams();
    if (query) newParams.set("q", query);
    if (location) newParams.set("loc", location);
    // Do not include fetch_all=true if a new search is initiated on the jobs page itself
    window.history.pushState({}, "", `/jobs?${newParams.toString()}`);

    console.log(`Search submitted: Query='${query}', Location='${location}'`);
  };

  return (
    <div>
      {/* HeroSection: Displays the search bar and takes user input */}
      <HeroSection
        mainTitle={
          <>
            Find your{" "}
            <span className="relative inline-block text-[#26A4FF]">
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
        locationDefaultValue="Florence, Italy" // This is for the dropdown's initial display
        searchButtonText="Search"
        popularSearches={[
          { text: "UI Designer", link: "/FindJobs?q=UI+Designer" },
          { text: "UX Researcher", link: "/FindJobs?q=UX+Researcher" },
          { text: "Android", link: "/FindJobs?q=Android" },
          { text: "Admin", link: "/FindJobs?q=Admin" },
        ]}
        searchType="job"
        onSearchSubmit={handleSearchSubmit}
        // Pass current state as initial value to keep inputs in sync
        initialSearchQuery={currentSearchQuery}
        initialLocation={currentLocation}
      />

      {/* JobFilterAndListings: Fetches and displays jobs based on the search state */}
      <JobFilterAndListings
        searchQuery={currentSearchQuery} // Pass current search state as props
        location={currentLocation}
        shouldFetchAll={shouldFetchAll} // <--- NEW: Pass the shouldFetchAll prop
      />
    </div>
  );
};

export default JobsPage;
