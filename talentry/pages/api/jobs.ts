// pages/api/jobs.ts
import type { NextApiRequest, NextApiResponse } from "next";
// Import necessary Firestore functions
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Firestore,
} from "firebase/firestore";

// Define a minimal interface for the Firebase configuration object
interface FirebaseConfig {
  projectId?: string;
  apiKey?: string;
  authDomain?: string;
  // Add other Firebase config properties here if needed
}

// Firebase configuration (provided by Canvas environment, or manually constructed)
let firebaseConfig: FirebaseConfig = {};

// Attempt to parse __firebase_config if available
// This is a global variable provided by the Canvas environment for Firebase setup.
if (typeof __firebase_config !== "undefined" && __firebase_config) {
  try {
    firebaseConfig = JSON.parse(__firebase_config) as FirebaseConfig;
  } catch (e) {
    console.error(
      "Error parsing __firebase_config. It might not be valid JSON:",
      e
    );
  }
}

// Prioritize environment variable for projectId for robustness
// This ensures Firebase can be initialized even if __firebase_config is problematic.
if (!firebaseConfig.projectId) {
  const envProjectId = process.env.FIREBASE_PROJECT_ID;
  if (envProjectId) {
    console.log(
      "Using FIREBASE_PROJECT_ID from environment variables for API."
    );
    firebaseConfig.projectId = envProjectId;
  } else {
    console.error(
      "FIREBASE_PROJECT_ID environment variable is not set. Firebase projectId is missing for API."
    );
  }
}

// Get the Canvas application ID. This is used to create unique Firestore collection paths.
const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";

let app: FirebaseApp | null; // Firebase app instance
let db: Firestore | null; // Firestore database instance

// Initialize Firebase app and Firestore database
try {
  if (!firebaseConfig.projectId) {
    // If projectId is missing, Firebase cannot be initialized. Log an error and set app/db to null.
    console.error(
      "Firebase 'projectId' is missing. API will not initialize Firebase."
    );
    app = null;
  } else if (!getApps().length) {
    // If no Firebase apps are already initialized, initialize a new one.
    app = initializeApp(firebaseConfig);
  } else {
    // If an app is already initialized, get the existing one.
    app = getApp();
  }

  if (app) {
    // If Firebase app is successfully initialized, get the Firestore instance.
    db = getFirestore(app);
  } else {
    // If app initialization failed, set db to null.
    db = null;
  }
} catch (e) {
  // Catch any errors during Firebase initialization.
  console.error(
    "Failed to initialize Firebase app during module load for API:",
    e
  );
  app = null;
  db = null;
}

