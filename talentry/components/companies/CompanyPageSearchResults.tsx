// src/components/companies/CompanyPageSearchResults.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import JobCard from "@/components/jobs/JobCard"; // Import JobCard component

// Define the Job interface to explicitly type the job objects
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

interface CompanyPageSearchResultsProps {
  searchQuery: string;
  location: string;
}

const CompanyPageSearchResults: React.FC<CompanyPageSearchResultsProps> = ({
  searchQuery,
  location,
}) => {
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyJobs = async () => {
      if (!searchQuery && !location) {
        setSearchResults([]);
        return; // Don't fetch if no query or location
      }

      setSearchLoading(true);
      setSearchError(null);

      try {
        const params = new URLSearchParams();
        if (searchQuery) {
          params.append("query", searchQuery);
        } else {
          // If only location is provided, search for general jobs in that location
          params.append("query", "jobs");
        }
        if (location) {
          params.append("location", location);
        }
        params.append("num_pages", "1"); // Fetch only the first page of results for this section

        const response = await fetch(`/api/jobs?${params.toString()}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch jobs");
        }
        const data = await response.json();

        const mappedJobs: Job[] = data.data.map((job: any) => {
          const jobType =
            job.job_employment_type_text ||
            (job.job_employment_type
              ? job.job_employment_type.charAt(0).toUpperCase() +
                job.job_employment_type.slice(1).toLowerCase()
              : "Full-Time");

          let jobCategories: string[] = [];
          if (job.job_category) {
            jobCategories = [job.job_category];
          } else if (job.job_highlights && job.job_highlights.Qualifications) {
            jobCategories = [];
          }

          let jobLocation = "Remote";
          if (job.job_city && job.job_state) {
            jobLocation = `${job.job_city}, ${job.job_state}`;
          } else if (job.job_country) {
            jobLocation = job.job_country;
          } else if (job.job_is_remote) {
            jobLocation = "Remote";
          }

          return {
            id: job.job_id,
            companyLogo: job.employer_logo,
            jobTitle: job.job_title,
            companyName: job.employer_name,
            location: jobLocation,
            jobType: jobType,
            categories: jobCategories,
            appliedCount: Math.floor(Math.random() * 20),
            capacity: Math.floor(Math.random() * 20) + 10,
            job_posted_at_timestamp: job.job_posted_at_timestamp,
            job_salary_min: job.job_salary_min,
            job_salary_max: job.job_salary_max,
          };
        });
        setSearchResults(mappedJobs);
      } catch (err: any) {
        setSearchError(err.message);
        console.error("Error fetching jobs for company search:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    fetchCompanyJobs();
  }, [searchQuery, location]); // Re-fetch when query or location changes

  // Only render this section if a search has been performed
  const hasSearched = searchQuery !== "" || location !== "";
  if (!hasSearched) {
    return null; // Don't show anything if no search is active
  }

  return (
    <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 md:py-14">
        <h2 className="text-3xl font-bold font-clash mb-8 text-center">
          Jobs at "{searchQuery || "All Companies"}"{" "}
          {location && `in ${location}`}
        </h2>

        {searchLoading ? (
          <div className="text-center py-10 text-gray-600">
            Loading company jobs...
          </div>
        ) : searchError ? (
          <div className="text-center py-10 text-red-600">
            Error: {searchError}
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            No jobs found for this company matching your search. Try a different
            query.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Display a limited number of results, e.g., first 6 */}
              {searchResults.slice(0, 6).map((job) => (
                <JobCard
                  key={job.id}
                  {...job}
                  linkToCompanyProfile={true} // IMPORTANT: Link JobCard to company profile
                />
              ))}
            </div>

            {/* "View All Results" Button - now links to the company profile page */}
            {searchResults.length > 6 && ( // Only show button if there are more than 6 results
              <div className="text-center mt-10">
                <Link
                  href={`/company/${encodeURIComponent(searchQuery)}`} // Link directly to company profile page
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#4640DE] hover:bg-blue-700 transition-colors duration-200"
                >
                  View All Jobs at {searchQuery}
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default CompanyPageSearchResults;
