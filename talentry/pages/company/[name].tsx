// pages/company/[name].tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { MapPin, Briefcase, Users, Globe } from "lucide-react"; // Icons for company info
import JobFilterAndListings from "@/components/jobs/JobFilterAndListings"; // Reuse job listings component
import Link from "next/link";

// Define a minimal Company interface for display
interface CompanyDetails {
  name: string;
  logo: string | null;
  location: string;
  industry: string;
  employeeCount: string;
  website: string;
  description: string;
  // Add more fields as needed
}

const CompanyProfilePage: React.FC = () => {
  const router = useRouter();
  const { name: companyNameParam } = router.query; // Get company name from URL

  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(
    null
  );
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [errorCompany, setErrorCompany] = useState<string | null>(null);

  // Mock company details for demonstration
  // In a real application, you would fetch this from a dedicated /api/company/[name] endpoint
  useEffect(() => {
    if (companyNameParam) {
      setLoadingCompany(true);
      setErrorCompany(null);
      // Simulate fetching company details
      setTimeout(() => {
        const decodedCompanyName = decodeURIComponent(
          companyNameParam as string
        );
        const mockDetails: CompanyDetails = {
          name: decodedCompanyName,
          logo: null, // We'll use the first letter fallback
          location: "Global", // Example
          industry: "Technology", // Example
          employeeCount: "1,000-5,000", // Example
          website: `https://${decodedCompanyName
            .toLowerCase()
            .replace(/\s/g, "")}.com`, // Example
          description: `Welcome to ${decodedCompanyName}! We are a leading company in the ${"Technology"} industry, dedicated to innovation and excellence. We believe in fostering a collaborative and inclusive environment where our employees can thrive and make a significant impact. Join us to build the future!`,
        };
        setCompanyDetails(mockDetails);
        setLoadingCompany(false);
      }, 500);
    }
  }, [companyNameParam]);

  // Function to generate a random pastel-like color for the placeholder
  const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
  };

  if (!companyNameParam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading company name...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-24">
      {" "}
      {/* Added pt-24 for header spacing */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {loadingCompany ? (
          <div className="text-center py-10 text-gray-600">
            Loading company details...
          </div>
        ) : errorCompany ? (
          <div className="text-center py-10 text-red-600">
            Error: {errorCompany}
          </div>
        ) : companyDetails ? (
          <>
            {/* Company Header Section */}
            <section className="bg-gray-50 p-8 rounded-lg shadow-sm mb-12 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Company Logo/Initial */}
              <div
                className="w-24 h-24 rounded-lg flex items-center justify-center text-white text-4xl font-bold flex-shrink-0"
                style={{ backgroundColor: getRandomColor() }}
              >
                {companyDetails.name.charAt(0).toUpperCase()}
              </div>

              {/* Company Info */}
              <div className="text-center md:text-left flex-grow">
                <h1 className="text-4xl font-bold font-clash text-gray-900 mb-2">
                  {companyDetails.name}
                </h1>
                <p className="text-gray-600 text-lg font-epilogue mb-4">
                  {companyDetails.description}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 text-gray-700 text-sm">
                  <div className="flex items-center">
                    <MapPin size={18} className="mr-2 text-gray-500" />
                    <span>{companyDetails.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Briefcase size={18} className="mr-2 text-gray-500" />
                    <span>{companyDetails.industry}</span>
                  </div>
                  <div className="flex items-center">
                    <Users size={18} className="mr-2 text-gray-500" />
                    <span>{companyDetails.employeeCount} Employees</span>
                  </div>
                  <div className="flex items-center">
                    <Globe size={18} className="mr-2 text-gray-500" />
                    <Link
                      href={companyDetails.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#4640DE] hover:underline"
                    >
                      {companyDetails.website.replace(
                        /^(https?:\/\/)?(www\.)?/,
                        ""
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Jobs at this Company Section */}
            <section>
              <h2 className="text-3xl font-bold font-clash text-gray-900 mb-8 text-center">
                Jobs at {companyDetails.name}
              </h2>
              {/* Reusing JobFilterAndListings to display jobs for this company */}
              <JobFilterAndListings
                searchQuery={companyDetails.name} // Pass company name as search query
                location="" // Keep location empty to search globally for this company's jobs
                shouldFetchAll={true} // Fetch all jobs for this company initially
              />
            </section>
          </>
        ) : (
          <div className="text-center py-10 text-gray-600">
            Company not found.
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProfilePage;
