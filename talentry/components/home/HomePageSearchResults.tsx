"use client";
import React from "react";
import Link from "next/link";
import { useJobs } from "@/context/JobsContext"; // Import the JobsContext hook

// Define the Job interface, assuming it's consistent with what JobCard expects
// If this interface is already defined globally or in JobCard's types,
// you might not need to redefine it here, but it's good for clarity
// if JobsContext doesn't explicitly type its searchResults.
interface Job {
  id: string;
  companyLogo: string | null;
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string;
  categories: string[];
  appliedCount: number;
  capacity: number;
  job_posted_at_timestamp?: number;
  job_salary_min?: number;
  job_salary_max?: number;
}

import JobCard from "@/components/jobs/JobCard"; // Import JobCard component

const HomePageSearchResults = () => {
  // Consume the necessary states from the JobsContext, using the new names
  const { searchResults, searchLoading, searchError, searchQuery, location } =
    useJobs();

  // Determine if a search has been performed (i.e., if query or location are not empty)
  const hasSearched = searchQuery !== "" || location !== "";

  // Only render this section if a search has been performed
  if (!hasSearched) {
    return null; // Don't show anything if no search is active
  }

  return (
    <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 md:py-14">
        <h2 className="text-3xl font-bold font-clash mb-8 text-center">
          Search Results for &quot;{searchQuery || "All Jobs"}&quot;{" "}
          {location && `in ${location}`}
        </h2>

        {searchLoading ? ( // Use searchLoading
          <div className="text-center py-10 text-gray-600">
            Loading search results...
          </div>
        ) : searchError ? ( // Use searchError
          <div className="text-center py-10 text-red-600">
            Error: {searchError}
          </div>
        ) : searchResults.length === 0 ? ( // Use searchResults
          <div className="text-center py-10 text-gray-600">
            No jobs found matching your search. Try a different query.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Display a limited number of results to encourage going to the jobs page */}
              {searchResults.slice(0, 6).map(
                (
                  job: Job // Explicitly type 'job' as 'Job'
                ) => (
                  <JobCard key={job.id} {...job} />
                )
              )}
            </div>

            {/* "View All Results" Button */}
            {searchResults.length > 6 && ( // Only show button if there are more than 6 results
              <div className="text-center mt-10">
                <Link
                  href={{
                    pathname: "/FindJobs", // Ensure this path is correct for your Pages Router setup
                    query: {
                      q: searchQuery,
                      loc: location, // Pass the simplified location directly
                    },
                  }}
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#4640DE] hover:bg-blue-700 transition-colors duration-200"
                >
                  View All {searchResults.length} Results
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default HomePageSearchResults;
