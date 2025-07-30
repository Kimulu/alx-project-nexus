"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useJobs } from "@/context/JobsContext"; // Import useJobs hook
import FeaturedJobCard from "@/components/jobs/FeaturedJobCard"; // Import the new FeaturedJobCard

const FeaturedJobsSection = () => {
  const { featuredJobs, initialJobsLoading, initialJobsError } = useJobs();

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-clash font-bold text-gray-900">
            Featured <span className="text-[#4640DE]">jobs</span>
          </h2>
          <Link
            href="/FindJobs"
            className="flex items-center text-[#4640DE] hover:text-blue-700 font-medium transition-colors duration-200"
          >
            Show all jobs <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        {/* Job Listings Grid */}
        {initialJobsLoading ? (
          <div className="text-center py-10 text-gray-600">
            Loading featured jobs...
          </div>
        ) : initialJobsError ? (
          <div className="text-center py-10 text-red-600">
            Error: {initialJobsError}
          </div>
        ) : featuredJobs.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            No featured jobs found at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredJobs.map((job) => (
              <FeaturedJobCard // Use the new FeaturedJobCard component
                key={job.id}
                id={job.id}
                companyLogo={job.companyLogo}
                jobTitle={job.jobTitle}
                companyName={job.companyName}
                location={job.location}
                jobType={job.jobType}
                jobDescription={job.jobDescription} // Pass the jobDescription prop
                categories={job.categories}
                // Note: appliedCount and capacity are not directly used by FeaturedJobCard,
                // but you can pass them if you decide to add similar info to it later.
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedJobsSection;
