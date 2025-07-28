"use client";
import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, LayoutGrid, Rows } from "lucide-react";
import JobCard from "./JobCard";

// Define props for JobFilterAndListings
interface JobFilterAndListingsProps {
  searchQuery: string;
  location: string;
  shouldFetchAll: boolean; // Prop to indicate if all available results should be fetched
}

const JobFilterAndListings: React.FC<JobFilterAndListingsProps> = ({
  searchQuery,
  location,
  shouldFetchAll, // Destructure the prop
}) => {
  const [openFilters, setOpenFilters] = useState({
    employmentType: true,
    categories: true,
    jobLevel: true,
    salaryRange: true,
  });
  const [sortBy, setSortBy] = useState("Most relevant");
  const [isGridView, setIsGridView] = useState(true);

  // States for API data
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter options (static for now)
  const employmentTypes = [
    { label: "Full-time" },
    { label: "Part-Time" },
    { label: "Remote" },
    { label: "Internship" },
    { label: "Contract" },
  ];

  const categories = [
    { label: "Design" },
    { label: "Sales" },
    { label: "Marketing" },
    { label: "Business" },
    { label: "Human Resource" },
    { label: "Finance" },
    { label: "Engineering" },
    { label: "Technology" },
  ];

  const jobLevels = [
    { label: "Entry Level" },
    { label: "Mid Level" },
    { label: "Senior Level" },
    { label: "Director" },
    { label: "VP or Above" },
  ];

  const salaryRanges = [
    { label: "$700 - $1000" },
    { label: "$100 - $1500" },
    { label: "$1500 - $2000" },
    { label: "$3000 or above" },
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();

        // Pass searchQuery and location as SEPARATE parameters to your /api/jobs endpoint.
        // The /api/jobs endpoint is responsible for combining them for JSearch and caching.
        if (searchQuery) {
          params.append("query", searchQuery);
        } else {
          // If searchQuery is empty, provide a default for the API route
          // This ensures the API route always receives a 'query' parameter.
          params.append("query", "jobs");
        }

        if (location) {
          params.append("location", location);
        }

        // Adjust num_pages based on shouldFetchAll prop
        params.append("num_pages", shouldFetchAll ? "5" : "1"); // Fetch 5 pages if 'fetch_all' is true, else 1
        params.append("page", "1"); // Always start from page 1 for new searches

        const response = await fetch(`/api/jobs?${params.toString()}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch jobs");
        }
        const data = await response.json();

        const mappedJobs = data.data.map((job: any) => {
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
          };
        });
        setJobs(mappedJobs);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    // This useEffect will re-run whenever searchQuery, location, or shouldFetchAll changes
    fetchJobs();
  }, [searchQuery, location, shouldFetchAll]);

  const toggleFilter = (filterName: keyof typeof openFilters) => {
    setOpenFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  const handleCheckboxChange = (filterType: string, label: string) => {
    console.log(`Filter ${filterType}: ${label}`);
  };

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Filters */}
        <aside className="lg:col-span-1 bg-gray-50 p-6 rounded-lg shadow-sm h-fit sticky top-24">
          {/* Type of Employment */}
          <div className="mb-8">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleFilter("employmentType")}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Type of Employment
              </h3>
              {openFilters.employmentType ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>
            {openFilters.employmentType && (
              <div className="mt-4 space-y-3">
                {employmentTypes.map((type) => (
                  <label
                    key={type.label}
                    className="flex items-center text-gray-700 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-[#4640DE] rounded focus:ring-[#4640DE]"
                      onChange={() =>
                        handleCheckboxChange("employmentType", type.label)
                      }
                    />
                    <span className="ml-2">{type.label}</span>{" "}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="mb-8">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleFilter("categories")}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Categories
              </h3>
              {openFilters.categories ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>
            {openFilters.categories && (
              <div className="mt-4 space-y-3">
                {categories.map((cat) => (
                  <label
                    key={cat.label}
                    className="flex items-center text-gray-700 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-[#4640DE] rounded focus:ring-[#4640DE]"
                      onChange={() =>
                        handleCheckboxChange("categories", cat.label)
                      }
                    />
                    <span className="ml-2">{cat.label}</span>{" "}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Job Level */}
          <div className="mb-8">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleFilter("jobLevel")}
            >
              <h3 className="text-lg font-semibold text-gray-900">Job Level</h3>
              {openFilters.jobLevel ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>
            {openFilters.jobLevel && (
              <div className="mt-4 space-y-3">
                {jobLevels.map((level) => (
                  <label
                    key={level.label}
                    className="flex items-center text-gray-700 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-[#4640DE] rounded focus:ring-[#4640DE]"
                      onChange={() =>
                        handleCheckboxChange("jobLevel", level.label)
                      }
                    />
                    <span className="ml-2">{level.label}</span>{" "}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Salary Range */}
          <div className="mb-0">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleFilter("salaryRange")}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Salary Range
              </h3>
              {openFilters.salaryRange ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>
            {openFilters.salaryRange && (
              <div className="mt-4 space-y-3">
                {salaryRanges.map((range) => (
                  <label
                    key={range.label}
                    className="flex items-center text-gray-700 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-[#4640DE] rounded focus:ring-[#4640DE]"
                      onChange={() =>
                        handleCheckboxChange("salaryRange", range.label)
                      }
                    />
                    <span className="ml-2">{range.label}</span>{" "}
                  </label>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Right Section - Job Listings */}
        <main className="lg:col-span-3">
          {/* Top Bar: All Jobs, Sort By, View Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
            <div className="flex items-center mb-4 sm:mb-0">
              <h2 className="text-xl font-semibold text-gray-900 mr-2">
                All Jobs
              </h2>
              <span className="text-gray-600">
                Showing {jobs.length} results
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-gray-700 text-sm mr-2">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#4640DE]"
                >
                  <option value="Most relevant">Most relevant</option>
                  <option value="Newest">Newest</option>
                  <option value="Oldest">Oldest</option>
                  <option value="Salary (low to high)">
                    Salary (low to high)
                  </option>
                  <option value="Salary (high to low)">
                    Salary (high to low)
                  </option>
                </select>
              </div>
              {/* View Toggle Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsGridView(true)}
                  className={`p-2 rounded-md ${
                    isGridView
                      ? "bg-[#4640DE] text-white"
                      : "bg-gray-200 text-gray-700"
                  } transition-colors duration-200`}
                  title="Grid View"
                >
                  <LayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setIsGridView(false)}
                  className={`p-2 rounded-md ${
                    !isGridView
                      ? "bg-[#4640DE] text-white"
                      : "bg-gray-200 text-gray-700"
                  } transition-colors duration-200`}
                  title="List View"
                >
                  <Rows size={20} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-600">
              Loading jobs...
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-600">Error: {error}</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              No jobs found for your search.
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                isGridView ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
              }`}
            >
              {jobs.map((job: any) => (
                <JobCard key={job.id} {...job} />
              ))}
            </div>
          )}
        </main>
      </div>
    </section>
  );
};

export default JobFilterAndListings;