// Main handler for the API route
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Check if Firebase app and database are initialized
  if (!app || !db) {
    return res.status(500).json({
      error:
        "Server configuration error: Firebase not initialized. Project ID might be missing.",
    });
  }

  const {
    query: searchQueryParam,
    location,
    page = "1",
    num_pages = "1",
    employment_types,
    job_category,
    job_requirements,
    salary_min,
    salary_max,
  } = req.query;

  try {
    // Reference to the 'jobs' collection in Firestore
    const jobsCollectionRef = collection(
      db,
      `artifacts/${appId}/public/data/jobs`
    );

    let jobsData: any[] = [];

    // Determine if a specific search (query OR location) is active.
    // If searchQueryParam is 'all' or empty AND location is empty, it's an "initial load" scenario.
    const isSpecificSearch =
      (searchQueryParam &&
        (searchQueryParam as string).toLowerCase() !== "all") ||
      (location && (location as string).toLowerCase() !== "all");

    if (!isSpecificSearch) {
      // Scenario 1: No specific search query or location provided (e.g., initial homepage load)
      // Fetch all jobs directly from Firestore, ordered by timestamp.
      const initialFirestoreQuery = query(
        jobsCollectionRef, // Start with the collection ref
        orderBy("job_posted_at_timestamp", "desc") // Order by newest first
        // limit(totalLimit) // This line was removed to fetch all jobs
      );
      const querySnapshot = await getDocs(initialFirestoreQuery);
      querySnapshot.forEach((doc) => {
        jobsData.push({ id: doc.id, ...doc.data() });
      });
    } else {
      // Scenario 2: A specific search query OR location is provided.
      // Fetch ALL documents for comprehensive client-side regex filtering.
      const querySnapshot = await getDocs(jobsCollectionRef); // Fetch all documents
      querySnapshot.forEach((doc) => {
        jobsData.push({ id: doc.id, ...doc.data() });
      });
    }

    let filteredJobs = jobsData;

    // --- Apply Regex-like Filtering (Client-side in API route) ---

    // 1. Filter by general search query (job_title, employer_name, job_description) using Regex
    // This now ONLY applies if a specific searchQueryParam is present and not 'all'.
    if (
      searchQueryParam &&
      typeof searchQueryParam === "string" &&
      (searchQueryParam as string).toLowerCase() !== "all"
    ) {
      const lowerCaseQuery = (searchQueryParam as string).toLowerCase();
      try {
        const regex = new RegExp(lowerCaseQuery, "i"); // 'i' for case-insensitive
        filteredJobs = filteredJobs.filter(
          (job) =>
            (job.job_title && regex.test(job.job_title.toLowerCase())) ||
            (job.employer_name &&
              regex.test(job.employer_name.toLowerCase())) ||
            (job.job_description &&
              regex.test(job.job_description.toLowerCase()))
        );
      } catch (e) {
        console.error("Invalid regex in search query:", e);
        // Optionally, handle as an error or fall back to a non-regex search
      }
    }

    // 2. Filter by location (job_country or job_is_remote) using Regex
    // This now applies if 'location' is provided, regardless of searchQueryParam.
    if (location && typeof location === "string") {
      const lowerCaseLocationInput = (location as string).toLowerCase();
      try {
        const regex = new RegExp(lowerCaseLocationInput, "i"); // 'i' for case-insensitive
        filteredJobs = filteredJobs.filter((job) => {
          const countryMatch =
            job.job_country && regex.test(job.job_country.toLowerCase());
          const remoteMatch =
            job.job_is_remote && lowerCaseLocationInput === "remote"; // Exact match for 'remote'

          return countryMatch || remoteMatch;
        });
      } catch (e) {
        console.error("Invalid regex in location query:", e);
        // Optionally, handle as an error or fall back
      }
    }

    // 3. Apply other filters (employment_types, job_category, job_requirements, salary)
    // These are applied AFTER the primary search/location filters.

    // Filter by employment_types
    if (employment_types && typeof employment_types === "string") {
      const typesArray = employment_types.toUpperCase().split(",");
      filteredJobs = filteredJobs.filter((job) =>
        typesArray.includes(job.job_employment_type)
      );
    }

    // Filter by job_category (if not already handled by searchQueryParam)
    if (job_category && typeof job_category === "string") {
      const lowerCaseCategory = job_category.toLowerCase();
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.job_category &&
          job.job_category.toLowerCase() === lowerCaseCategory
      );
    }

    // Filter by salary range
    if (salary_min && typeof salary_min === "string") {
      const minSalary = parseFloat(salary_min);
      filteredJobs = filteredJobs.filter(
        (job) => job.job_salary_min >= minSalary
      );
    }
    if (salary_max && typeof salary_max === "string") {
      const maxSalary = parseFloat(salary_max);
      filteredJobs = filteredJobs.filter(
        (job) => job.job_salary_max <= maxSalary
      );
    }

    // Filter by job_requirements (job level)
    if (job_requirements && typeof job_requirements === "string") {
      const requirementsArray = job_requirements.toLowerCase().split(",");
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.job_highlights?.Qualifications?.some((q: string) =>
            requirementsArray.some((req) => q.toLowerCase().includes(req))
          ) ||
          job.job_highlights?.Responsibilities?.some((r: string) =>
            requirementsArray.some((req) => r.toLowerCase().includes(req))
          )
      );
    }

    // Sort the results (client-side) if a specific order is needed after all filtering
    // Default to newest first if no specific sort order is requested from frontend
    filteredJobs.sort(
      (a, b) =>
        (b.job_posted_at_timestamp || 0) - (a.job_posted_at_timestamp || 0)
    );

    // MODIFIED: Conditional pagination
    let jobsToSend = filteredJobs;
    if (isSpecificSearch) {
      // Only paginate if it's a specific search
      const startIndex = (parseInt(page as string) - 1) * 10; // Assuming 10 items per page
      const endIndex = startIndex + parseInt(num_pages as string) * 10;
      jobsToSend = filteredJobs.slice(startIndex, endIndex);
    }

    // Send the filtered job data as a JSON response
    return res.status(200).json({
      status: "success",
      request_id: "firestore-request-" + Date.now(),
      parameters: req.query,
      data: jobsToSend, // Return all filtered jobs if not a specific search, else paginated
      total_results: filteredJobs.length, // Total results before pagination
    });
  } catch (error) {
    console.error("Error fetching jobs from Firestore:", error);
    return res.status(500).json({
      error: "Internal server error while fetching jobs from database.",
    });
  }
}
