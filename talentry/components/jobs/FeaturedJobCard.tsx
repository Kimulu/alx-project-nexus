"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, MapPin, Briefcase } from "lucide-react"; // Icons for location and job type

// Define the props interface for the FeaturedJobCard component
interface FeaturedJobCardProps {
  id: string; // Unique ID for the job
  companyLogo: string | null; // URL or path to the company logo (can be null)
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string; // e.g., "Full-Time", "Part-Time"
  jobDescription: string; // New prop for the job description snippet
  categories: string[]; // e.g., ["Marketing", "Design"]
  // You can add more props here if needed for the featured card design
}

const FeaturedJobCard: React.FC<FeaturedJobCardProps> = ({
  id,
  companyLogo,
  jobTitle,
  companyName,
  location,
  jobType,
  jobDescription,
  categories,
}) => {
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

  // Truncate description for a snippet
  const truncateDescription = (text: string, maxLength: number) => {
    if (!text) return ""; // Handle null or undefined text
    if (text.length <= maxLength) return text;
    // Find the last space before maxLength to avoid cutting words
    const truncated = text.substring(0, maxLength);
    return (
      truncated.substring(
        0,
        Math.min(truncated.length, truncated.lastIndexOf(" "))
      ) + "..."
    );
  };

  const descriptionSnippet = truncateDescription(jobDescription, 150); // Adjust max length as needed

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 flex flex-col h-full">
      {/* Top Section: Company Logo, Title, Bookmark */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4 mt-1">
            {companyLogo && !imageLoadError ? (
              <Image
                src={companyLogo}
                alt={`${companyName} Logo`}
                width={56} // Slightly larger logo for featured card
                height={56}
                className="rounded-md object-contain"
                onError={() => setImageLoadError(true)}
              />
            ) : (
              <div
                className="w-14 h-14 rounded-md flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: placeholderBgColor }}
              >
                {companyInitial}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 font-clash leading-tight">
              {jobTitle}
            </h3>
            <p className="text-gray-600 text-sm font-epilogue mt-1">
              {companyName}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-[#4640DE] transition-colors duration-200">
          <Bookmark size={20} />
        </button>
      </div>

      {/* Job Meta Info: Location, Job Type */}
      <div className="flex items-center space-x-4 text-gray-600 text-sm font-epilogue mb-4">
        <div className="flex items-center">
          <MapPin size={16} className="mr-1 text-gray-500" />
          <span>{location}</span>
        </div>
        <div className="flex items-center">
          <Briefcase size={16} className="mr-1 text-gray-500" />
          <span>{jobType}</span>
        </div>
      </div>

      {/* Job Description Snippet */}
      <p className="text-gray-700 text-base font-epilogue mb-4 flex-grow">
        {descriptionSnippet}
      </p>

      {/* Bottom Section: Categories and View Details Button */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <span
              key={index}
              className="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
        <Link
          href={`/jobs/${id}`}
          className="text-[#4640DE] hover:text-blue-700 font-medium text-sm transition-colors duration-200 whitespace-nowrap"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default FeaturedJobCard;
