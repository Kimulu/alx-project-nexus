// pages/api/job/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
// Import necessary Firestore functions
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, doc, getDoc, Firestore } from "firebase/firestore";

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
      "Using FIREBASE_PROJECT_ID from environment variables for job details API."
    );
    firebaseConfig.projectId = envProjectId;
  } else {
    console.error(
      "FIREBASE_PROJECT_ID environment variable is not set. Firebase projectId is missing for job details API."
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
      "Firebase 'projectId' is missing. Job details API will not initialize Firebase."
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
    "Failed to initialize Firebase app during module load for job details API:",
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
    return res
      .status(500)
      .json({
        error:
          "Server configuration error: Firebase not initialized for job details. Project ID might be missing.",
      });
  }

  // Extract the job ID from the dynamic route parameter (e.g., from /api/job/job_id_123)
  const { id } = req.query;

  // Validate that a job ID is provided
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Job ID is required." });
  }

  try {
    // Reference to the specific job document in Firestore
    // The collection path should match where you'll upload your job data (from the seeding script).
    const jobDocRef = doc(db, `artifacts/${appId}/public/data/jobs`, id);
    // Fetch the document snapshot
    const jobDocSnap = await getDoc(jobDocRef);

    // Check if the document exists
    if (jobDocSnap.exists()) {
      // If it exists, return the job data along with its ID
      const jobData = { id: jobDocSnap.id, ...jobDocSnap.data() };
      return res.status(200).json(jobData);
    } else {
      // If the document does not exist, return a 404 Not Found error
      return res
        .status(404)
        .json({ error: `Job details for ID: ${id} not found in database.` });
    }
  } catch (error) {
    // Catch any errors during the Firestore operation
    console.error("Error fetching job details from Firestore:", error);
    return res
      .status(500)
      .json({
        error:
          "Internal server error while fetching job details from database.",
      });
  }
}
