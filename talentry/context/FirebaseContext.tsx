// src/context/FirebaseContext.tsx
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  Auth,
  User,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Define the shape of your Firebase configuration
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Define the shape of the context value
interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  userId: string | null;
  isFirebaseReady: boolean;
  firebaseError: string | null;
}

// Create the context
const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);

// Define the provider props
interface FirebaseProviderProps {
  children: ReactNode;
}

// Declare global variables for Canvas environment
// These are provided by the Canvas runtime, not standard browser globals
declare const __firebase_config: string | undefined;
declare const __initial_auth_token: string | undefined;
declare const __app_id: string | undefined;

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
}) => {
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        let firebaseConfig: FirebaseConfig;

        // Try to get config from Canvas global variable first
        // This is the preferred method in the Canvas environment if available
        if (typeof __firebase_config !== "undefined" && __firebase_config) {
          try {
            firebaseConfig = JSON.parse(__firebase_config);
            console.log("FirebaseProvider: Using global __firebase_config.");
          } catch (e) {
            console.error("FirebaseProvider: Error parsing __firebase_config:", e);
            setFirebaseError("Failed to parse Firebase configuration from global variable.");
            return;
          }
        } else {
          // Fallback to environment variables for client-side (standard Next.js way)
          console.log("FirebaseProvider: Global __firebase_config not found. Using process.env.NEXT_PUBLIC_ for Firebase Config.");
          firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
            measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "", // Optional
          };

          // Basic validation for critical config fields
          if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
            const msg = "Missing critical Firebase environment variables (API Key, Auth Domain, or Project ID). Please ensure they are set in your .env.local file and prefixed with NEXT_PUBLIC_.";
            console.error("FirebaseProvider:", msg, firebaseConfig);
            setFirebaseError(msg);
            return;
          }
        }

        let firebaseAppInstance: FirebaseApp;
        if (!getApps().length) {
          // Initialize a new Firebase app if none exists
          firebaseAppInstance = initializeApp(firebaseConfig);
        } else {
          // Otherwise, get the already initialized app
          firebaseAppInstance = getApp();
        }
        setApp(firebaseAppInstance);

        // Get Auth and Firestore instances using the initialized app
        const authInstance = getAuth(firebaseAppInstance);
        setAuth(authInstance);
        setDb(getFirestore(firebaseAppInstance));

        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
          if (user) {
            // User is signed in
            setUserId(user.uid);
            setIsFirebaseReady(true);
          } else {
            // User is not authenticated. Attempt initial sign-in.
            if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
              try {
                // Use custom token if provided by Canvas environment
                await signInWithCustomToken(authInstance, __initial_auth_token);
                // onAuthStateChanged will be triggered again with the signed-in user
              } catch (tokenError: any) {
                console.error("FirebaseProvider: Error signing in with custom token:", tokenError);
                // Fallback to anonymous sign-in if custom token fails
                try {
                  const anonymousUserCredential = await signInAnonymously(authInstance);
                  setUserId(anonymousUserCredential.user.uid);
                  setIsFirebaseReady(true);
                } catch (anonError: any) {
                  console.error("FirebaseProvider: Error signing in anonymously:", anonError);
                  setFirebaseError(`Authentication failed: ${anonError.message}`);
                  setIsFirebaseReady(false);
                }
              }
            } else {
              // No custom token, sign in anonymously
              try {
                const anonymousUserCredential = await signInAnonymously(authInstance);
                setUserId(anonymousUserCredential.user.uid);
                setIsFirebaseReady(true);
              } catch (anonError: any) {
                console.error("FirebaseProvider: Error signing in anonymously:", anonError);
                setFirebaseError(`Authentication failed: ${anonError.message}`);
                setIsFirebaseReady(false);
              }
            }
          }
        });

        // Return cleanup function for the auth state listener
        return () => unsubscribe();
      } catch (err: any) {
        console.error("FirebaseProvider: Failed to initialize Firebase or authentication:", err);
        setFirebaseError(err.message || "Failed to initialize Firebase services.");
        setIsFirebaseReady(false);
      }
    };

    initFirebase();
  }, []); // Empty dependency array means this effect runs only once on mount

  const contextValue: FirebaseContextType = {
    app,
    auth,
    db,
    userId,
    isFirebaseReady,
    firebaseError,
  };

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Custom hook to consume the context
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};
