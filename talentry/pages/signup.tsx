"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Mail, Lock, User } from "lucide-react"; // Added User icon for Full Name
import { useRouter } from "next/router"; // Import useRouter for redirection

const SignUpPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Kept for client-side validation
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Initialize useRouter

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting to sign up with:", { fullName, email, password });

      // Make a POST request to your new backend API route
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Sign up successful:", data);
        // Redirect user to the login page after successful signup
        router.push("/login");
      } else {
        // Display error message from the API response
        setError(data.message || "Sign up failed. Please try again.");
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white relative">
      {/* Left Section - Image and Testimonial */}
      {/* Hidden on mobile, visible and takes half width on large screens */}
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center bg-[#F8F8FD] p-8">
        {/* Placeholder image for the man with beard */}
        <Image
          src="/man_with_beard.png" // Ensure this path is correct relative to your 'public' folder
          alt="Man with beard"
          width={400}
          height={400}
          className="object-contain"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "https://placehold.co/400x400/E0E0E0/333333?text=Image+Error";
          }}
        />
        {/* Testimonial Card */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
          <p className="text-4xl font-bold text-[#4640DE] mb-2">100K+</p>
          <p className="text-gray-600 mb-4">People got hired</p>
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/image.png" // Ensure this path is correct relative to your 'public' folder
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

      {/* Right Section - Sign Up Form */}
      {/* Takes full width on mobile, half width on large screens */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* JobHuntly Logo - Now inside the right section, centered horizontally */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/Logo.png" // Ensure this path is correct relative to your 'public' folder
                alt="JobHuntly Logo"
                width={30}
                height={30}
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.onerror = null; // Prevent infinite loop if fallback also fails
                  e.currentTarget.src =
                    "https://placehold.co/30x30/cccccc/000000?text=Logo"; // Fallback placeholder
                }}
              />
              <span className="font-logo text-2xl font-bold text-gray-900">
                Talentry
              </span>
            </Link>
          </div>

          {/* Job Seeker / Company Toggle (Simplified for now) */}
          <div className="flex justify-center mb-6">
            <button className="px-4 py-2 rounded-l-lg bg-[#4640DE] text-white font-medium">
              Job Seeker
            </button>
            <button className="px-4 py-2 rounded-r-lg bg-gray-200 text-gray-700 font-medium">
              Company
            </button>
          </div>

          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Get more opportunities
          </h2>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Full Name Input */}
            <div>
              <label
                htmlFor="full-name"
                className="block text-sm font-medium text-gray-700 sr-only"
              >
                Full name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="full-name"
                  name="full-name"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#4640DE] focus:border-[#4640DE] sm:text-sm"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* Email Address Input */}
            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-gray-700 sr-only"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#4640DE] focus:border-[#4640DE] sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 sr-only"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#4640DE] focus:border-[#4640DE] sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 sr-only"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#4640DE] focus:border-[#4640DE] sm:text-sm"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Continue Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4640DE] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4640DE] transition-colors duration-200"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  "Continue"
                )}
              </button>
            </div>
          </form>

          {/* Already have an account? Login */}
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[#4640DE] hover:text-blue-700"
            >
              Login
            </Link>
          </p>

          {/* Terms and Privacy Policy */}
          <p className="mt-2 text-center text-xs text-gray-500">
            By clicking Continue, you acknowledge that you have read and accept
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

export default SignUpPage;
