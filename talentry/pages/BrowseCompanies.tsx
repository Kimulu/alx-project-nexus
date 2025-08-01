// pages/companies/index.tsx
"use client";
import React, { useState, useEffect, useMemo } from "react"; // Added useMemo for recommendedCompanies
import Link from "next/link";
import Image from "next/image";
import HeroSection from "@/components/jobs/HeroSection"; // Reusing the HeroSection
import { Building2, Briefcase } from "lucide-react"; // Icons for company cards
import CallToActionSection from "@/components/home/CallToActionSection"; // Import CallToActionSection
import CompanyPageSearchResults from "@/components/companies/CompanyPageSearchResults"; // NEW: Import the new component
import { scroller } from "react-scroll"; // NEW: Import scroller for smooth scrolling

// Define interfaces for data structures
interface Company {
  name: string;
  logo: string | null;
  jobCount: number;
}

interface CompanyCategory {
  label: string;
  value: string;
  icon: React.ElementType; // For LucideReact icons
}

const BrowseCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NEW: Local state for the search query and location on THIS page
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");
  const [currentSearchLocation, setCurrentSearchLocation] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/companies");
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch companies");
        }
        const data = await response.json();
        setCompanies(data.data || []);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Define company categories with Lucide icons
  const companyCategories: CompanyCategory[] = [
    { label: "Design", value: "Design", icon: Building2 },
    { label: "Fintech", value: "Fintech", icon: Briefcase },
    { label: "Hosting", value: "Hosting", icon: Building2 }, // Placeholder icon
    { label: "Business Service", value: "Business Service", icon: Briefcase },
    { label: "Development", value: "Development", icon: Building2 }, // Placeholder icon
    { label: "Marketing", value: "Marketing", icon: Briefcase },
    { label: "Human Resource", value: "Human Resource", icon: Building2 },
    { label: "Finance", value: "Finance", icon: Briefcase },
    { label: "Engineering", value: "Engineering", icon: Building2 },
    { label: "Technology", value: "Technology", icon: Briefcase },
  ];

  // Function to generate a random pastel-like color for the placeholder
  const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`; // Light, desaturated colors for better readability
  };

  // Filter companies for "Recommended Companies" (e.g., top 6 with logos)
  const recommendedCompanies = useMemo(() => {
    // Since we're no longer relying on actual logos, just take the first 6 companies
    return companies.slice(0, 6);
  }, [companies]);

  // Select 8 random companies for the "Explore All Companies" section
  const randomEightCompanies = useMemo(() => {
    const shuffled = [...companies].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 8); // Take the first 8 after shuffling
  }, [companies]);

  // NEW: Handle search submission from HeroSection
  const handleSearchSubmit = (query: string, location: string) => {
    setCurrentSearchQuery(query);
    setCurrentSearchLocation(location);
    // The smooth scroll will be handled by the useEffect below
  };

  // NEW: Determine if a search has been performed
  const hasSearched = currentSearchQuery !== "" || currentSearchLocation !== "";

  // NEW: Smooth scroll to search results when a search is initiated
  useEffect(() => {
    if (hasSearched) {
      scroller.scrollTo("company-page-search-results", {
        duration: 800, // Smoothness duration in milliseconds
        delay: 0,
        smooth: "easeInOutQuart", // Animation type
        offset: -80, // Offset to account for fixed header/navbar, adjust as needed
      });
    }
  }, [hasSearched]); // MODIFIED: Depend on hasSearched to trigger scroll

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <HeroSection
        mainTitle={
          <>
            Find your{" "}
            <span className="relative inline-block text-[#26A4FF]">
              {" "}
              dream companies
              <img
                src="/underline_companies.png" // User's provided path
                className="absolute left-0 -bottom-6 w-full max-w-[800px] pointer-events-none PY-4" // User's provided classes
                alt="Underline"
              />
            </span>
          </>
        }
        subTitle="Find the dream companies you dream work for."
        searchPlaceholder="Company name or keyword"
        searchButtonText="Search"
        popularSearches={[
          { text: "Google", link: "/companies?q=Google" },
          { text: "Microsoft", link: "/companies?q=Microsoft" },
          { text: "Apple", link: "/companies?q=Apple" },
          { text: "Amazon", link: "/companies?q=Amazon" },
        ]}
        searchType="company"
        onSearchSubmit={handleSearchSubmit} // MODIFIED: Pass the new handler
      />

      {/* NEW: CompanyPageSearchResults is always rendered if a search is active */}
      {hasSearched && (
        <div className="company-page-search-results">
          {" "}
          {/* NEW: Added name for react-scroll */}
          <CompanyPageSearchResults
            searchQuery={currentSearchQuery}
            location={currentSearchLocation}
          />
        </div>
      )}

      {/* Main content wrapper for static sections */}
      {/* These sections will always be visible, regardless of search results */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-10 text-gray-600">
            Loading companies...
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-600">Error: {error}</div>
        ) : (
          <>
            {/* Recommended Companies Section */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold font-clash text-gray-900 mb-8 text-left">
                {" "}
                Recommended Companies
              </h2>
              <p className="text-gray-600 text-left mb-10">
                {" "}
                Based on your profile, company reviews, and recent activity.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {recommendedCompanies.map((company, index) => (
                  <Link
                    href={`/company/${encodeURIComponent(company.name)}`}
                    key={index}
                    className="block bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center mb-4">
                      <div
                        className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-xl font-bold mr-4"
                        style={{ backgroundColor: getRandomColor() }}
                      >
                        {company.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {company.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {company.jobCount} Jobs
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-3">
                      {company.name} is a dynamic company known for its
                      innovative solutions and commitment to employee growth.
                      Join a team that values creativity and collaboration.
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
      {/* MODIFIED: CallToActionSection moved here, outside the max-w-6xl div, and before the Explore All Companies section */}
      <CallToActionSection />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        {" "}
        {/* Re-added this div for the last section */}
        {loading ? null : error ? null : ( // For a cleaner approach, you might want to manage loading states more granularly. // this loading state will only apply to the sections within this div. // This loading state is for the *entire* content, but since we separated the CTA, // Already handled above, or could show a specific loader for this section // Already handled above, or could show a specific error for this section
          <>
            {/* Final Section: Explore All Companies (now showing 8 random) */}
            <section className="mb-12 mt-12">
              <h2 className="text-3xl font-bold font-clash text-gray-900 mb-8 text-center">
                Explore All Companies
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                {randomEightCompanies.map((company, index) => (
                  <Link
                    href={`/company/${encodeURIComponent(company.name)}`}
                    key={index}
                    className="block bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 text-center"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-2"
                      style={{ backgroundColor: getRandomColor() }}
                    >
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-md font-semibold text-gray-900 truncate">
                      {company.name}
                    </h3>
                    <p className="text-gray-600 text-xs">
                      {company.jobCount} Jobs
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseCompaniesPage;
