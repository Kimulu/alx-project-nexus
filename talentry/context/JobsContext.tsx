// src/context/JobsContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Define the shape of your job data (matching JobCardProps, but potentially more from API)
interface Job {
  id: string; // Unique ID for the job
  companyLogo: string | null; // URL or path to the company logo (can be null)
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string; // e.g., "Full-Time", "Part-Time"
  jobDescription: string; // ADDED: New field for job description
  categories: string[]; // e.g., ["Marketing", "Design"]
  appliedCount: number;
  capacity: number;
  // Add other fields you might need for job details or filtering
  job_category?: string; // Add job_category for filtering/selection
  job_posted_at_timestamp?: number; // For sorting by newest/oldest
  job_city?: string; // Added for mapping consistency
  job_state?: string; // Added for mapping consistency
  job_country?: string; // Added for mapping consistency
  job_is_remote?: boolean; // Added for mapping consistency
}

// Define the shape of the context value
interface JobsContextType {
  // Data for search results section
  searchResults: Job[];
  searchLoading: boolean;
  searchError: string | null;
  searchQuery: string;
  location: string;
  setSearchQuery: (query: string) => void;
  setLocation: (location: string) => void;

  // Data for curated sections (featured, latest)
  featuredJobs: Job[];
  latestJobs: Job[];
  initialJobsLoading: boolean; // Loading state for initial fetch of all jobs
  initialJobsError: string | null; // Error state for initial fetch
}

// Create the context
const JobsContext = createContext<JobsContextType | undefined>(undefined);

// Create the provider component
interface JobsProviderProps {
  children: ReactNode;
}

