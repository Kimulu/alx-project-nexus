"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { useJobs } from "@/context/JobsContext"; // Import useJobs hook

const Hero = () => {
  // Consume searchQuery, location, and their setters from JobsContext
  const { searchQuery, location, setSearchQuery, setLocation, searchLoading } =
    useJobs();

  // Internal state for the input fields, initialized from context state.
  // This allows the component to manage its own input values
  // while still being controlled by the context.
  const [currentInputQuery, setCurrentInputQuery] = useState(searchQuery);
  const [currentInputLocation, setCurrentInputLocation] = useState(location);

  // Update internal input states if context search state changes externally
  // (e.g., if search is cleared from another part of the app, though less likely for home Hero)
  useEffect(() => {
    setCurrentInputQuery(searchQuery);
    setCurrentInputLocation(location);
  }, [searchQuery, location]);

  const handleSearchClick = () => {
    // When search is clicked, update the context state with current input values.
    // This will trigger the JobsProvider to re-fetch jobs.
    setSearchQuery(currentInputQuery);
    setLocation(currentInputLocation);
    console.log(
      `Home page search submitted: Query='${currentInputQuery}', Location='${currentInputLocation}'`
    );
  };

  // Allow pressing Enter key to trigger search
  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };
  return (
    <section className="relative bg-[#F8F8FD] overflow-hidden">
      {/* Pattern Background */}
      <div
        className="absolute top-0 right-0 z-0 overflow-hidden"
        style={{
          width: "70%",
          height: "75%",
          transform: "translateX(10%)",
        }}
      >
        <img
          src="/pattern.svg"
          alt="Background pattern"
          className="w-full h-full object-contain object-left opacity-70"
        />
      </div>

      {/* Content */}
      {/* Adjusted py-32 to py-20 to move content up */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left Side */}
          <div className="relative">
            <h1 className="text-[42px] sm:text-[52px] md:text-[50px] lg:text-[70px] leading-[1.1] font-clash text-gray-900 mb-4">
              <div className="font-clash">Discover</div>
              <div className="font-clash">more than</div>
              <div className="relative inline-block text-[#26A4FF] font-clash">
                5000+ Jobs
                <img
                  src="/underline.png"
                  className="absolute left-0 -bottom-6 w-full max-w-[500px] pointer-events-none"
                  alt="Underline"
                />
              </div>
            </h1>
            <p className="text-gray-600 text-[16px] font-normal font-epilogue mt-6 pt-2 leading-[32px] max-w-[600px]">
              Great platform for the job seeker that is searching for new career
              heights and passionate about startups.
            </p>

            {/* New Search Section - Designed to match Figma */}
            {/* Removed pr-2 to allow background to extend fully to the right */}
            <div className="relative z-20 bg-white p-4 flex flex-col md:flex-row items-center w-full md:w-[220%] lg:w-[170%] shadow-lg mt-4">
              {/* Job Title Input */}
              <div className="flex items-center flex-grow px-10 py-3 w-full md:w-auto">
                <Search className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Job title or keyword"
                  className="flex-grow border-b border-gray-300 focus:outline-none focus:border-[#4640DE] text-gray-700 font-epilogue text-base placeholder-gray-400"
                  value={currentInputQuery} // Controlled by internal state
                  onChange={(e) => setCurrentInputQuery(e.target.value)} // Update internal state
                  onKeyPress={handleKeyPress}
                />
              </div>

              {/* Location Dropdown */}
              <div className="relative flex items-center flex-grow px-10 py-3 w-full md:w-auto md:border-l border-gray-200 mt-4 md:mt-0">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  className="flex-grow appearance-none bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#4640DE] text-gray-700 font-epilogue text-base pr-6"
                  value={currentInputLocation} // Controlled by internal state
                  onChange={(e) => setCurrentInputLocation(e.target.value)} // Update internal state
                  onKeyPress={handleKeyPress}
                >
                  <option value="" disabled hidden>
                    Select a Region
                  </option>
                  <option value="CapeTown, SouthAfrica">
                    CapeTown, SouthAfrica
                  </option>
                  <option value="London, UK">London, UK</option>
                  <option value="New York, USA">New York, USA</option>
                  <option value="Chicago, IL">Chicago, IL</option>
                  <option value="Nairobi, Kenya">Nairobi, Kenya</option>
                  <option value="Berlin, Germany">Berlin, Germany</option>
                  <option value="Lagos, Nigeria">Lagos, Nigeria</option>
                  <option value="Kampala, Uganda">Kampala, Uganda</option>
                  <option value="San Francisco, USA">San Francisco, USA</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearchClick}
                disabled={searchLoading} // Disable button while searchLoading
                className="bg-[#4640DE] text-white px-6 py-3 font-cta text-base hover:opacity-90 transition-opacity duration-200 whitespace-nowrap w-full md:w-auto mt-4 md:mt-0 md:ml-4 rounded-md" // Added rounded-md
              >
                {searchLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 text-white mr-2"
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
                    Loading...
                  </span>
                ) : (
                  "Search my job"
                )}
              </button>
            </div>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex justify-center md:justify-end relative z-10">
            <img
              src="/hero-image.png"
              alt="Illustration"
              className="mt-[-5px] w-full max-w-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
