"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const CallToActionSection = () => {
  return (
    // Applied the custom class 'cta-angled-bottom-left' here
    <section className="relative overflow-hidden bg-[#F8F8FD]">
      <div className="relative  z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-white">
        <div className="bg-[#4640DE] flex flex-col md:flex-row items-center justify-between gap-8 cta-angled-bottom-left">
          {/* Left Content */}
          <div className="text-center md:text-left md:w-1/2 px-12 mt-8">
            <h2 className="text-[46px] sm:text-5xl font-clash font-bold mb-4 leading-tight">
              Start posting <br /> jobs today
            </h2>
            <p className="text-lg font-epilogue mb-8 opacity-90">
              Start posting jobs for only $10.
            </p>
            <Link href="/signup">
              <button className="bg-white text-[#4640DE] px-8 py-4 font-cta text-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-md">
                Sign Up For Free
              </button>
            </Link>
          </div>

          {/* Right Image */}
          <div className="md:w-1/2 flex justify-center md:justify-end relative">
            <Image
              src="/dashboard-mockup.png" // Replace with your actual dashboard image path
              alt="Dashboard Mockup"
              width={600}
              height={400}
              layout="responsive"
              objectFit="contain"
              className="w-full h-auto max-w-lg md:max-w-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
