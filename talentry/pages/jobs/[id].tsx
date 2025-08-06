import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  Share2,
  ChevronLeft,
  Building2,
  Heart,
  DollarSign,
  Laptop,
  Users,
  Award,
  BookOpen,
  Clock,
  Globe,
  Zap,
  ShieldCheck,
  Sun,
  Utensils,
  Bike,
  Gift,
  BriefcaseMedical,
} from "lucide-react"; // Import additional icons for perks/benefits
import ApplicationModal from "@/components/jobs/ApplicationModal"; // Import the new ApplicationModal

// Define the shape of job details data based on JSearch API response
interface JobDetails {
  job_category?: string; // Corrected type from ReactNode to string
  job_id: string;
  employer_logo?: string;
  employer_name?: string;
  job_title?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_is_remote?: boolean;
  job_employment_type?: string;
  job_description?: string;
  job_highlights?: {
    Qualifications?: string[];
    Responsibilities?: string[];
    Benefits?: string[];
    "Nice-To-Haves"?: string[];
  };
  job_apply_link?: string;
  job_required_skills?: string[];
  job_salary_currency?: string;
  job_salary_period?: string;
  job_salary_min?: number;
  job_salary_max?: number;
  job_posted_at_timestamp?: number;
  // Add other fields as needed from your API response
}

const JobDetailsPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Get the job ID from the URL
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false); // State to track image loading errors

  // State for the application modal visibility
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchJobDetails = async () => {
        setLoading(true);
        setError(null);
        setImageLoadError(false); // Reset image error state for new job
        try {
          const response = await fetch(`/api/job/${id}`);
          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to fetch job details");
          }
          const data: JobDetails = await response.json();
          setJob(data);
        } catch (err: unknown) {
          // Changed 'any' to 'unknown'
          // Type narrowing for the error object
          if (err instanceof Error) {
            setError(err.message);
            console.error("Error fetching job details:", err);
          } else {
            // Handle cases where the error is not an Error object (e.g., a string or other type)
            setError("An unknown error occurred.");
            console.error("Unknown error fetching job details:", err);
          }
        } finally {
          setLoading(false);
        }
      };
      fetchJobDetails();
    }
  }, [id]); // Re-run effect when 'id' changes

  // Helper to format currency
  const formatSalary = (
    min?: number,
    max?: number,
    currency?: string,
    period?: string
  ) => {
    if (!min && !max) return "Not disclosed";
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    if (min && max && min !== max) {
      return `${formatter.format(min)} - ${formatter.format(max)} ${
        period ? `/ ${period}` : ""
      }`;
    } else if (min) {
      return `${formatter.format(min)} ${period ? `/ ${period}` : ""}`;
    } else if (max) {
      return `${formatter.format(max)} ${period ? `/ ${period}` : ""}`;
    }
    return "Not disclosed";
  };

  // Helper to get job type display
  const getJobTypeDisplay = (type?: string) => {
    if (!type) return "Full-Time"; // Default
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  // Function to generate a random pastel-like color for the placeholder
  const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
  };
  const placeholderBgColor = getRandomColor();
  const companyInitial = job?.employer_name
    ? job.employer_name.charAt(0).toUpperCase()
    : "?";

  // Function to get icon based on benefit text (simplified mapping)
  const getBenefitIcon = (benefitText: string) => {
    const lowerCaseText = benefitText.toLowerCase();
    if (lowerCaseText.includes("health") || lowerCaseText.includes("medical"))
      return BriefcaseMedical;
    if (lowerCaseText.includes("vacation") || lowerCaseText.includes("holiday"))
      return Sun;
    if (
      lowerCaseText.includes("learning") ||
      lowerCaseText.includes("development") ||
      lowerCaseText.includes("education")
    )
      return BookOpen;
    if (lowerCaseText.includes("team")) return Users;
    if (lowerCaseText.includes("bonus") || lowerCaseText.includes("equity"))
      return DollarSign;
    if (lowerCaseText.includes("flexible") || lowerCaseText.includes("hours"))
      return Clock;
    if (
      lowerCaseText.includes("remote") ||
      lowerCaseText.includes("work from home")
    )
      return Laptop;
    if (lowerCaseText.includes("gym") || lowerCaseText.includes("wellness"))
      return Heart;
    if (lowerCaseText.includes("food") || lowerCaseText.includes("meal"))
      return Utensils;
    if (
      lowerCaseText.includes("transport") ||
      lowerCaseText.includes("commute")
    )
      return Bike;
    if (lowerCaseText.includes("insurance")) return ShieldCheck;
    if (
      lowerCaseText.includes("award") ||
      lowerCaseText.includes("recognition")
    )
      return Award;
    if (lowerCaseText.includes("internet")) return Globe;
    if (lowerCaseText.includes("energy")) return Zap;
    if (lowerCaseText.includes("gift")) return Gift;
    return Briefcase; // Default icon if no specific match
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-600 text-lg">
          Loading job details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-600 text-lg">Job not found.</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-24 pb-12 font-epilogue">
      {/* pt-24 to clear fixed header */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Back to Jobs Link */}
        <div className="mb-8">
          <Link
            href="/FindJobs"
            className="flex items-center text-gray-600 hover:text-[#4640DE] transition-colors duration-200"
          >
            <ChevronLeft size={20} className="mr-1" /> Back to Jobs
          </Link>
        </div>

        {/* Job Header Section - REFINED FOR MOBILE */}
        <div className="bg-gray-50 p-6 sm:p-8 rounded-lg shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {" "}
          {/* Added justify-between here */}
          {/* Job Info Section (Left/Top) */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start w-full md:w-auto">
            <div className="flex-shrink-0 mr-0 sm:mr-6 mb-4 sm:mb-0">
              {job.employer_logo && !imageLoadError ? (
                <Image
                  src={job.employer_logo}
                  alt={`${job.employer_name} Logo`}
                  width={80}
                  height={80}
                  className="rounded-lg object-contain"
                  onError={() => {
                    setImageLoadError(true);
                    console.error(
                      `Failed to load image: ${job.employer_logo}. Check if domain is configured in next.config.js.`
                    );
                  }}
                />
              ) : (
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center text-white text-2xl sm:text-3xl font-bold"
                  style={{ backgroundColor: placeholderBgColor }}
                >
                  {companyInitial}
                </div>
              )}
            </div>
            <div className="text-center sm:text-left w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 font-clash">
                {job.job_title}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base flex flex-wrap justify-center sm:justify-start items-center gap-x-2">
                <span className="flex items-center flex-shrink-0">
                  <Building2 size={16} className="mr-1" /> {job.employer_name}
                </span>
                <span className="flex items-center flex-shrink-0">
                  <MapPin size={16} className="mr-1" />{" "}
                  {job.job_city && job.job_state
                    ? `${job.job_city}, ${job.job_state}`
                    : job.job_country || (job.job_is_remote ? "Remote" : "N/A")}
                </span>
                <span className="flex items-center flex-shrink-0">
                  <Briefcase size={16} className="mr-1" />{" "}
                  {getJobTypeDisplay(job.job_employment_type)}
                </span>
              </p>
            </div>
          </div>
          {/* Action Buttons Section (Right/Bottom) - Now always a row, centered on mobile */}
          <div className="flex flex-row items-center justify-center gap-4 w-full mt-4 md:mt-0 md:ml-auto">
            <button className="flex items-center justify-center p-3 rounded-md text-gray-600 hover:text-[#4640DE] hover:bg-gray-100 transition-colors duration-200 border border-gray-300 flex-shrink-0">
              <Share2 size={20} className="mr-2" /> Share
            </button>
            <button
              onClick={() => setIsApplyModalOpen(true)}
              // MODIFIED CLASSES FOR RESPONSIVE BUTTON SIZE
              className={`w-full md:w-auto md:max-w-[180px] px-6 py-3 rounded-md text-white bg-[#4640DE] hover:bg-blue-700 transition-colors duration-200`}
            >
              Apply Now
            </button>
          </div>
        </div>

        {/* Main Content Grid: Description/Responsibilities/Perks & About Role/Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Description, Responsibilities, Who You Are, Nice-To-Haves, Perks & Benefits */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {job.job_description && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 font-clash">
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                  {job.job_description}
                </p>
              </div>
            )}

            {/* Responsibilities */}
            {job.job_highlights?.Responsibilities &&
              job.job_highlights.Responsibilities.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 font-clash">
                    Responsibilities
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm sm:text-base">
                    {job.job_highlights.Responsibilities.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Who You Are (Qualifications) */}
            {job.job_highlights?.Qualifications &&
              job.job_highlights.Qualifications.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 font-clash">
                    Who You Are
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm sm:text-base">
                    {job.job_highlights.Qualifications.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Nice-To-Haves */}
            {job.job_highlights?.["Nice-To-Haves"] &&
              job.job_highlights["Nice-To-Haves"].length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 font-clash">
                    Nice-To-Haves
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm sm:text-base">
                    {job.job_highlights["Nice-To-Haves"].map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Perks & Benefits - MODIFIED with Icons */}
            {job.job_highlights?.Benefits &&
              job.job_highlights.Benefits.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 font-clash">
                    Perks & Benefits
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-sm sm:text-base">
                    {job.job_highlights.Benefits.map((item, index) => {
                      const Icon = getBenefitIcon(item); // Get the appropriate icon component
                      return (
                        <div key={index} className="flex items-center">
                          <Icon
                            size={20}
                            className="text-[#4640DE] mr-2 flex-shrink-0"
                          />{" "}
                          {/* Render icon */}
                          <span>{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>

          {/* Right Column: About this Role, Categories, Required Skills */}
          <div className="lg:col-span-1 space-y-8">
            {/* About this Role */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 font-clash">
                About this role
              </h2>
              <div className="space-y-3 text-sm sm:text-base">
                <p className="text-gray-700">
                  <span className="font-medium">Salary:</span>{" "}
                  {formatSalary(
                    job.job_salary_min,
                    job.job_salary_max,
                    job.job_salary_currency,
                    job.job_salary_period
                  )}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Job Type:</span>{" "}
                  {getJobTypeDisplay(job.job_employment_type)}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Date Posted:</span>{" "}
                  {job.job_posted_at_timestamp
                    ? new Date(
                        job.job_posted_at_timestamp * 1000
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Categories */}
            {job.job_category && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 font-clash">
                  Categories
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                    {job.job_category}
                  </span>
                </div>
              </div>
            )}

            {/* Required Skills */}
            {job.job_required_skills && job.job_required_skills.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 font-clash">
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.job_required_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Company Overview (if available) - MODIFIED FOR RESPONSIVENESS */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 font-clash">
            About {job.employer_name || "the Company"}
          </h2>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex-shrink-0 mb-4 md:mb-0">
              {job.employer_logo && !imageLoadError ? ( // Use imageLoadError state here too
                <Image
                  src={job.employer_logo}
                  alt={`${job.employer_name} Logo`}
                  width={100}
                  height={100}
                  className="rounded-lg object-contain"
                  onError={() => {
                    setImageLoadError(true);
                    console.error(
                      `Failed to load image: ${job.employer_logo}. Check if domain is configured in next.config.js.`
                    );
                  }}
                />
              ) : (
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex items-center justify-center text-white text-3xl sm:text-4xl font-bold"
                  style={{ backgroundColor: placeholderBgColor }}
                >
                  {companyInitial}
                </div>
              )}
            </div>
            <div>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {/* This description would ideally come from a dedicated employer_info field in JSearch API
                    or a separate API call for company details. For now, using a placeholder or
                    a very short snippet if available. JSearch 'job-details' doesn't provide
                    extensive company descriptions directly.
                */}
                {job.employer_name} is a leading company in its field, committed
                to innovation and fostering a dynamic work environment. We
                believe in empowering our employees and driving impactful
                change. Join our team and contribute to exciting projects that
                shape the future.
              </p>
              {/* Add more company details like website, size, etc. if available from API */}
            </div>
          </div>
        </div>
      </div>
      {/* Application Modal */}
      {job && ( // Only render modal if job data is available
        <ApplicationModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          jobId={job.job_id}
          jobTitle={job.job_title || "N/A"}
          companyName={job.employer_name || "N/A"}
        />
      )}
    </div>
  );
};

export default JobDetailsPage;
