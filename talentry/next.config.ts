import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "placehold.co", // Already added for placeholders
      "encrypted-tbn0.gstatic.com", // Add this domain for JSearch employer logos
      // Add any other external image domains your application might use
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
