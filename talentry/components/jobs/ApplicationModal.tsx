"use client";
import React, { useState, useEffect, useRef } from "react";
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
import { motion } from "framer-motion";
import { useFirebase } from "../../context/FirebaseContext"; // Import the hook

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
  // Use the Firebase context
  const {
    userId: currentUserId,
    isFirebaseReady,
    firebaseError,
  } = useFirebase();

  // ... (rest of your state variables)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [previousJobTitle, setPreviousJobTitle] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const maxAdditionalInfoChars = 500;

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [isResumeValid, setIsResumeValid] = useState(true);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);
  const linkedinUrlRef = useRef<HTMLInputElement>(null);
  const portfolioUrlRef = useRef<HTMLInputElement>(null);
  const resumeFileRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Add a loading state based on the context's readiness
  const firebaseInitLoading = !isFirebaseReady && !firebaseError;

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
      setResumeFile(null); // Reset resume file
      setResumeFileName(null); // Reset resume file name
      setIsResumeValid(true); // Reset resume validation
      setResumeError(null); // Reset resume error
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
    if (!url) return true; // URL is optional, so empty is valid
    try {
      new URL(url); // Check if it's a valid URL format
      return url.startsWith("http://") || url.startsWith("https://"); // Ensure it has a protocol
    } catch (err) {
      console.log(err);
      return false;
      // Invalid URL format
    }
  };

  const validateResumeFile = (file: File | null) => {
    if (!file) {
      // Resume is now mandatory
      setResumeError("Resume/CV is required."); // Set error message
      return false;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setResumeError("Only PDF, DOCX, or DOC files are allowed.");
      return false;
    }

    if (file.size > maxSize) {
      setResumeError("File size exceeds 5MB limit.");
      return false;
    }

    setResumeError(null);
    return true;
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
    setPortfolioUrlTouched(true); // Corrected from setPortfolioTouched
    setIsPortfolioUrlValid(validateUrl(portfolioUrl));
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeFile(file);
      setResumeFileName(file.name);
      const isValid = validateResumeFile(file);
      setIsResumeValid(isValid);
    } else {
      setResumeFile(null);
      setResumeFileName(null);
      setIsResumeValid(validateResumeFile(null)); // Re-validate to show "required" error
      // No need to setResumeError here, validateResumeFile handles it
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
    const finalResumeValid = validateResumeFile(resumeFile); // Validate resume on submit

    setFullNameTouched(true);
    setEmailTouched(true);
    setPhoneNumberTouched(true);
    setLinkedinUrlTouched(true);
    setPortfolioUrlTouched(true);
    // No explicit 'touched' state for resume, validation is always active if file exists

    setIsFullNameValid(finalFullNameValid);
    setIsEmailValid(finalEmailValid);
    setIsPhoneNumberValid(finalPhoneNumberValid);
    setIsLinkedinUrlValid(finalLinkedinUrlValid);
    setIsPortfolioUrlValid(finalPortfolioUrlValid);
    setIsResumeValid(finalResumeValid); // Ensure this state is updated for UI feedback

    // Collect all invalid fields and their refs
    // FIX: Updated the type of 'ref' to explicitly include HTMLInputElement, HTMLDivElement, and null
    const invalidFields: {
      ref: React.RefObject<HTMLInputElement | HTMLDivElement | null>;
    }[] = [];
    if (!finalFullNameValid) invalidFields.push({ ref: fullNameRef });
    if (!finalEmailValid) invalidFields.push({ ref: emailRef });
    if (!finalPhoneNumberValid) invalidFields.push({ ref: phoneNumberRef });
    if (!finalLinkedinUrlValid && linkedinUrl)
      invalidFields.push({ ref: linkedinUrlRef });
    if (!finalPortfolioUrlValid && portfolioUrl)
      invalidFields.push({ ref: portfolioUrlRef });
    if (!finalResumeValid) invalidFields.push({ ref: resumeFileRef }); // Add resume file input to invalid fields

    // Check overall form validity
    const isFormValid =
      finalFullNameValid &&
      finalEmailValid &&
      finalPhoneNumberValid &&
      finalLinkedinUrlValid &&
      finalPortfolioUrlValid &&
      finalResumeValid;

    // IMPORTANT: Check if Firebase Auth is ready and userId is available
    console.log(
      `handleSubmit: currentUserId=${!!currentUserId}, isFirebaseReady=${isFirebaseReady}, firebaseError=${firebaseError}`
    );

    if (firebaseError) {
      setSubmitMessage(`Application service error: ${firebaseError}`);
      setIsSuccess(false);
      setIsSubmitting(false);
      return;
    }

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
      setSubmitMessage(
        "Please fill in all required fields correctly and ensure your resume is valid."
      );
      setIsSuccess(false);
      setIsSubmitting(false);

      if (invalidFields.length > 0 && invalidFields[0].ref.current) {
        smoothScrollTo(invalidFields[0].ref.current, 800, 80);
      }
      return;
    }

    // Prepare resume details for the payload
    const resumeDetails = resumeFile
      ? {
          fileName: resumeFile.name,
          fileType: resumeFile.type,
          fileSize: resumeFile.size,
        }
      : null;

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
          resumeDetails, // Include resume details here
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
    valid: { borderColor: "#22C55E" }, // green-500 (corrected hex code)
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
        {firebaseError && (
          <div className="p-3 mb-4 rounded-md text-sm bg-red-100 text-red-700">
            Error: {firebaseError}
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
                  className="block w-full px-4 py-2 border-0 focus:ring-0 focus:outline-none sm:text-sm resize-y"
                  placeholder="Add a cover letter or any other information here"
                  value={additionalInfo}
                  onChange={(e) => {
                    if (e.target.value.length <= maxAdditionalInfoChars) {
                      setAdditionalInfo(e.target.value);
                    }
                  }}
                ></textarea>
                <div className="text-right text-xs text-gray-500 p-2 border-t border-gray-200">
                  {additionalInfo.length}/{maxAdditionalInfoChars} characters
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div className="pt-4">
              <label
                htmlFor="resumeFile"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Upload Resume/CV <span className="text-red-500">*</span>
              </label>
              <div
                className={`flex items-center justify-between p-3 border rounded-md shadow-sm ${
                  !isResumeValid ? "border-red-500" : "border-gray-300"
                }`}
              >
                <input
                  ref={resumeFileRef} // Attach ref here
                  type="file"
                  id="resumeFile"
                  accept=".pdf,.doc,.docx"
                  className="hidden" // Hide the default file input
                  onChange={handleResumeFileChange}
                />
                <label
                  htmlFor="resumeFile"
                  className="flex items-center text-[#4640DE] cursor-pointer hover:underline text-sm"
                >
                  <Paperclip size={16} className="mr-2" />
                  {resumeFileName || "Attach file (PDF, DOC, DOCX - max 5MB)"}
                </label>
                {resumeFileName && (
                  <button
                    type="button"
                    onClick={() => {
                      setResumeFile(null);
                      setResumeFileName(null);
                      setIsResumeValid(validateResumeFile(null)); // Re-validate to show "required" error
                      if (resumeFileRef.current) {
                        resumeFileRef.current.value = ""; // Clear the file input
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-sm ml-4"
                  >
                    Remove
                  </button>
                )}
              </div>
              {!isResumeValid && resumeError && (
                <p className="mt-1 text-sm text-red-500">{resumeError}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting || firebaseInitLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#4640DE] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4640DE] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white mr-3"
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
                  "Submit Application"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-10">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Application Sent!
            </h3>
            <p className="text-gray-600 mb-6">
              Your application for &quot;{jobTitle}&quot; at {companyName} has
              been successfully submitted.
            </p>
            <button
              onClick={onClose}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#4640DE] hover:bg-blue-700 transition-colors duration-200"
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
