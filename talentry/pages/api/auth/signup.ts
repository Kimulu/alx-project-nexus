// pages/api/auth/signup.ts
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
    // Replace newline characters in the private key if it's stored as a single string env var
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
  console.log(
    "Firebase Admin SDK: Using credentials from environment variables."
  );
} else {
  // Fallback for Canvas environment if direct env vars are not set
  if (typeof __firebase_config !== "undefined" && __firebase_config) {
    try {
      const parsedConfig = JSON.parse(__firebase_config);
      firebaseConfig.projectId = parsedConfig.projectId; // Assuming projectId is in __firebase_config
      // Note: __firebase_config typically contains client-side keys.
      // For Admin SDK, `clientEmail` and `privateKey` are crucial.
      // If running outside Canvas with only __firebase_config, ensure these are provided.
    } catch (e) {
      console.error("Error parsing __firebase_config for Admin SDK:", e);
    }
  }
}

// Get the Canvas application ID for Firestore paths
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
      admin.initializeApp(); // For environments like Cloud Functions where it auto-initializes
    }
  } catch (e) {
    console.error("Failed to initialize Firebase Admin SDK:", e);
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

  if (!admin.apps.length) {
    return res.status(500).json({
      message:
        "Server configuration error: Firebase Admin SDK not initialized.",
    });
  }

  const { fullName, email, password, role } = req.body;

  // Basic server-side validation
  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long." });
  }

  try {
    // 1. Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: fullName,
    });

    // 2. Store additional user data in Firestore
    const userDocRef = db
      .collection(`artifacts/${appId}/public/data/users`)
      .doc(userRecord.uid);
    await userDocRef.set({
      uid: userRecord.uid,
      fullName: fullName,
      email: email,
      role: role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res
      .status(201)
      .json({ message: "User created successfully!", uid: userRecord.uid });
  } catch (error: any) {
    console.error("Firebase signup error:", error);

    let errorMessage = "An unexpected error occurred during signup.";
    if (error.code) {
      switch (error.code) {
        case "auth/email-already-exists":
          errorMessage =
            "The email address is already in use by another account.";
          break;
        case "auth/invalid-email":
          errorMessage = "The email address is not valid.";
          break;
        case "auth/weak-password":
          errorMessage =
            "The password is too weak. Please choose a stronger password.";
          break;
        case "auth/argument-error":
          errorMessage = "Invalid arguments provided for user creation.";
          break;
        default:
          errorMessage = error.message;
          break;
      }
    }
    return res.status(400).json({ message: errorMessage });
  }
}
