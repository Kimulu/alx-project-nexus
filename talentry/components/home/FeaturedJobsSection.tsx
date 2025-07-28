"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react"; // Import ArrowRight icon
import { useJobs } from "@/context/JobsContext"; // Import useJobs hook
import JobCard from "@/components/jobs/JobCard"; // Import JobCard component

const FeaturedJobsSection = () => {
  // Consume featuredJobs and its loading/error states from JobsContext
  const { featuredJobs, initialJobsLoading, initialJobsError } = useJobs();

  if (initialJobsLoading)
    return <div className="text-center py-8">Loading featured jobs...</div>;
  if (initialJobsError)
    return (
      <div className="text-center py-8 text-red-600">
        Error loading featured jobs: {initialJobsError}
      </div>
    );

  return (
    <section className="bg-white py-16">
      {" "}
      {/* Consistent padding */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header - Uniform Style */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-clash font-bold text-gray-900">
            Featured <span className="text-[#4640DE]">Jobs</span>
          </h2>
          <Link
            href="/jobs" // Link to the main jobs page
            className="flex items-center text-[#4640DE] hover:text-blue-700 font-medium transition-colors duration-200"
          >
            Show all jobs <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredJobs.length > 0 ? (
            featuredJobs.map((job) => <JobCard key={job.id} {...job} />)
          ) : (
            <p className="col-span-full text-center text-gray-600">
              No featured jobs available at the moment.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobsSection;
