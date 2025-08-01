// pages/api/companies.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  getDocs,
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

const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";

let app: FirebaseApp | null;
let db: Firestore | null;

try {
  if (!firebaseConfig.projectId) {
    console.error(
      "Firebase 'projectId' is missing. API will not initialize Firebase."
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
  console.error(
    "Failed to initialize Firebase app during module load for API:",
    e
  );
  app = null;
  db = null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!app || !db) {
    return res
      .status(500)
      .json({
        error:
          "Server configuration error: Firebase not initialized. Project ID might be missing.",
      });
  }

  try {
    const jobsCollectionRef = collection(
      db,
      `artifacts/${appId}/public/data/jobs`
    );
    const querySnapshot = await getDocs(query(jobsCollectionRef));

    const companiesMap = new Map<
      string,
      { name: string; logo: string | null; jobCount: number }
    >();

    querySnapshot.forEach((doc) => {
      const job = doc.data();
      const employerName = job.employer_name;
      const employerLogo = job.employer_logo;

      if (employerName) {
        if (companiesMap.has(employerName)) {
          const company = companiesMap.get(employerName)!;
          company.jobCount++;
          // Prioritize a logo if one is found, as some jobs might have it and others not
          if (employerLogo && !company.logo) {
            company.logo = employerLogo;
          }
        } else {
          companiesMap.set(employerName, {
            name: employerName,
            logo: employerLogo || null,
            jobCount: 1,
          });
        }
      }
    });

    const companies = Array.from(companiesMap.values());

    return res.status(200).json({
      status: "success",
      request_id: "companies-fetch-" + Date.now(),
      data: companies,
      total_companies: companies.length,
    });
  } catch (error) {
    console.error("Error fetching companies from Firestore:", error);
    return res
      .status(500)
      .json({ error: "Internal server error while fetching companies." });
  }
}
