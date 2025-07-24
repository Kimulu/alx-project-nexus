import { Red_Hat_Display, Epilogue } from "next/font/google";

export const redHat = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-redhat",
  weight: ["700"], // Bold
});

export const epilogue = Epilogue({
  subsets: ["latin"],
  variable: "--font-epilogue",
  weight: ["500"], // Medium
});
