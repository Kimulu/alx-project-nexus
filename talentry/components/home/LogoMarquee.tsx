"use client";
import React, { useRef, useEffect } from "react"; // Removed useState as it's not used
import Image from "next/image";

// IMPORTANT: Replace these src URLs with the actual paths to your logo images
const logos = [
  { name: "Vodafone", src: "/vodafone.png" },
  { name: "Intel", src: "/intel.png" },
  { name: "Tesla", src: "/tesla.png" },
  { name: "AMD", src: "/amd.png" },
  { name: "Talkit", src: "/talkit.png" },
];

const LogoMarquee = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const currentScrollRef = useRef(0);
  const resetPointRef = useRef(0); // Ref to store the calculated reset point

  const scrollSpeed = 0.5;

  useEffect(() => {
    const marquee = marqueeRef.current;
    const inner = innerRef.current;

    if (!marquee || !inner) return;

    // Function to calculate and update the reset point
    const calculateAndSetResetPoint = () => {
      if (innerRef.current) {
        // The reset point is half the total scrollWidth of the duplicated content
        resetPointRef.current = innerRef.current.scrollWidth / 2;
      }
    };

    // The core animation function
    const animateScroll = () => {
      const currentMarquee = marqueeRef.current;
      if (!currentMarquee) {
        stopAnimation(); // Stop if the marquee element is no longer available
        return;
      }

      currentScrollRef.current += scrollSpeed;
      // If we've scrolled past the reset point, jump back to the start
      if (currentScrollRef.current >= resetPointRef.current) {
        currentScrollRef.current = 0;
      }
      currentMarquee.scrollLeft = currentScrollRef.current;
      animationFrameId.current = requestAnimationFrame(animateScroll);
    };

    // Function to start the animation loop
    const startAnimation = () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current); // Cancel any existing animation
      }
      animationFrameId.current = requestAnimationFrame(animateScroll);
    };

    // Function to stop the animation loop
    const stopAnimation = () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      if (marqueeRef.current) {
        marqueeRef.current.scrollLeft = 0; // Reset visual scroll position
      }
      currentScrollRef.current = 0; // Reset internal scroll tracker
    };

    // Handle window resize
    const handleResize = () => {
      const currentMarquee = marqueeRef.current;
      const currentInner = innerRef.current;

      if (!currentMarquee || !currentInner) {
        stopAnimation();
        return;
      }

      // Recalculate reset point on resize as dimensions might change
      calculateAndSetResetPoint();

      if (currentInner.scrollWidth > currentMarquee.clientWidth) {
        // If content overflows, ensure animation is running
        if (animationFrameId.current === null) {
          // Only start if not already running
          // Preserve current scroll position on resize to avoid jumps
          currentScrollRef.current = currentMarquee.scrollLeft;
          startAnimation();
        }
      } else {
        // If content no longer overflows, stop animation
        stopAnimation();
      }
    };

    // Initial setup:
    // Use a small delay to ensure all images have loaded and browser has rendered
    // the full width of the inner container before calculating resetPoint and starting animation.
    // This is crucial to prevent initial freezing/jumps if images load asynchronously.
    const initialSetupTimeout = setTimeout(() => {
      calculateAndSetResetPoint(); // Calculate reset point after a brief delay
      if (inner.scrollWidth > marquee.clientWidth) {
        startAnimation();
      }
    }, 100); // 100ms delay - adjust if needed based on image loading times

    window.addEventListener("resize", handleResize);

    // Cleanup function: stop animation and remove event listener when component unmounts
    return () => {
      clearTimeout(initialSetupTimeout); // Clear the timeout if component unmounts early
      stopAnimation(); // Ensure animation is stopped
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array: effect runs once on mount and cleans up on unmount

  // Duplicate logos TWICE to create a seamless, infinite loop effect.
  const duplicatedLogos = [
    ...logos,
    ...logos,
    ...logos,
    ...logos,
    ...logos,
    ...logos,
  ];

  return (
    <section className="bg-white py-12 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-gray-600 text-lg font-epilogue mb-8">
          Companies we helped grow
        </h2>
        <div className="relative">
          {/* Gradient Overlay Left - Fades from white (section background) to transparent */}
          <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          {/* Gradient Overlay Right - Fades from transparent to white (section background) */}
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

          {/* Marquee Container */}
          <div
            ref={marqueeRef}
            className="flex overflow-x-hidden whitespace-nowrap scrollbar-hide" // `scrollbar-hide` hides native scrollbar
          >
            {/* Inner container with duplicated logos */}
            <div ref={innerRef} className="flex items-center">
              {duplicatedLogos.map((logo, index) => (
                <div
                  key={index} // Using index for key is okay here because items are static and duplicated
                  className="flex-shrink-0 mx-6 py-2 opacity-60 hover:opacity-100 transition-opacity duration-300"
                >
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={120} // Adjust width as needed for your logos
                    height={40} // Adjust height as needed
                    className="object-contain"
                    onError={(
                      e: React.SyntheticEvent<HTMLImageElement, Event>
                    ) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://placehold.co/120x40/cccccc/000000?text=Logo";
                    }} // Fallback for broken images
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogoMarquee;
