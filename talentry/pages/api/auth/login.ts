// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";

// Define a minimal interface for the Firebase configuration object
interface FirebaseConfig {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
}

// Firebase configuration for Admin SDK
let firebaseConfig: FirebaseConfig = {};

// Load service account credentials from environment variables
if (
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
) {
  firebaseConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
  console.log(
    "Firebase Admin SDK: Using credentials from environment variables."
  );
} else {
  // Fallback for Canvas environment if direct env vars are not set
  // This assumes __firebase_config is globally available in the Canvas environment
  // and contains at least projectId.
  if (typeof __firebase_config !== "undefined" && __firebase_config) {
    try {
      const parsedConfig = JSON.parse(__firebase_config);
      firebaseConfig.projectId = parsedConfig.projectId;
      // Note: clientEmail and privateKey are typically not exposed via __firebase_config
      // for client-side Firebase SDK. For Admin SDK, these must come from secure env vars.
    } catch (e: unknown) {
      // Explicitly type 'e' as unknown
      if (e instanceof Error) {
        console.error(
          "Error parsing __firebase_config for Admin SDK:",
          e.message
        );
      } else {
        console.error("Error parsing __firebase_config for Admin SDK:", e);
      }
    }
  }
}

// Get the Canvas application ID for Firestore paths
// This assumes __app_id is globally available in the Canvas environment.
declare const __app_id: string | undefined; // Declare __app_id for TypeScript
const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  try {
    if (
      firebaseConfig.projectId &&
      firebaseConfig.clientEmail &&
      firebaseConfig.privateKey
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseConfig.projectId,
          clientEmail: firebaseConfig.clientEmail,
          privateKey: firebaseConfig.privateKey,
        }),
      });
      console.log("Firebase Admin SDK initialized successfully.");
    } else {
      console.warn(
        "Firebase Admin SDK credentials (projectId, clientEmail, privateKey) are incomplete. Attempting to initialize without explicit credentials (might rely on Google Cloud default credentials)."
      );
      // Attempt to initialize without explicit credentials if running in a Google Cloud environment
      // where default credentials might be available.
      admin.initializeApp();
    }
  } catch (e: unknown) {
    // Safely check if 'e' is an Error instance to access its message
    if (e instanceof Error) {
      console.error("Failed to initialize Firebase Admin SDK:", e.message);
    } else {
      console.error("Failed to initialize Firebase Admin SDK:", e);
    }
  }
}

// Get initialized auth and firestore instances
const auth = admin.auth();
const db = admin.firestore();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Ensure Admin SDK is initialized before proceeding with operations
  if (!admin.apps.length) {
    return res.status(500).json({
      message:
        "Server configuration error: Firebase Admin SDK not initialized.",
    });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    // Step 1: Authenticate user using Firebase Authentication REST API
    // This requires your Firebase Web API Key (NOT the service account key)
    const firebaseWebApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!firebaseWebApiKey) {
      console.error("FIREBASE_API_KEY environment variable is not set.");
      return res.status(500).json({
        message: "Server configuration error: Firebase API Key missing.",
      });
    }

    const signInResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseWebApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      }
    );

    const signInData = await signInResponse.json();

    if (!signInResponse.ok) {
      console.error("Firebase Auth REST API error:", signInData.error);
      let errorMessage =
        "Authentication failed. Please check your credentials.";
      if (signInData.error && signInData.error.message) {
        switch (signInData.error.message) {
          case "EMAIL_NOT_FOUND":
          case "INVALID_PASSWORD":
            errorMessage = "Invalid email or password.";
            break;
          case "USER_DISABLED":
            errorMessage = "Your account has been disabled.";
            break;
          default:
            errorMessage = signInData.error.message;
            break;
        }
      }
      return res.status(401).json({ message: errorMessage });
    }

    const uid = signInData.localId; // The UID from the REST API response

    // Step 2: Fetch user role from Firestore
    const userDocRef = db
      .collection(`artifacts/${appId}/public/data/users`)
      .doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      console.warn(`User data not found in Firestore for UID: ${uid}`);
      // Even if user data isn't in Firestore, if they authenticated with Firebase Auth,
      // we can still proceed, perhaps with a default role, or prompt them to complete profile.
      // For now, we'll return an error.
      return res.status(404).json({
        message: "User profile not found. Please complete your registration.",
      });
    }

    const userData = userDoc.data();
    const userRole = userData?.role || "user"; // Default role if not found

    // Step 3: Generate a custom token with the user's UID and role claim
    const customToken = await auth.createCustomToken(uid, { role: userRole });

    return res.status(200).json({ token: customToken, role: userRole });
  } catch (error: unknown) {
    console.error("Login API error:", error);
    let errorMessage = "An unexpected error occurred during login.";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string"
    ) {
      // If it's an object with a 'message' property that is a string, use it.
      errorMessage = (error as { message: string }).message;
    }
    return res.status(500).json({
      message: errorMessage,
    });
  }
}
