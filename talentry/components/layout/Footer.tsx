// src/components/Footer.tsx
"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"; // Social media icons

const Footer = () => {
  const currentYear = new Date().getFullYear(); // Get the current year dynamically
  return (
    <footer className="bg-[#1F2024] text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top Section: Logo, Description, Nav Links, Subscribe Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pb-12 border-b border-gray-700">
          {/* Column 1: Logo and Description */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/Logo.png" // Ensure this path is correct
                alt="Talentry Logo"
                width={30}
                height={30}
              />
              <span className="font-logo text-2xl font-bold text-white">
                Talentry
              </span>
            </Link>
            <p className="text-gray-400 text-base leading-relaxed max-w-sm">
              Great platform for the job seeker that passionate about startups.
              Find your dream job easier.
            </p>
          </div>

          {/* Column 2: Combined About and Resources Links */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1 flex flex-col sm:flex-row justify-between sm:space-x-8 lg:space-x-0">
            {/* About Links */}
            <div className="mb-8 sm:mb-0">
              <h3 className="text-white font-semibold text-lg mb-6">About</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Companies
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Advice
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6">
                Resources
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Help Docs
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Guide
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Updates
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: Get job notifications - MADE RESPONSIVE */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <h3 className="text-white font-semibold text-lg mb-6">
              Get job notifications
            </h3>
            <p className="text-gray-400 text-base mb-4">
              The latest job news, articles, sent to your inbox weekly.
            </p>
            {/* Responsive form container */}
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Email Address"
                className="flex-grow w-full px-4 py-3 rounded-md sm:rounded-l-md sm:rounded-r-none bg-[#2D3035] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4640DE]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#4640DE] text-white px-4 py-3 rounded-md sm:rounded-r-md sm:rounded-l-none font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section: Copyright and Social Icons */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-gray-500 text-sm">
          <p className="mb-4 sm:mb-0">
            {currentYear} @ Talentry. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link
              href="#"
              className="bg-gray-700 p-2 rounded-full hover:bg-[#4640DE] transition-colors duration-200"
            >
              <Facebook size={18} />
            </Link>
            <Link
              href="#"
              className="bg-gray-700 p-2 rounded-full hover:bg-[#4640DE] transition-colors duration-200"
            >
              <Instagram size={18} />
            </Link>
            <Link
              href="#"
              className="bg-gray-700 p-2 rounded-full hover:bg-[#4640DE] transition-colors duration-200"
            >
              <Linkedin size={18} />
            </Link>
            <Link
              href="#"
              className="bg-gray-700 p-2 rounded-full hover:bg-[#4640DE] transition-colors duration-200"
            >
              <Twitter size={18} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
