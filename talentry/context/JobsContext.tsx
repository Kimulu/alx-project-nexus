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

  // --- useEffect for Initial Load of all available jobs (runs once) ---
  useEffect(() => {
    const fetchAllAvailableJobs = async () => {
      setInitialJobsLoading(true);
      setInitialJobsError(null);
      try {
        const params = new URLSearchParams();
        // Use a broader default query ('jobs') for initial load to get diverse data
        params.append("query", "jobs");
        params.append("num_pages", "5"); // Fetch more pages for better variety in featured/latest

        const response = await fetch(`/api/jobs?${params.toString()}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch initial jobs");
        }
        const data = await response.json();

        const mappedJobs: Job[] = data.data.map((job: any) => ({
          id: job.job_id,
          companyLogo: job.employer_logo,
          jobTitle: job.job_title,
          companyName: job.employer_name,
          location:
            job.job_city && job.job_state
              ? `${job.job_city}, ${job.job_state}`
              : job.job_country || (job.job_is_remote ? "Remote" : ""),
          jobType:
            job.job_employment_type_text ||
            (job.job_employment_type
              ? job.job_employment_type.charAt(0).toUpperCase() +
                job.job_employment_type.slice(1).toLowerCase()
              : "Full-Time"),
          jobDescription: job.job_description || "No description available.", // ADDED: Map job_description
          categories: job.job_category ? [job.job_category] : [],
          appliedCount: Math.floor(Math.random() * 20),
          capacity: Math.floor(Math.random() * 20) + 10,
          job_category: job.job_category,
          job_posted_at_timestamp: job.job_posted_at_timestamp,
        }));
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
      // This handles the initial state of the HomePageSearchResults section before a search is made.
      if (!searchQuery && !location) {
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
        // The /api/jobs endpoint is responsible for combining them for JSearch and caching.
        if (searchQuery) {
          params.append("query", searchQuery);
        } else {
          params.append("query", "jobs"); // Default query if user only specifies location
        }

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

        const mappedResults: Job[] = data.data.map((job: any) => ({
          id: job.job_id,
          companyLogo: job.employer_logo,
          jobTitle: job.job_title,
          companyName: job.employer_name,
          location:
            job.job_city && job.job_state
              ? `${job.job_city}, ${job.job_state}`
              : job.job_country || (job.job_is_remote ? "Remote" : ""),
          jobType:
            job.job_employment_type_text ||
            (job.job_employment_type
              ? job.job_employment_type.charAt(0).toUpperCase() +
                job.job_employment_type.slice(1).toLowerCase()
              : "Full-Time"),
          jobDescription: job.job_description || "No description available.", // ADDED: Map job_description
          categories: job.job_category ? [job.job_category] : [],
          appliedCount: Math.floor(Math.random() * 20),
          capacity: Math.floor(Math.random() * 20) + 10,
          job_category: job.job_category,
          job_posted_at_timestamp: job.job_posted_at_timestamp,
        }));
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

  // Derive featured and latest jobs from the 'allAvailableJobs' pool
  // These will remain static after the initial fetch of allAvailableJobs
  const featuredJobs = React.useMemo(() => {
    const selected: Job[] = [];
    const categoriesUsed = new Set<string>();
    const maxFeatured = 4;

    for (const job of allAvailableJobs) {
      if (selected.length >= maxFeatured) break;
      // Prioritize jobs that have a category and haven't been used yet
      if (job.job_category && !categoriesUsed.has(job.job_category)) {
        selected.push(job);
        categoriesUsed.add(job.job_category);
      }
    }
    let fillCount = selected.length;
    for (const job of allAvailableJobs) {
      if (fillCount >= maxFeatured) break;
      if (!selected.includes(job)) {
        // Ensure we don't add duplicates
        selected.push(job);
        fillCount++;
      }
    }
    return selected;
  }, [allAvailableJobs]); // Depends only on allAvailableJobs

  const latestJobs = React.useMemo(() => {
    return [...allAvailableJobs]
      .sort(
        (a, b) =>
          (b.job_posted_at_timestamp || 0) - (a.job_posted_at_timestamp || 0)
      )
      .slice(0, 4);
  }, [allAvailableJobs]); // Depends only on allAvailableJobs

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
