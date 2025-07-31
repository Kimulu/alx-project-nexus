"use client";
import React, { useState, useEffect, useMemo } from "react";
import { ChevronUp, ChevronDown, LayoutGrid, Rows } from "lucide-react";
import JobCard from "./JobCard";

// Define props for JobFilterAndListings
interface JobFilterAndListingsProps {
  searchQuery: string;
  location: string;
  shouldFetchAll: boolean; // Prop to indicate if all available results should be fetched
}

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
  job_posted_at_timestamp?: number; // Optional, as it might not always be present
  job_salary_min?: number; // Optional
  job_salary_max?: number; // Optional
  // Raw JSearch fields are no longer strictly needed for client-side filtering,
  // but keeping them in the Job interface for completeness if you use them elsewhere.
  job_employment_type?: string;
  job_category?: string;
  job_requirements?: string[];
}

const JobFilterAndListings: React.FC<JobFilterAndListingsProps> = ({
  searchQuery,
  location,
  shouldFetchAll,
}) => {
  const [openFilters, setOpenFilters] = useState({
    employmentType: true,
    categories: true,
    jobLevel: true,
    salaryRange: true,
  });
  const [sortBy, setSortBy] = useState("Most relevant");
  const [isGridView, setIsGridView] = useState(true);

  // States for selected filters
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState<
    Set<string>
  >(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedJobLevels, setSelectedJobLevels] = useState<Set<string>>(
    new Set()
  );
  const [selectedSalaryRanges, setSelectedSalaryRanges] = useState<Set<string>>(
    new Set()
  );

  // States for API data - Explicitly type 'jobs' as an array of 'Job'
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter options with values mapped to JSearch API parameters
  const employmentTypes = [
    { label: "Full-time", value: "FULLTIME" },
    { label: "Part-Time", value: "PARTTIME" },
    { label: "Remote", value: "REMOTE" },
    { label: "Internship", value: "INTERNSHIP" },
    { label: "Contract", value: "CONTRACT" },
  ];

  const categories = [
    { label: "Design", value: "Design" },
    { label: "Sales", value: "Sales" },
    { label: "Marketing", value: "Marketing" },
    { label: "Business", value: "Business" },
    { label: "Human Resource", value: "Human Resource" },
    { label: "Finance", value: "Finance" },
    { label: "Engineering", value: "Engineering" },
    { label: "Technology", value: "Technology" },
  ];

  const jobLevels = [
    { label: "Entry Level", value: "entry_level" },
    { label: "Mid Level", value: "mid_level" },
    { label: "Senior Level", value: "senior_level" },
    { label: "Director", value: "director" },
    { label: "VP or Above", value: "vp_and_above" },
  ];

  const salaryRanges = [
    { label: "$700 - $1000", min: 700, max: 1000 },
    { label: "$1000 - $1500", min: 1000, max: 1500 },
    { label: "$1500 - $2000", min: 1500, max: 2000 },
    { label: "$3000 or above", min: 3000, max: null }, // max is null for "or above"
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();

        // Base query
        if (searchQuery) {
          params.append("query", searchQuery);
        } else {
          // If no specific search query, default to "all" to get a broad set of jobs
          // This ensures the page is not blank on direct navigation.
          params.append("query", "all");
        }

        if (location) {
          params.append("location", location);
        }

        params.append("num_pages", shouldFetchAll ? "5" : "1");
        params.append("page", "1");

        // Append selected filters to URL parameters for API-side filtering
        if (selectedEmploymentTypes.size > 0) {
          params.append(
            "employment_types",
            Array.from(selectedEmploymentTypes).join(",")
          );
        }
        if (selectedCategories.size > 0) {
          // JSearch typically expects a single category, so we'll send the first selected one
          params.append("job_category", Array.from(selectedCategories)[0]);
        }
        if (selectedJobLevels.size > 0) {
          params.append(
            "job_requirements",
            Array.from(selectedJobLevels).join(",")
          );
        }
        if (selectedSalaryRanges.size > 0) {
          let minSalary: number | undefined;
          let maxSalary: number | undefined;

          // Iterate through selected salary ranges to find the overall min and max
          Array.from(selectedSalaryRanges).forEach((rangeLabel) => {
            const range = salaryRanges.find((s) => s.label === rangeLabel);
            if (range) {
              if (range.min !== null && range.min !== undefined) {
                minSalary =
                  minSalary === undefined
                    ? range.min
                    : Math.min(minSalary, range.min);
              }
              if (range.max !== null && range.max !== undefined) {
                maxSalary =
                  maxSalary === undefined
                    ? range.max
                    : Math.max(maxSalary, range.max);
              }
            }
          });

          if (minSalary !== undefined) {
            params.append("salary_min", minSalary.toString());
          }
          if (maxSalary !== undefined) {
            params.append("salary_max", maxSalary.toString());
          }
        }

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
            // Fallback: if no direct category, try to derive from qualifications or other highlights
            // This is a placeholder; you might want more sophisticated logic here.
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
            // Keeping raw fields in case future client-side logic needs them,
            // but they are not used for strict client-side filtering anymore.
            job_employment_type: job.job_employment_type,
            job_category: job.job_category,
            job_requirements: job.job_requirements,
          };
        });
        setJobs(mappedJobs);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching jobs:", err); // Log the error for debugging
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [
    searchQuery,
    location,
    shouldFetchAll,
    selectedEmploymentTypes, // Dependency for re-fetching when employment types change
    selectedCategories, // Dependency for re-fetching when categories change
    selectedJobLevels, // Dependency for re-fetching when job levels change
    selectedSalaryRanges, // Dependency for re-fetching when salary ranges change
  ]);

  // Client-side sorting applied directly to the jobs fetched from the API
  const sortedJobs = useMemo(() => {
    let sortableJobs = [...jobs];
    switch (sortBy) {
      case "Newest":
        sortableJobs.sort(
          (a, b) =>
            (b.job_posted_at_timestamp || 0) - (a.job_posted_at_timestamp || 0)
        );
        break;
      case "Oldest":
        sortableJobs.sort(
          (a, b) =>
            (a.job_posted_at_timestamp || 0) - (b.job_posted_at_timestamp || 0)
        );
        break;
      case "Salary (low to high)":
        // Handle cases where salary might be null/undefined, treat as 0 for sorting
        sortableJobs.sort(
          (a, b) => (a.job_salary_min || 0) - (b.job_salary_min || 0)
        );
        break;
      case "Salary (high to low)":
        // Handle cases where salary might be null/undefined, treat as 0 for sorting
        sortableJobs.sort(
          (a, b) => (b.job_salary_min || 0) - (a.job_salary_min || 0)
        );
        break;
      case "Most relevant":
      default:
        // No specific sorting for "Most relevant" as API handles initial relevance
        break;
    }
    return sortableJobs;
  }, [jobs, sortBy]);

  const toggleFilter = (filterName: keyof typeof openFilters) => {
    setOpenFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  // MODIFIED: handleCheckboxChange to correctly update state
  const handleCheckboxChange = (
    filterType: string,
    value: string,
    isChecked: boolean
  ) => {
    const updateSet = (prevSet: Set<string>) => {
      const newSet = new Set(prevSet);
      if (isChecked) {
        newSet.add(value);
      } else {
        newSet.delete(value);
      }
      return newSet;
    };

    switch (filterType) {
      case "employmentType":
        setSelectedEmploymentTypes(updateSet);
        break;
      case "categories":
        // For categories, if JSearch only supports one, you might want to replace instead of add
        // For now, it behaves like multi-select but the API only uses the first.
        setSelectedCategories(updateSet);
        break;
      case "jobLevel":
        setSelectedJobLevels(updateSet);
        break;
      case "salaryRange":
        setSelectedSalaryRanges(updateSet);
        break;
      default:
        break;
    }
  };

  // Dynamic title based on search/location
  const displayTitle = searchQuery
    ? `Jobs for "${searchQuery}"${location ? ` in ${location}` : ""}`
    : `All Jobs${location ? ` in ${location}` : ""}`;

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Filters */}
        <aside className="lg:col-span-1 bg-gray-50 p-6 rounded-lg shadow-sm h-fit lg:sticky lg:top-24">
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
                      checked={selectedEmploymentTypes.has(type.value)}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "employmentType",
                          type.value,
                          e.target.checked
                        )
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
                      checked={selectedCategories.has(cat.value)}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "categories",
                          cat.value,
                          e.target.checked
                        )
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
                      checked={selectedJobLevels.has(level.value)}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "jobLevel",
                          level.value,
                          e.target.checked
                        )
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
                      checked={selectedSalaryRanges.has(range.label)}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "salaryRange",
                          range.label,
                          e.target.checked
                        )
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
                {displayTitle}
              </h2>
              <span className="text-gray-600">
                Showing {sortedJobs.length} results
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
          ) : sortedJobs.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              No jobs found for your search.
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                isGridView ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
              }`}
            >
              {sortedJobs.map((job: any) => (
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
