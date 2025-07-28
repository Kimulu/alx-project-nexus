// pages/api/jobs.ts
import type { NextApiRequest, NextApiResponse } from "next";
// Import Firebase functions for app initialization and Firestore
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  Firestore,
} from "firebase/firestore";

// Environment variables for RapidAPI
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;

// Define a minimal interface for the Firebase configuration object
interface FirebaseConfig {
  projectId?: string;
  apiKey?: string;
  authDomain?: string;
  // Add other Firebase config properties here if you need to type them
}

// Firebase configuration (provided by Canvas environment, or manually constructed)
let firebaseConfig: FirebaseConfig = {};

// Attempt to parse __firebase_config if available (Canvas injection)
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

// --- START MODIFICATION: Prioritize environment variable for projectId ---
// If projectId is still missing from the parsed __firebase_config, or if you prefer
// to explicitly use the environment variable, set it here.
if (!firebaseConfig.projectId) {
  const envProjectId = process.env.FIREBASE_PROJECT_ID;
  if (envProjectId) {
    console.log("Using FIREBASE_PROJECT_ID from environment variables.");
    firebaseConfig.projectId = envProjectId;
  } else {
    console.error(
      "FIREBASE_PROJECT_ID environment variable is not set. Firebase projectId is missing."
    );
  }
}
// --- END MODIFICATION ---

const appId =
  typeof __app_id !== "undefined" && __app_id ? __app_id : "default-app-id";

let app: FirebaseApp | null;
let db: Firestore | null;

try {
  // Check if projectId is available before attempting Firebase initialization
  if (!firebaseConfig.projectId) {
    console.error(
      "Firebase 'projectId' is missing from the provided configuration. Firebase app will not be initialized."
    );
    app = null;
  } else if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  if (app) {
    db = getFirestore(app);
  } else {
    db = null;
  }
} catch (e) {
  console.error("Failed to initialize Firebase app during module load:", e);
  app = null;
  db = null;
}

const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!app || !db) {
    return res.status(500).json({
      error:
        "Server configuration error: Firebase not initialized. This is likely due to a missing or invalid Firebase project ID in the environment configuration.",
    });
  }

  const {
    query,
    location,
    page = "1",
    num_pages = "1",
    country = "us",
  } = req.query;

  if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {
    console.error(
      "RapidAPI Key or Host not configured in environment variables."
    );
    return res
      .status(500)
      .json({ error: "Server configuration error: API keys missing." });
  }

  let combinedQuery = (query as string) || "jobs";
  if (location) {
    combinedQuery = `${combinedQuery} in ${location}`;
  }

  const cacheKey = `query:${combinedQuery}|page:${page}|num_pages:${num_pages}|country:${country}`;
  const cacheDocRef = doc(
    db,
    `artifacts/${appId}/public/data/jobSearches`,
    cacheKey
  );

  try {
    const cachedDoc = await getDoc(cacheDocRef);

    if (cachedDoc.exists()) {
      const cachedData = cachedDoc.data();
      const lastFetched = cachedData.timestamp.toDate();
      const now = new Date();

      if (now.getTime() - lastFetched.getTime() < CACHE_DURATION_MS) {
        console.log(`Cache hit for key: ${cacheKey}. Serving from Firestore.`);
        return res.status(200).json(cachedData.data);
      } else {
        console.log(`Cache for key: ${cacheKey} is stale. Fetching new data.`);
      }
    } else {
      console.log(`Cache miss for key: ${cacheKey}. Fetching new data.`);
    }

    const jsearchUrl = `https://${RAPIDAPI_HOST}/search?query=${encodeURIComponent(
      combinedQuery
    )}&page=${page}&num_pages=${num_pages}&country=${country}`;

    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    };

    const response = await fetch(jsearchUrl, options);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        `JSearch API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
      return res.status(response.status).json({
        error: `Failed to fetch jobs from external API: ${response.statusText}`,
      });
    }

    const data = await response.json();

    await setDoc(cacheDocRef, {
      data: data,
      timestamp: new Date(),
      query: combinedQuery,
      location: location || "",
      page: page,
      num_pages: num_pages,
    });
    console.log(`Data for key: ${cacheKey} cached in Firestore.`);

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in API route (fetching or caching):", error);
    return res
      .status(500)
      .json({ error: "Internal server error while fetching or caching jobs." });
  }
}
