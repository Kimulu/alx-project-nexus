// pages/api/applications.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
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

// Prioritize environment variable for projectId
if (!firebaseConfig.projectId) {
  const envProjectId = process.env.FIREBASE_PROJECT_ID;
  if (envProjectId) {
    console.log(
      "Using FIREBASE_PROJECT_ID from environment variables for applications API."
    );
    firebaseConfig.projectId = envProjectId;
  } else {
    console.error(
      "FIREBASE_PROJECT_ID environment variable is not set. Firebase projectId is missing for applications API."
    );
  }
}

const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";

let app: FirebaseApp | null;
let db: Firestore | null;

try {
  if (!firebaseConfig.projectId) {
    console.error(
      "Firebase 'projectId' is missing. Applications API will not initialize Firebase."
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
    "Failed to initialize Firebase app during module load for applications API:",
    e
  );
  app = null;
  db = null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests for job application submission
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Check if Firebase app and database are initialized
  if (!app || !db) {
    return res
      .status(500)
      .json({
        error:
          "Server configuration error: Firebase not initialized for applications. Project ID might be missing.",
      });
  }

  // Extract data from the request body
  const {
    jobId,
    jobTitle,
    companyName,
    applicantName,
    applicantEmail,
    applicantPhone,
    previousJobTitle,
    linkedinUrl,
    portfolioUrl,
    additionalInfo,
    userId, // Assuming userId is passed from the client for now
  } = req.body;

  // Basic validation for required fields
  if (
    !jobId ||
    !jobTitle ||
    !companyName ||
    !applicantName ||
    !applicantEmail ||
    !applicantPhone ||
    !userId
  ) {
    return res
      .status(400)
      .json({ error: "Missing required application fields." });
  }

  try {
    // Construct the Firestore collection path using appId and userId
    const applicationsCollectionRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/applications`
    );

    // Add the application data to Firestore
    await addDoc(applicationsCollectionRef, {
      jobId,
      jobTitle,
      companyName,
      applicantName,
      applicantEmail,
      applicantPhone,
      previousJobTitle: previousJobTitle || null, // Ensure optional fields are null if not provided
      linkedinUrl: linkedinUrl || null,
      portfolioUrl: portfolioUrl || null,
      additionalInfo: additionalInfo || null,
      appliedAt: serverTimestamp(), // Use Firestore's server timestamp
    });

    // Send a success response
    return res
      .status(200)
      .json({ message: "Application submitted successfully!" });
  } catch (error) {
    console.error("Error submitting application to Firestore:", error);
    return res
      .status(500)
      .json({ error: "Internal server error while submitting application." });
  }
}
