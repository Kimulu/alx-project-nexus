"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full fixed top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
        <div className="flex items-center justify-between w-full">
          {/* Left Side: Logo + Desktop Nav */}
          <div className="flex items-center space-x-12">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/Logo.png"
                alt="Talentry Logo"
                width={30}
                height={30}
              />
              <span className="font-logo">Talentry</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/jobs"
                className="text-gray-700 font-nav text-[14px] mt-1.5 hover:text-[#4640DE] transition"
              >
                Find Jobs
              </Link>
              <Link
                href="/companies"
                className="text-gray-700 font-nav text-[14px] mt-1.5 hover:text-[#4640DE] transition"
              >
                Browse Companies
              </Link>
            </nav>
          </div>

          {/* Right Side: Auth Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-[#4640DE] font-nav text-[14px] font-medium px-6 py-3"
            >
              Login
            </Link>

            {/* Divider */}
            <div className="h-5 border-l border-gray-300"></div>

            <Link href="/signup">
              <button className="bg-[#4640DE] text-white px-6 py-3 font-cta hover:opacity-90 transition">
                Sign Up
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden focus:outline-none"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white px-2 py-4 border-t border-gray-200 flex flex-col space-y-4">
            <Link
              href="/jobs"
              className="text-gray-700 font-nav hover:text-[#4640DE]"
            >
              Find Jobs
            </Link>
            <Link
              href="/companies"
              className="text-gray-700 font-nav hover:text-[#4640DE]"
            >
              Browse Companies
            </Link>
            <Link href="/login" className="text-[#4640DE] font-nav font-medium">
              Login
            </Link>
            <Link href="/signup">
              <button className="bg-[#4640DE] text-white px-4 py-2 font-cta">
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
