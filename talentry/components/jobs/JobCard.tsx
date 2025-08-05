"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Briefcase, Building2 } from "lucide-react"; // Importing icons for better visual representation

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
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 flex flex-col h-full">
      {/* Top Section: Company Logo/Placeholder and Job Title/Company/Location */}
      <div className="flex items-start mb-4 flex-grow-0">
        {/* Company Logo or Placeholder */}
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
        {/* Job Info (Title, Company, Location) - Removed truncate for better mobile readability */}
        <div className="flex-grow min-w-0">
          <h3 className="text-xl font-semibold text-gray-900 font-clash leading-tight mb-1">
            {jobTitle}
          </h3>
          {/* Modified: Each icon and text pair is now a flex item */}
          <div className="text-gray-600 text-sm font-epilogue flex flex-wrap items-center gap-x-3">
            <span className="flex items-center flex-shrink-0">
              <Building2 size={14} className="mr-1" />
              {companyName}
            </span>
            <span className="flex items-center flex-shrink-0">
              <MapPin size={14} className="mr-1" />
              {location}
            </span>
          </div>
        </div>
      </div>

      {/* Job Type and Categories */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full flex items-center">
          <Briefcase size={14} className="mr-1" /> {jobType}
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
      <div className="text-sm text-gray-500 font-epilogue mb-4 flex-grow">
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

      {/* View Details Button - Moved to the bottom and made full-width on mobile */}
      <div className="mt-auto">
        {" "}
        {/* Pushes the button to the bottom */}
        <Link href={`/jobs/${id}`} className="block w-full">
          <button
            className={`w-full px-4 py-2 rounded-md font-medium text-white text-base transition-colors duration-200
              ${
                isCapacityFull
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#4640DE] hover:bg-blue-700"
              }
            `}
            disabled={isCapacityFull}
          >
            {isCapacityFull ? "Full" : "View Details"}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
