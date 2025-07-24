import Image from "next/image";

const Hero = () => {
  return (
    <section className="relative bg-[#F8F8FD] overflow-hidden">
      {/* Pattern Background */}
      <div
        className="absolute top-0 right-0 z-0 overflow-hidden"
        style={{
          width: "70%", // Tweak this for size
          height: "75%", // Tweak this for height
          transform: "translateX(10%)", // Move right (+) or left (-)
        }}
      >
        <img
          src="/pattern.svg"
          alt="Background pattern"
          className="w-full h-full object-contain object-left opacity-70"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left Side */}
          <div className="relative">
            <h1 className="text-[70px] leading-[1.1] font-clash text-gray-900 mb-4">
              <div className="font-clash">Discover</div>
              <div className="font-clash">more than</div>
              <div className="relative inline-block text-[#26A4FF] font-clash">
                5000+ Jobs
                {/* Underline image */}
                <img
                  src="/underline.png"
                  className="absolute left-0 -bottom-6 w-full max-w-[500px] pointer-events-none"
                />
              </div>
            </h1>
            <p className="text-gray-600 text-[18px] font-normal font-epilogue mb-8 mt-6 py-7 leading-[32px] max-w-[600px]">
              Great platform for the job seeker that searching for new career
              heights and passionate about startups.
            </p>
            <div className="flex gap-4">
              <button className="bg-primary text-white px-6 py-3 rounded-full font-medium text-base hover:bg-primary-dark transition">
                Find Jobs
              </button>
              <button className="bg-white text-primary border border-primary px-6 py-3 rounded-full font-medium text-base hover:bg-gray-100 transition">
                Browse Companies
              </button>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex justify-center md:justify-end relative z-20">
            <img
              src="/hero-image.png"
              alt="Illustration"
              className="mt-[-65px] w-full max-w-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
