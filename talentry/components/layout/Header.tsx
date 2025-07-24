"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Adjusted threshold for sensitivity
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`w-full fixed top-0 z-50
        transition-all duration-300 ease-in-out
        ${scrolled ? "bg-white shadow-md py-3" : "bg-transparent py-4"}
        `} // Added bg-white/90 for initial subtle background, adjusted py
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center justify-between py-0">
        {" "}
        {/* py-0 here as padding is now on header */}
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

          {/* Mobile Menu Button (Hamburger/Cross Icon) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden focus:outline-none z-50 relative"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {/* Mobile Menu (Sliding from Left) */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-6 transform transition-transform duration-300 ease-in-out z-40 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:hidden`}
        >
          {/* Menu items as per your original design */}
          <nav className="flex flex-col space-y-4 pt-12">
            <Link
              href="/jobs"
              className="text-gray-700 font-nav hover:text-[#4640DE]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Jobs
            </Link>
            <Link
              href="/companies"
              className="text-gray-700 font-nav hover:text-[#4640DE]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Companies
            </Link>
            <Link
              href="/login"
              className="text-[#4640DE] font-nav font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
              <button className="bg-[#4640DE] text-white px-4 py-2 font-cta">
                Sign Up
              </button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
