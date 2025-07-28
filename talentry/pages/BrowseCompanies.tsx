// src/app/companies/page.js (or src/pages/companies.js)
import HeroSection from "@/components/jobs/HeroSection"; // Adjust path based on your new structure

const CompaniesPage = () => {
  return (
    <div>
      <HeroSection
        mainTitle={
          <>
            Find your{" "}
            <span className="relative inline-block text-[#26A4FF]">
              dream companies
              <img
                src="/underline_companies.png"
                alt="Underline"
                className="absolute left-0 -bottom-6 w-full max-w-[800px] pointer-events-none"
              />
            </span>
          </>
        }
        subTitle="Find the dream companies you dream work for"
        searchPlaceholder="Company name or keyword"
        locationDefaultValue="Florence, Italy" // Or remove if not applicable for company search
        searchButtonText="Search"
        popularSearches={[
          { text: "Twitter", link: "/companies?q=Twitter" },
          { text: "Microsoft", link: "/companies?q=Microsoft" },
          { text: "Apple", link: "/companies?q=Apple" },
          { text: "Facebook", link: "/companies?q=Facebook" },
        ]}
        searchType="company"
      />
      {/* Other company listing components */}
    </div>
  );
};

export default CompaniesPage;