export const JobsProvider: React.FC<JobsProviderProps> = ({ children }) => {
  // State for the full pool of jobs fetched once on initial load (for featured/latest)
  const [allAvailableJobs, setAllAvailableJobs] = useState<Job[]>([]);
  const [initialJobsLoading, setInitialJobsLoading] = useState<boolean>(true);
  const [initialJobsError, setInitialJobsError] = useState<string | null>(null);

  // State for the search query and location (controlled by Hero section)
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  // State for the jobs displayed in the search results section
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Helper function to map raw job data to consistent Job interface
  const mapJobData = (job: any): Job => {
    let jobLocation = "";
    if (job.job_country) {
      jobLocation = job.job_country; // Use the raw country from DB
    } else if (job.job_city && job.job_state) {
      jobLocation = `${job.job_city}, ${job.job_state}`;
    } else if (job.job_is_remote) {
      jobLocation = "Remote";
    }

    return {
      id: job.job_id,
      companyLogo: job.employer_logo,
      jobTitle: job.job_title,
      companyName: job.employer_name,
      location: jobLocation, // This will be the raw location from DB
      jobType:
        job.job_employment_type_text ||
        (job.job_employment_type
          ? job.job_employment_type.charAt(0).toUpperCase() +
            job.job_employment_type.slice(1).toLowerCase()
          : "Full-Time"),
      jobDescription: job.job_description || "No description available.",
      categories: job.job_category ? [job.job_category] : [],
      appliedCount: Math.floor(Math.random() * 20),
      capacity: Math.floor(Math.random() * 20) + 10,
      job_category: job.job_category,
      job_posted_at_timestamp: job.job_posted_at_timestamp,
      job_city: job.job_city, // Keep raw city/state/country for detailed display if needed
      job_state: job.job_state,
      job_country: job.job_country,
      job_is_remote: job.job_is_remote,
    };
  };

  // --- useEffect for Initial Load of all available jobs (runs once) ---
  useEffect(() => {
    const fetchAllAvailableJobs = async () => {
      setInitialJobsLoading(true);
      setInitialJobsError(null);
      try {
        const params = new URLSearchParams();
        params.append("query", "all"); // A general query to fetch broad data
        params.append("num_pages", "5"); // Fetch more pages for better variety

        const response = await fetch(`/api/jobs?${params.toString()}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch initial jobs");
        }
        const data = await response.json();

        const mappedJobs: Job[] = data.data.map(mapJobData);
        setAllAvailableJobs(mappedJobs);
      } catch (err: any) {
        setInitialJobsError(err.message);
        console.error("Error fetching initial jobs in JobsContext:", err);
      } finally {
        setInitialJobsLoading(false);
      }
    };

    fetchAllAvailableJobs();
  }, []); // Empty dependency array: runs only once on mount

  // --- useEffect for Search Results (runs when searchQuery or location changes) ---
  useEffect(() => {
    const fetchSearchResults = async () => {
      // If both search query and location are empty, default to showing a subset of allAvailableJobs
      if (!searchQuery && !location) {
        // Display a subset of the initially loaded jobs for the search results if no active search
        setSearchResults(allAvailableJobs.slice(0, 10)); // Show a default subset
        setSearchLoading(false);
        setSearchError(null);
        return;
      }

      setSearchLoading(true);
      setSearchError(null);
      try {
        const params = new URLSearchParams();
        // Pass searchQuery and location as SEPARATE parameters to your /api/jobs endpoint.
        if (searchQuery) {
          params.append("query", searchQuery);
        }

        // Pass the simplified location directly as it's what the API expects for regex matching
        if (location) {
          params.append("location", location);
        }
        params.append("num_pages", "2"); // Fetch fewer pages for specific searches, or adjust as needed
        params.append("page", "1"); // Always start from page 1 for new searches

        const response = await fetch(`/api/jobs?${params.toString()}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch search results");
        }
        const data = await response.json();

        const mappedResults: Job[] = data.data.map(mapJobData); // Use the helper function
        setSearchResults(mappedResults);
      } catch (err: any) {
        setSearchError(err.message);
        console.error("Error fetching search results in JobsContext:", err);
      } finally {
        setSearchLoading(false);
      }
    };

    // Only run this effect if allAvailableJobs has been loaded, or if a search is active
    if (!initialJobsLoading || searchQuery || location) {
      fetchSearchResults();
    }
  }, [searchQuery, location, allAvailableJobs, initialJobsLoading]);

  // --- MODIFICATION START: Ensure distinct Featured and Latest Jobs ---
  const latestJobs = React.useMemo(() => {
    // latestJobs are simply the top 4 most recent jobs from the initially loaded pool
    // (which is already sorted by timestamp by the API)
    return allAvailableJobs.slice(0, 4);
  }, [allAvailableJobs]);

  const featuredJobs = React.useMemo(() => {
    const selected: Job[] = [];
    const categoriesUsed = new Set<string>();
    const maxFeatured = 4;

    // Create a pool of jobs that are NOT the absolute latest
    // We take jobs starting from the 4th index, assuming latestJobs takes the first 4.
    const nonLatestJobs = allAvailableJobs.slice(4);

    // Try to pick jobs with diverse categories from the non-latest pool
    for (const job of nonLatestJobs) {
      if (selected.length >= maxFeatured) break;
      if (job.job_category && !categoriesUsed.has(job.job_category)) {
        selected.push(job);
        categoriesUsed.add(job.job_category);
      }
    }

    // If we still don't have enough featured jobs, fill from the remaining non-latest pool
    let fillCount = selected.length;
    for (const job of nonLatestJobs) {
      if (fillCount >= maxFeatured) break;
      if (!selected.includes(job)) {
        // Ensure no duplicates
        selected.push(job);
        fillCount++;
      }
    }

    // If even after trying to pick from non-latest, we don't have 4 (e.g., very few jobs overall),
    // then as a fallback, just pick from the beginning of allAvailableJobs, ensuring we have 4.
    while (
      selected.length < maxFeatured &&
      allAvailableJobs.length > selected.length
    ) {
      const nextJob = allAvailableJobs[selected.length]; // Pick next available
      if (!selected.includes(nextJob)) {
        selected.push(nextJob);
      }
    }

    return selected;
  }, [allAvailableJobs]);
  // --- MODIFICATION END ---

  const contextValue: JobsContextType = {
    // Search related states
    searchResults,
    searchLoading,
    searchError,
    searchQuery,
    location,
    setSearchQuery,
    setLocation,

    // Curated jobs states
    featuredJobs,
    latestJobs,
    initialJobsLoading,
    initialJobsError,
  };

  return (
    <JobsContext.Provider value={contextValue}>{children}</JobsContext.Provider>
  );
};

// Custom hook to consume the context
export const useJobs = () => {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error("useJobs must be used within a JobsProvider");
  }
  return context;
};
