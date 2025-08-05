// src/app/login/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFirebase } from "@/context/FirebaseContext"; // Adjust path as needed
import {
  signInWithEmailAndPassword,
  signInWithCustomToken,
} from "firebase/auth";
import { motion, Variants } from "framer-motion";
import {
  Mail,
  Lock,
  LogIn,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import Link from "next/link"; // Import Link for navigation
import Image from "next/image"; // Import Image for the logo and testimonial image

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(""); // Renamed from 'error' to match SignUpPage
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  // Validation states
  const [emailTouched, setEmailTouched] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  // Refs for scrolling to invalid fields (if needed, though login usually has fewer fields)
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null); // Ref for the form container for scrolling

  const router = useRouter();
  const { auth, currentUser, isFirebaseReady, loadingAuth } = useFirebase();

  // Framer Motion Variants for input border color
  const inputBorderVariants: Variants = {
    default: { borderColor: "#D1D5DB" }, // gray-300
    invalid: { borderColor: "#EF4444" }, // red-500
    valid: { borderColor: "#22C55E" }, // green-500
  };

  // Helper function to get the current animation state for an input
  const getAnimationState = (touched: boolean, valid: boolean) => {
    if (touched) {
      return valid ? "valid" : "invalid";
    }
    return "default";
  };

  // Custom smooth scroll function (copied from SignUpPage)
  const smoothScrollTo = (
    targetElement: HTMLElement,
    duration: number,
    offset: number
  ) => {
    const container = formRef.current;
    if (!container) return;

    const startScrollTop = container.scrollTop;
    const targetOffsetTop =
      targetElement.offsetTop - container.offsetTop - offset;
    const distance = targetOffsetTop - startScrollTop;
    let startTime: number | null = null;

    const animateScroll = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;
      const easedProgress =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;
      container.scrollTop = startScrollTop + distance * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    requestAnimationFrame(animateScroll);
  };

  // --- Validation Functions ---
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const validatePassword = (password: string) => password.length >= 6; // Minimum 6 characters for consistency

  // --- Handlers for input changes and blur events ---
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailTouched(true);
    setIsEmailValid(validateEmail(value));
  };
  const handleEmailBlur = () => {
    setEmailTouched(true);
    setIsEmailValid(validateEmail(email));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordTouched(true);
    setIsPasswordValid(validatePassword(value));
  };
  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setIsPasswordValid(validatePassword(password));
  };

  // Effect to handle redirection if already logged in
  useEffect(() => {
    // Wait until Firebase auth state is fully loaded
    if (loadingAuth) {
      return;
    }

    // If Firebase is ready and a user is already authenticated, redirect to dashboard
    if (isFirebaseReady && currentUser) {
      console.log(
        "Login Page: Already authenticated, redirecting to dashboard."
      );
      router.push("/ApplicantDashboard");
    }
  }, [loadingAuth, isFirebaseReady, currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiError(""); // Clear previous errors

    // Set all fields as touched and re-validate
    setEmailTouched(true);
    setPasswordTouched(true);

    const finalEmailValid = validateEmail(email);
    const finalPasswordValid = validatePassword(password);

    setIsEmailValid(finalEmailValid);
    setIsPasswordValid(finalPasswordValid);

    const isFormValid = finalEmailValid && finalPasswordValid;

    // Collect invalid fields and scroll to the first one
    const invalidFields: { ref: React.RefObject<HTMLInputElement | null> }[] =
      [];
    if (!finalEmailValid) invalidFields.push({ ref: emailRef });
    if (!finalPasswordValid) invalidFields.push({ ref: passwordRef });

    if (!isFormValid) {
      setApiError("Please correct the errors in the form.");
      setLoading(false);
      if (invalidFields.length > 0 && invalidFields[0].ref.current) {
        smoothScrollTo(invalidFields[0].ref.current, 800, 80);
      }
      return;
    }

    if (!auth) {
      setApiError("Firebase Auth instance not available.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Call your backend API to get a custom token
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the backend API returns an error, display it
        setApiError(data.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      const { token: customToken, role: userRole } = data;

      // Step 2: Sign in with the custom token on the client side
      await signInWithCustomToken(auth, customToken);

      console.log("User logged in successfully with custom token!");
      console.log("User role:", userRole); // You can use this role for client-side routing/permissions

      // Step 3: Redirect to the applicant dashboard upon successful login
      router.push("/ApplicantDashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      // Handle Firebase client-side errors (though most should be caught by backend API)
      setApiError(err.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  // If Firebase is still loading auth state and we're not yet sure if user is logged in,
  // we can show a minimal loading state or nothing, as the useEffect will handle redirect.
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#4640DE]" size={48} />
        <p className="ml-4 text-lg text-gray-700">Checking authentication...</p>
      </div>
    );
  }

  // If a user is already logged in, the useEffect will have redirected them.
  // So, if we reach here, it means no user is logged in, and we can show the login form.
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white relative">
      {/* Left Section - Image and Testimonial (Copied from SignUpPage) */}
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center bg-[#F8F8FD] p-8">
        <Image
          src="/man_with_beard.png" // Placeholder for man_with_beard.png
          alt="Man with beard"
          width={200}
          height={100}
          className="object-contain w-full h-[750px]"
          priority
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "https://placehold.co/400x400/E0E0E0/333333?text=Image+Error";
          }}
        />
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
          <p className="text-4xl font-bold text-[#4640DE] mb-2">100K+</p>
          <p className="text-gray-600 mb-4">People got hired</p>
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/image.png" // Placeholder for image.png
              alt="Adam Sandler"
              width={40}
              height={40}
              className="rounded-full mr-2"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://placehold.co/40x40/4640DE/ffffff?text=AS";
              }}
            />
            <div>
              <p className="font-semibold text-gray-900">Adam Sandler</p>
              <p className="text-sm text-gray-500">Lead Engineer at Canva</p>
            </div>
          </div>
          <p className="italic text-gray-700">
            "Great platform for the job seeker that searching for new career
            heights."
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Title (Copied from SignUpPage) */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/Logo.png" // Placeholder for Logo.png
                alt="Talentry Logo"
                width={30}
                height={30}
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://placehold.co/30x30/cccccc/000000?text=Logo";
                }}
              />
              <span className="font-logo text-2xl font-bold text-gray-900">
                Talentry
              </span>
            </Link>
          </div>

          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              href="/signup" // Changed to /signup
              className="font-medium text-[#4640DE] hover:text-blue-700" // Adjusted hover color
            >
              create a new account
            </Link>
          </p>

          <form
            ref={formRef}
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
          >
            {apiError && (
              <motion.div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
                variants={{ initial: { x: 0 }, shake: { x: [0, -10, 10, 0] } }}
                animate={apiError ? "shake" : "initial"}
                transition={{ duration: 0.2 }}
              >
                <span className="block sm:inline">{apiError}</span>
              </motion.div>
            )}

            {/* Email Address Input */}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <motion.input
                  ref={emailRef}
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full pl-10 pr-10 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#4640DE] focus:border-[#4640DE] sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  variants={inputBorderVariants}
                  animate={getAnimationState(emailTouched, isEmailValid)}
                  transition={{ duration: 0.2 }}
                  initial={false}
                />
                {emailTouched &&
                  (isEmailValid ? (
                    <CheckCircle
                      size={18}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"
                    />
                  ) : (
                    <AlertCircle
                      size={18}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500"
                    />
                  ))}
              </div>
              {emailTouched && !isEmailValid && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs mt-1"
                >
                  Please enter a valid email address.
                </motion.p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <motion.input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full pl-10 pr-10 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#4640DE] focus:border-[#4640DE] sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  variants={inputBorderVariants}
                  animate={getAnimationState(passwordTouched, isPasswordValid)}
                  transition={{ duration: 0.2 }}
                  initial={false}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {passwordTouched &&
                  (isPasswordValid ? (
                    <CheckCircle
                      size={18}
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 text-green-500"
                    />
                  ) : (
                    <AlertCircle
                      size={18}
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 text-red-500"
                    />
                  ))}
              </div>
              {passwordTouched && !isPasswordValid && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs mt-1"
                >
                  Password must be at least 6 characters long.
                </motion.p>
              )}
            </div>

            {/* Forgot password */}
            <div className="flex items-center justify-end">
              {" "}
              {/* Used justify-end to align to right */}
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-[#4640DE] hover:text-blue-700" // Adjusted hover color
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4640DE] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4640DE] transition-colors duration-200" // Adjusted button padding and hover color
                disabled={loading}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white mr-2" // Added mr-2 for spacing
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <LogIn className="mr-2" size={20} /> // Added mr-2 for spacing
                )}
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>

          {/* Terms and Privacy Policy (Copied from SignUpPage) */}
          <p className="mt-2 text-center text-xs text-gray-500">
            By clicking Sign In, you acknowledge that you have read and accept
            the{" "}
            <Link href="#" className="text-[#4640DE] hover:text-blue-700">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-[#4640DE] hover:text-blue-700">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
