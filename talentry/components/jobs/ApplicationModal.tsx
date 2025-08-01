// src/components/jobs/ApplicationModal.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  X,
  Paperclip,
  Smile,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import { motion } from "framer-motion";

// Define the props for the ApplicationModal
interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  companyName: string;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  companyName,
}) => {
  // State for form values
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [previousJobTitle, setPreviousJobTitle] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const maxAdditionalInfoChars = 500;
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

  // State for form submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // State for validation (real-time border color)
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [isFullNameValid, setIsFullNameValid] = useState(true);

  const [emailTouched, setEmailTouched] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);

  const [phoneNumberTouched, setPhoneNumberTouched] = useState(false);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(true);

  const [linkedinUrlTouched, setLinkedinUrlTouched] = useState(false);
  const [isLinkedinUrlValid, setIsLinkedinUrlValid] = useState(true);

  const [portfolioUrlTouched, setPortfolioUrlTouched] = useState(false);
  const [isPortfolioUrlValid, setIsPortfolioUrlValid] = useState(true);

  // Refs for scrolling to invalid fields
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);
  const linkedinUrlRef = useRef<HTMLInputElement>(null);
  const portfolioUrlRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Firebase state
  const [auth, setAuth] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [firebaseInitLoading, setFirebaseInitLoading] = useState(true);

  // Ref to ensure Firebase is initialized only once
  const firebaseInitializedRef = useRef(false);

  // Firebase Initialization (only for Auth)
  useEffect(() => {
    const initFirebase = async () => {
      // Ensure this runs only once
      if (firebaseInitializedRef.current) {
        console.log("initFirebase: Firebase already initialized, skipping.");
        setFirebaseInitLoading(false); // Ensure loading state is false if already initialized
        return;
      }

      console.log("initFirebase: Starting Firebase initialization...");
      setFirebaseInitLoading(true);
      try {
        const firebaseConfig = {
          apiKey: "AIzaSyAVYS8AZBU8NpzDfR0Do575nM9hpQSoA9k",
          authDomain: "talentry-c02fd.firebaseapp.com",
          projectId: "talentry-c02fd",
          storageBucket: "talentry-c02fd.firebasestorage.app",
          messagingSenderId: "611998480943",
          appId: "1:611998480943:web:f038c6bfe8c8d46630a4da",
          measurementId: "G-EDT7VVW1B2",
        };

        console.log(
          "initFirebase: Initializing Firebase app with projectId:",
          firebaseConfig.projectId
        );
        const app = initializeApp(firebaseConfig);
        console.log("initFirebase: Getting Auth instance...");
        const firebaseAuth = getAuth(app);

        setAuth(firebaseAuth);
        console.log("initFirebase: Firebase app and Auth instance set.");

        // Set up auth state listener immediately after getting auth instance
        onAuthStateChanged(firebaseAuth, async (user) => {
          if (user) {
            setCurrentUserId(user.uid);
            console.log(
              "initFirebase: Auth state changed. User UID:",
              user.uid
            );
          } else {
            // If no user, try to sign in anonymously
            try {
              if (
                typeof __initial_auth_token !== "undefined" &&
                __initial_auth_token
              ) {
                await signInWithCustomToken(firebaseAuth, __initial_auth_token);
                console.log("initFirebase: Signed in with custom token.");
                setCurrentUserId(
                  firebaseAuth.currentUser?.uid || crypto.randomUUID()
                ); // Update after sign-in
              } else {
                await signInAnonymously(firebaseAuth);
                console.log("initFirebase: Signed in anonymously.");
                setCurrentUserId(
                  firebaseAuth.currentUser?.uid || crypto.randomUUID()
                ); // Update after sign-in
              }
            } catch (authError) {
              console.error(
                "initFirebase: Error during anonymous/custom token sign-in:",
                authError
              );
              // Fallback to a random UUID if sign-in fails
              setCurrentUserId(crypto.randomUUID());
            }
          }
          setIsFirebaseReady(true);
          console.log(
            "initFirebase: Firebase is now ready (isFirebaseReady=true)."
          );
          setFirebaseInitLoading(false);
        });

        firebaseInitializedRef.current = true; // Mark Firebase as initialized
      } catch (e) {
        console.error(
          "initFirebase: Caught error during Firebase initialization or sign-in:",
          e
        );
        setSubmitMessage(
          "Failed to initialize application service. Please try again later."
        );
        setIsSuccess(false);
        setIsFirebaseReady(false);
        setFirebaseInitLoading(false);
      }
    };

    // Call initFirebase when the component mounts
    initFirebase();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Reset form and validation states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setPreviousJobTitle("");
      setLinkedinUrl("");
      setPortfolioUrl("");
      setAdditionalInfo("");
      setResumeFileName(null);
      setIsSubmitting(false);
      setSubmitMessage(null);
      setIsSuccess(false);

      // Reset all validation states
      setFullNameTouched(false);
      setIsFullNameValid(true);

      setEmailTouched(false);
      setIsEmailValid(true);

      setPhoneNumberTouched(false);
      setIsPhoneNumberValid(true);

      setLinkedinUrlTouched(false);
      setIsLinkedinUrlValid(true);

      setPortfolioUrlTouched(false);
      setIsPortfolioUrlValid(true);
    }
  }, [isOpen]);

  // --- Validation Functions ---
  const validateFullName = (name: string) => name.trim().length > 1;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex =
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
    return phoneRegex.test(phone);
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  // --- Handlers for input changes and blur events ---
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    setFullNameTouched(true);
    setIsFullNameValid(validateFullName(value));
  };

  const handleFullNameBlur = () => {
    setFullNameTouched(true);
    setIsFullNameValid(validateFullName(fullName));
  };

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

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    setPhoneNumberTouched(true);
    setIsPhoneNumberValid(validatePhoneNumber(value));
  };

  const handlePhoneNumberBlur = () => {
    setPhoneNumberTouched(true);
    setIsPhoneNumberValid(validatePhoneNumber(phoneNumber));
  };

  const handleLinkedinUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLinkedinUrl(value);
    setLinkedinUrlTouched(true);
    setIsLinkedinUrlValid(validateUrl(value));
  };

  const handleLinkedinUrlBlur = () => {
    setLinkedinUrlTouched(true);
    setIsLinkedinUrlValid(validateUrl(linkedinUrl));
  };

  const handlePortfolioUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPortfolioUrl(value);
    setPortfolioUrlTouched(true);
    setIsPortfolioUrlValid(validateUrl(value));
  };

  const handlePortfolioUrlBlur = () => {
    setPortfolioUrlTouched(true);
    setIsPortfolioUrlValid(validateUrl(portfolioUrl));
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFileName(e.target.files[0].name);
      // In a real application, you would also handle file upload here.
    } else {
      setResumeFileName(null);
    }
  };

  // Custom smooth scroll function
  const smoothScrollTo = (
    targetElement: HTMLElement,
    duration: number,
    offset: number
  ) => {
    const container = modalContentRef.current;
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

  // --- Form Submission Logic ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    // Re-validate all fields on submit and set touched state
    const finalFullNameValid = validateFullName(fullName);
    const finalEmailValid = validateEmail(email);
    const finalPhoneNumberValid = validatePhoneNumber(phoneNumber);
    const finalLinkedinUrlValid = validateUrl(linkedinUrl);
    const finalPortfolioUrlValid = validateUrl(portfolioUrl);

    setFullNameTouched(true);
    setEmailTouched(true);
    setPhoneNumberTouched(true);
    setLinkedinUrlTouched(true);
    setPortfolioUrlTouched(true);

    setIsFullNameValid(finalFullNameValid);
    setIsEmailValid(finalEmailValid);
    setIsPhoneNumberValid(finalPhoneNumberValid);
    setIsLinkedinUrlValid(finalLinkedinUrlValid);
    setIsPortfolioUrlValid(finalPortfolioUrlValid);

    // Collect all invalid fields and their refs
    const invalidFields: { ref: React.RefObject<HTMLInputElement> }[] = [];
    if (!finalFullNameValid) invalidFields.push({ ref: fullNameRef });
    if (!finalEmailValid) invalidFields.push({ ref: emailRef });
    if (!finalPhoneNumberValid) invalidFields.push({ ref: phoneNumberRef });
    if (!finalLinkedinUrlValid && linkedinUrl)
      invalidFields.push({ ref: linkedinUrlRef });
    if (!finalPortfolioUrlValid && portfolioUrl)
      invalidFields.push({ ref: portfolioUrlRef });

    // Check overall form validity
    const isFormValid =
      finalFullNameValid &&
      finalEmailValid &&
      finalPhoneNumberValid &&
      finalLinkedinUrlValid &&
      finalPortfolioUrlValid;

    // IMPORTANT: Check if Firebase Auth is ready and userId is available
    console.log(
      `handleSubmit: currentUserId=${!!currentUserId}, isFirebaseReady=${isFirebaseReady}`
    );
    if (!currentUserId || !isFirebaseReady) {
      setSubmitMessage(
        "Application service not ready. Please try again or refresh the page."
      );
      setIsSuccess(false);
      setIsSubmitting(false);
      console.error(
        "handleSubmit: Firebase Auth is not ready or currentUserId is null."
      );
      return;
    }

    if (!isFormValid) {
      setSubmitMessage("Please fill in all required fields correctly.");
      setIsSuccess(false);
      setIsSubmitting(false);

      if (invalidFields.length > 0 && invalidFields[0].ref.current) {
        smoothScrollTo(invalidFields[0].ref.current, 800, 80);
      }
      return;
    }

    try {
      // Make a POST request to your new API endpoint
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          jobTitle,
          companyName,
          applicantName: fullName,
          applicantEmail: email,
          applicantPhone: phoneNumber,
          previousJobTitle,
          linkedinUrl,
          portfolioUrl,
          additionalInfo,
          userId: currentUserId, // Pass the current user ID to the backend
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage("Application submitted successfully!");
        setIsSuccess(true);
      } else {
        setSubmitMessage(
          data.error || "Failed to submit application. Please try again."
        );
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      setSubmitMessage("Failed to submit application. Please try again.");
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // --- Framer Motion Variants ---
  const inputBorderVariants = {
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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalContentRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        {/* Job Header Info */}
        <div className="flex items-center mb-6">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold mr-4"
            style={{ backgroundColor: "#4640DE" }}
          >
            {companyName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 font-clash">
              {jobTitle}
            </h2>
            <p className="text-gray-600 text-sm">
              {companyName} • Paris, France • Full-Time
            </p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Submit your application
        </h3>
        <p className="text-gray-600 text-sm mb-6">
          The following is required and will only be shared with {companyName}
        </p>

        {/* Display messages */}
        {submitMessage && (
          <div
            className={`p-3 mb-4 rounded-md text-sm ${
              isSuccess
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {submitMessage}
          </div>
        )}
        {firebaseInitLoading && (
          <div className="p-3 mb-4 rounded-md text-sm bg-blue-100 text-blue-700">
            Loading application service... Please wait.
          </div>
        )}

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <motion.input
                  ref={fullNameRef}
                  type="text"
                  id="fullName"
                  className="block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={handleFullNameChange}
                  onBlur={handleFullNameBlur}
                  variants={inputBorderVariants}
                  animate={getAnimationState(fullNameTouched, isFullNameValid)}
                  transition={{ duration: 0.2 }}
                  initial={false}
                />
                {fullNameTouched &&
                  (isFullNameValid ? (
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
              {fullNameTouched && !isFullNameValid && (
                <p className="mt-1 text-sm text-red-500">
                  Full name is required.
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <motion.input
                  ref={emailRef}
                  type="email"
                  id="email"
                  className="block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  required
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
                <p className="mt-1 text-sm text-red-500">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <motion.input
                  ref={phoneNumberRef}
                  type="tel"
                  id="phoneNumber"
                  className="block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  onBlur={handlePhoneNumberBlur}
                  required
                  variants={inputBorderVariants}
                  animate={getAnimationState(
                    phoneNumberTouched,
                    isPhoneNumberValid
                  )}
                  transition={{ duration: 0.2 }}
                  initial={false}
                />
                {phoneNumberTouched &&
                  (isPhoneNumberValid ? (
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
              {phoneNumberTouched && !isPhoneNumberValid && (
                <p className="mt-1 text-sm text-red-500">
                  Please enter a valid phone number (e.g., +1234567890).
                </p>
              )}
            </div>

            {/* Current/Previous Job Title (Optional, no complex validation) */}
            <div>
              <label
                htmlFor="previousJobTitle"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Current or previous job title
              </label>
              <input
                type="text"
                id="previousJobTitle"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="What's your current or previous job title?"
                value={previousJobTitle}
                onChange={(e) => setPreviousJobTitle(e.target.value)}
              />
            </div>

            {/* LINKS Section */}
            <div className="pt-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">LINKS</h3>
              {/* LinkedIn URL (Optional, with URL validation) */}
              <div className="mb-4">
                <label
                  htmlFor="linkedinUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  LinkedIn URL
                </label>
                <div className="relative">
                  <motion.input
                    ref={linkedinUrlRef}
                    type="url"
                    id="linkedinUrl"
                    className="block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                    placeholder="Link to your LinkedIn URL"
                    value={linkedinUrl}
                    onChange={handleLinkedinUrlChange}
                    onBlur={handleLinkedinUrlBlur}
                    variants={inputBorderVariants}
                    animate={getAnimationState(
                      linkedinUrlTouched,
                      isLinkedinUrlValid
                    )}
                    transition={{ duration: 0.2 }}
                    initial={false}
                  />
                  {linkedinUrlTouched &&
                    (isLinkedinUrlValid ? (
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
                {linkedinUrlTouched && !isLinkedinUrlValid && (
                  <p className="mt-1 text-sm text-red-500">
                    Please enter a valid URL (e.g., https://example.com).
                  </p>
                )}
              </div>

              {/* Portfolio URL (Optional, with URL validation) */}
              <div>
                <label
                  htmlFor="portfolioUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Portfolio URL
                </label>
                <div className="relative">
                  <motion.input
                    ref={portfolioUrlRef}
                    type="url"
                    id="portfolioUrl"
                    className="block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                    placeholder="Link to your portfolio URL"
                    value={portfolioUrl}
                    onChange={handlePortfolioUrlChange}
                    onBlur={handlePortfolioUrlBlur}
                    variants={inputBorderVariants}
                    animate={getAnimationState(
                      portfolioUrlTouched,
                      isPortfolioUrlValid
                    )}
                    transition={{ duration: 0.2 }}
                    initial={false}
                  />
                  {portfolioUrlTouched &&
                    (isPortfolioUrlValid ? (
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
                {portfolioUrlTouched && !isPortfolioUrlValid && (
                  <p className="mt-1 text-sm text-red-500">
                    Please enter a valid URL (e.g., https://example.com).
                  </p>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="pt-4">
              <label
                htmlFor="additionalInfo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Additional information
              </label>
              <div className="border border-gray-300 rounded-md shadow-sm overflow-hidden">
                <div className="flex items-center border-b border-gray-200 bg-gray-50 p-2 space-x-2">
                  <button
                    type="button"
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                  >
                    <Smile size={18} />
                  </button>
                  <button
                    type="button"
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                  >
                    <Bold size={18} />
                  </button>
                  <button
                    type="button"
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                  >
                    <Italic size={18} />
                  </button>
                  <button
                    type="button"
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                  >
                    <List size={18} />
                  </button>
                  <button
                    type="button"
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                  >
                    <ListOrdered size={18} />
                  </button>
                  <button
                    type="button"
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                  >
                    <LinkIcon size={18} />
                  </button>
                </div>
                <textarea
                  id="additionalInfo"
                  rows={5}
                  className="block w-full p-4 resize-y focus:outline-none sm:text-sm"
                  placeholder="Add a cover letter or anything else you want to share"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  maxLength={maxAdditionalInfoChars}
                ></textarea>
                <div className="flex justify-between items-center p-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
                  <span>Maximum {maxAdditionalInfoChars} characters</span>
                  <span>
                    {additionalInfo.length} / {maxAdditionalInfoChars}
                  </span>
                </div>
              </div>
            </div>

            {/* Attach Resume/CV */}
            <div className="pt-4">
              <label
                htmlFor="resume"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Attach your resume
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-400 transition-colors duration-200 cursor-pointer">
                <input
                  type="file"
                  id="resume"
                  className="hidden"
                  onChange={handleResumeFileChange}
                />
                <label
                  htmlFor="resume"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[#4640DE] bg-blue-50 hover:bg-blue-100 cursor-pointer"
                >
                  <Paperclip size={16} className="mr-2" /> Attach Resume/CV
                </label>
                {resumeFileName && (
                  <p className="mt-2 text-sm text-gray-700">
                    Selected file:{" "}
                    <span className="font-semibold">{resumeFileName}</span>
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Only PDF, DOCX, or DOC files allowed (max 5MB)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-md font-semibold text-lg mt-6
                ${
                  isSubmitting || firebaseInitLoading || !isFirebaseReady
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-[#4640DE] text-white hover:bg-blue-700 transition-colors duration-200"
                }`}
              disabled={isSubmitting || firebaseInitLoading || !isFirebaseReady}
            >
              {isSubmitting
                ? "Submitting..."
                : firebaseInitLoading
                ? "Loading Service..."
                : "Submit Application"}
            </button>

            {/* Terms and Privacy Policy */}
            <p className="mt-4 text-center text-xs text-gray-500">
              By sending the request you can confirm that you accept our{" "}
              <Link href="#" className="text-[#4640DE] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-[#4640DE] hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl font-semibold text-gray-900 mb-4">
              Application Submitted!
            </p>
            <p className="text-gray-600 mb-6">
              Thank you for your application. We will review it shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-4 bg-[#4640DE] text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationModal;
