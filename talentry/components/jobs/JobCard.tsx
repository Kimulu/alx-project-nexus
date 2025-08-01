"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// Define the props interface for the JobCard component
interface JobCardProps {
  id: string; // Unique ID for the job
  companyLogo: string | null; // URL or path to the company logo (can be null)
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string; // e.g., "Full-Time", "Part-Time"
  categories: string[]; // e.g., ["Marketing", "Design"]
  appliedCount: number;
  capacity: number;
  // NEW: Added linkToCompanyProfile to the interface
  linkToCompanyProfile?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({
  id,
  companyLogo,
  jobTitle,
  companyName,
  location,
  jobType,
  categories,
  appliedCount,
  capacity,
}) => {
  const isCapacityFull = appliedCount >= capacity;

  // Function to generate a random pastel-like color for the placeholder
  const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`; // Light, desaturated colors for better readability
  };

  const placeholderBgColor = getRandomColor();
  // Get the first letter of the company name, or '?' if companyName is empty
  const companyInitial = companyName
    ? companyName.charAt(0).toUpperCase()
    : "?";

  // State to manage if the image has failed to load, triggering the fallback
  const [imageLoadError, setImageLoadError] = useState(false);

  // Reset imageLoadError when companyLogo prop changes
  useEffect(() => {
    setImageLoadError(false);
  }, [companyLogo]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        {/* Company Logo or Placeholder and Job Info */}
        <div className="flex items-start flex-grow min-w-0">
          {" "}
          {/* Added flex-grow and min-w-0 */}
          <div className="flex-shrink-0 mr-4 mt-1">
            {companyLogo && !imageLoadError ? (
              <Image
                src={companyLogo}
                alt={`${companyName} Logo`}
                width={48}
                height={48}
                className="rounded-md object-contain"
                onError={() => setImageLoadError(true)}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-md flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: placeholderBgColor }}
              >
                {companyInitial}
              </div>
            )}
          </div>
          <div className="flex-grow min-w-0">
            {" "}
            {/* Added flex-grow and min-w-0 */}
            <h3 className="text-xl font-semibold text-gray-900 font-clash leading-tight truncate">
              {" "}
              {/* Added truncate */}
              {jobTitle}
            </h3>
            <p className="text-gray-600 text-sm font-epilogue mt-1 truncate">
              {" "}
              {/* Added truncate */}
              {companyName} • {location}
            </p>
          </div>
        </div>

        {/* Apply Button Container - Ensure it doesn't shrink */}
        <div className="flex-shrink-0 ml-4">
          {" "}
          {/* Added flex-shrink-0 and ml-4 for spacing */}
          <Link href={`/jobs/${id}`}>
            {" "}
            {/* Changed to /jobs/${id} for consistency with FeaturedJobCard */}
            <button
              className={`px-4 py-2 rounded-md font-medium text-white text-sm transition-colors duration-200 whitespace-nowrap
                ${
                  isCapacityFull
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#4640DE] hover:bg-blue-700"
                }
              `}
              disabled={isCapacityFull}
            >
              {isCapacityFull ? "Full" : "View Details"}{" "}
              {/* Changed text to View Details */}
            </button>
          </Link>
        </div>
      </div>

      {/* Job Type and Categories */}
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
          {jobType}
        </span>
        {categories.map((category, index) => (
          <span
            key={index}
            className="text-xs font-medium text-gray-700 bg-gray-100 bg-opacity-70 px-3 py-1 rounded-full"
          >
            {category}
          </span>
        ))}
      </div>

      {/* Application Status */}
      <div className="text-sm text-gray-500 font-epilogue">
        <span
          className={`${
            isCapacityFull
              ? "text-red-500 font-semibold"
              : "text-[#4640DE] font-semibold"
          }`}
        >
          {appliedCount} applied
        </span>{" "}
        of {capacity} capacity
      </div>
    </div>
  );
};

export default JobCard;
