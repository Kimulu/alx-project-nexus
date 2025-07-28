"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion"; // Import motion from framer-motion

// Importing specific icons from lucide-react that match the categories
import {
  Palette, // For Design
  LineChart, // For Sales
  Megaphone, // For Marketing
  PiggyBank, // For Finance
  Monitor, // For Technology
  Code, // For Engineering
  Briefcase, // For Business
  Users, // For Human Resource
} from "lucide-react";

// Define the structure for each category card
const categories = [
  {
    icon: Palette,
    title: "Design",
    jobCount: 235,
    link: "/jobs?category=design",
    isFeatured: false,
  },
  {
    icon: LineChart,
    title: "Sales",
    jobCount: 756,
    link: "/jobs?category=sales",
    isFeatured: false,
  },
  {
    icon: Megaphone,
    title: "Marketing",
    jobCount: 140,
    link: "/jobs?category=marketing",
    isFeatured: true, // This is the highlighted card
  },
  {
    icon: PiggyBank,
    title: "Finance",
    jobCount: 325,
    link: "/jobs?category=finance",
    isFeatured: false,
  },
  {
    icon: Monitor,
    title: "Technology",
    jobCount: 436,
    link: "/jobs?category=technology",
    isFeatured: false,
  },
  {
    icon: Code,
    title: "Engineering",
    jobCount: 542,
    link: "/jobs?category=engineering",
    isFeatured: false,
  },
  {
    icon: Briefcase,
    title: "Business",
    jobCount: 211,
    link: "/jobs?category=business",
    isFeatured: false,
  },
  {
    icon: Users,
    title: "Human Resource",
    jobCount: 346,
    link: "/jobs?category=human-resource",
    isFeatured: false,
  },
];

// Define animation variants for the cards
const cardVariants = {
  hidden: { opacity: 0, y: 50 }, // Initial state: invisible and slightly below
  visible: { opacity: 1, y: 0 }, // Final state: fully visible at original position
};

const JobCategories = () => {
  return (
    <section className="bg-[#F8F8FD] py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-clash font-bold text-gray-900">
            Explore by <span className="text-[#4640DE]">category</span>
          </h2>
          <Link
            href="/jobs"
            className="flex items-center text-[#4640DE] hover:text-blue-700 font-medium transition-colors duration-200"
          >
            Show all jobs <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <motion.div // Wrap the Link with motion.div for animations
                key={index}
                initial="hidden" // Start from the 'hidden' state
                whileInView="visible" // Animate to 'visible' when in view
                viewport={{ once: true, amount: 0.3 }} // Trigger once when 30% of element is visible
                variants={cardVariants} // Apply the defined animation variants
                transition={{ duration: 0.5, delay: index * 0.1 }} // Staggered delay for each card
                whileHover={{ scale: 1.03 }} // Grow slightly on hover
                className="group" // Add group class to enable group-hover utilities
              >
                <Link
                  href={category.link}
                  className={`
                    block p-6 rounded-lg shadow-sm transition-all duration-300 ease-in-out
                    ${
                      category.isFeatured
                        ? "bg-[#4640DE] text-white" // Featured card initial state
                        : "bg-white text-gray-800" // Default card initial state
                    }
                    group-hover:bg-[#4640DE] group-hover:text-white group-hover:shadow-lg // All cards turn blue on hover, stronger shadow
                    flex flex-col justify-between h-48
                  `}
                >
                  <div>
                    <IconComponent
                      className={`w-10 h-10 mb-4 transition-colors duration-300
                        ${category.isFeatured ? "text-white" : "text-[#4640DE]"}
                        group-hover:text-white // Icon turns white on hover
                      `}
                    />
                    <h3
                      className={`text-xl font-semibold mb-2 font-clash transition-colors duration-300
                        ${category.isFeatured ? "text-white" : "text-gray-900"}
                        group-hover:text-white // Title turns white on hover
                      `}
                    >
                      {category.title}
                    </h3>
                    <p
                      className={`text-sm font-epilogue transition-colors duration-300
                        ${
                          category.isFeatured
                            ? "text-blue-200"
                            : "text-gray-600"
                        }
                        group-hover:text-white // Job count text turns white on hover
                      `}
                    >
                      {category.jobCount} jobs available
                    </p>
                  </div>
                  <div className="flex justify-end mt-4">
                    <ArrowRight
                      className={`w-5 h-5 transition-colors duration-300
                        ${category.isFeatured ? "text-white" : "text-gray-400"}
                        group-hover:text-white // Arrow turns white on hover
                      `}
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default JobCategories;
