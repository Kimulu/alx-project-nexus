"use client";
import React, { useState, useEffect } from "react"; // Import useEffect for initial state
import Link from "next/link";
import { Search, MapPin, ChevronDown } from "lucide-react";

// Define the props interface for clarity and type safety
interface HeroSectionProps {
  mainTitle: React.ReactNode;
  subTitle: string;
  searchPlaceholder: string;
  searchButtonText: string;
  popularSearches: { text: string; link: string }[];
  // New props for controlled search inputs
  onSearchSubmit: (query: string, location: string) => void; // Callback to parent
  initialSearchQuery?: string; // Initial value for query input
  initialLocation?: string; // Initial value for location input
}

const HeroSection: React.FC<HeroSectionProps> = ({
  mainTitle,
  subTitle,
  searchPlaceholder,
  searchButtonText,
  popularSearches,
  onSearchSubmit, // Destructure the callback prop
  initialSearchQuery = "", // Default empty if not provided
  initialLocation = "", // Default empty if not provided
}) => {
  // Internal state for the input fields, initialized from props.
  // This allows the component to manage its own input values
  // while still being controlled by the parent's initial values.
  const [query, setQuery] = useState(initialSearchQuery);
  const [location, setLocation] = useState(initialLocation);

  // useEffect to update internal state if initial props change.
  // This is important if the parent component decides to reset or change
  // the search values from its side (e.g., navigating from another page).
  useEffect(() => {
    setQuery(initialSearchQuery);
    setLocation(initialLocation);
  }, [initialSearchQuery, initialLocation]);

  // Handler for when the search button is clicked.
  // It calls the `onSearchSubmit` function passed from the parent,
  // sending the current values of its internal `query` and `location` states.
  const handleSearchClick = () => {
    onSearchSubmit(query, location);
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
    <section className="bg-[#F8F8FD] py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl text-center">
        {/* Main Heading */}
        <h1 className="text-[42px] sm:text-[52px] md:text-[50px] lg:text-[70px] leading-[1.1] font-clash text-gray-900 mb-4">
          {mainTitle}
        </h1>

        {/* Subheading */}
        <p className="text-gray-600 text-[18px] font-normal font-epilogue mt-6 pt-2 leading-[32px] max-w-[700px] mx-auto mb-8">
          {subTitle}
        </p>

        {/* Search Section */}
        <div className="relative z-10 bg-white p-4 flex flex-col md:flex-row items-center w-full max-w-3xl mx-auto shadow-lg rounded-lg">
          {/* Search Input */}
          <div className="flex items-center flex-grow px-4 py-2 w-full md:w-auto">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="flex-grow border-b border-gray-300 focus:outline-none focus:border-[#4640DE] text-gray-700 font-epilogue text-base placeholder-gray-400"
              value={query} // Input value is controlled by internal 'query' state
              onChange={(e) => setQuery(e.target.value)} // Update internal state on change
              onKeyPress={handleKeyPress} // Added for Enter key submission
            />
          </div>

          {/* Location Dropdown - UPDATED OPTIONS TO SEND SIMPLIFIED COUNTRY NAMES */}
          <div className="relative flex items-center flex-grow px-4 py-2 w-full md:w-auto md:border-l border-gray-200 mt-4 md:mt-0">
            <MapPin className="h-5 w-5 text-gray-400 mr-2" />
            <select
              className="flex-grow appearance-none bg-transparent border-b border-gray-300 focus:outline-none focus:ring-[#4640DE] focus:border-[#4640DE] text-gray-700 font-epilogue text-base pr-6"
              value={location} // Select value is controlled by internal 'location' state
              onChange={(e) => setLocation(e.target.value)} // Update internal state on change
              onKeyPress={handleKeyPress} // Added for Enter key submission
            >
              <option value="" disabled hidden>
                Select a Region
              </option>
              <option value="Remote">Remote</option>
              <option value="US">USA</option>
              <option value="UK">UK</option>
              <option value="Kenya">Kenya</option>
              <option value="Germany">Germany</option>
              <option value="Nigeria">Nigeria</option>
              <option value="Uganda">Uganda</option>
              <option value="SouthAfrica">South Africa</option>
              <option value="France">France</option>
              <option value="Spain">Spain</option>
              <option value="Italy">Italy</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearchClick} // Calls the handler that triggers parent's onSearchSubmit
            className="bg-[#4640DE] text-white px-6 py-3 font-cta text-base hover:opacity-90 transition-opacity duration-200 whitespace-nowrap w-full md:w-auto mt-4 md:mt-0 md:ml-4 rounded-md"
          >
            {searchButtonText}
          </button>
        </div>

        {/* Popular Searches */}
        <div className="mt-8 text-gray-600 font-epilogue text-sm">
          Popular :{" "}
          {popularSearches.map((item, index) => (
            <React.Fragment key={item.text}>
              <Link href={item.link} className="text-[#4640DE] hover:underline">
                {item.text}
              </Link>
              {index < popularSearches.length - 1 && ", "}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
