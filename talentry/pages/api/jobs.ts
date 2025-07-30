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
  limit,
  orderBy,
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

// --- TEMPORARY: Log the APP_ID to the console for you to retrieve ---
console.log("--- CANVAS APP ID (FOR PYTHON SCRIPT) ---");
console.log("Your __app_id is:", appId);
console.log("-----------------------------------------");
// --- END TEMPORARY LOG ---

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
    query: searchQueryParam, // Renamed to avoid conflict with Firestore 'query' object
    location,
    page = "1",
    num_pages = "1",
    employment_types,
    job_category,
    job_requirements, // This will be handled client-side due to Firestore limitations
    salary_min,
    salary_max,
  } = req.query;

  try {
    // Reference to the 'jobs' collection in Firestore
    // The path uses `appId` to ensure data is scoped to your Canvas application.
    const jobsCollectionRef = collection(
      db,
      `artifacts/${appId}/public/data/jobs`
    );
    let q = query(jobsCollectionRef); // Start building the Firestore query

    // Apply filters based on query parameters using Firestore's `where` clauses
    // Note: Firestore queries require indexes for most `where` and `orderBy` combinations.
    // If you get errors about missing indexes, Firebase Console will provide a link to create them.

    // Filter by employment_types (e.g., FULLTIME, PARTTIME)
    if (employment_types && typeof employment_types === "string") {
      const typesArray = employment_types.toUpperCase().split(",");
      // Use 'in' operator for multiple values. Firestore 'in' supports up to 10 values.
      if (typesArray.length > 0) {
        q = query(q, where("job_employment_type", "in", typesArray));
      }
    }

    // Filter by job_category
    if (job_category && typeof job_category === "string") {
      q = query(q, where("job_category", "==", job_category));
    }

    // Filter by salary range (min and max)
    // Note: If both salary_min and salary_max are used, ensure you have a composite index.
    if (salary_min && typeof salary_min === "string") {
      q = query(q, where("job_salary_min", ">=", parseFloat(salary_min)));
    }
    if (salary_max && typeof salary_max === "string") {
      q = query(q, where("job_salary_max", "<=", parseFloat(salary_max)));
    }

    // Order the results. This is crucial for consistent pagination and sorting.
    // We order by 'job_posted_at_timestamp' in descending order (newest first).
    q = query(q, orderBy("job_posted_at_timestamp", "desc")); // Default order

    // Implement pagination logic
    const pageNum = parseInt(page as string);
    const numPagesToFetch = parseInt(num_pages as string);
    const itemsPerPage = 10; // Define how many items per 'page' you want to fetch from Firestore
    const totalLimit = itemsPerPage * numPagesToFetch; // Total number of items to fetch for the requested pages

    q = query(q, limit(totalLimit)); // Apply the limit to the query

    // Execute the Firestore query
    const querySnapshot = await getDocs(q);
    let jobsData: any[] = [];
    // Iterate over the documents in the snapshot and add them to the jobsData array
    querySnapshot.forEach((doc) => {
      jobsData.push({ id: doc.id, ...doc.data() });
    });

    // --- Client-side filtering for fields not directly queryable by Firestore ---
    // Firestore does not support full-text search or complex 'OR' conditions across different fields directly.
    // Therefore, we perform client-side filtering for 'query' (job title, company name, description)
    // and 'location' (city, state, country, remote status).
    let filteredJobs = jobsData;

    // Filter by general search query (job title, company name, description)
    if (
      searchQueryParam &&
      typeof searchQueryParam === "string" &&
      searchQueryParam.toLowerCase() !== "jobs"
    ) {
      const lowerCaseQuery = searchQueryParam.toLowerCase();
      filteredJobs = filteredJobs.filter(
        (job) =>
          (job.job_title &&
            job.job_title.toLowerCase().includes(lowerCaseQuery)) ||
          (job.employer_name &&
            job.employer_name.toLowerCase().includes(lowerCaseQuery)) ||
          (job.job_description &&
            job.job_description.toLowerCase().includes(lowerCaseQuery))
      );
    }

    // Filter by location
    if (location && typeof location === "string") {
      const lowerCaseLocation = location.toLowerCase();
      filteredJobs = filteredJobs.filter(
        (job) =>
          (job.job_city &&
            job.job_city.toLowerCase().includes(lowerCaseLocation)) ||
          (job.job_state &&
            job.job_state.toLowerCase().includes(lowerCaseLocation)) ||
          (job.job_country &&
            job.job_country.toLowerCase().includes(lowerCaseLocation)) ||
          (job.job_is_remote && lowerCaseLocation === "remote")
      );
    }

    // Filter by job_requirements (job level)
    // This assumes job.job_highlights.Qualifications or Responsibilities contain keywords like "entry_level"
    // If your Firestore document has a dedicated 'job_level' field, you could use a `where` clause above.
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

    // Send the filtered job data as a JSON response
    return res.status(200).json({
      status: "success",
      request_id: "firestore-request-" + Date.now(), // Unique request ID
      parameters: req.query, // Echo back the parameters for debugging
      data: filteredJobs, // The array of filtered job objects
    });
  } catch (error) {
    // Log and return an error response if anything goes wrong during the Firestore operation
    console.error("Error fetching jobs from Firestore:", error);
    return res.status(500).json({
      error: "Internal server error while fetching jobs from database.",
    });
  }
}
