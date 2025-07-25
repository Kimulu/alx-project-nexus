import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useRouter } from "next/router"; // Import useRouter

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter(); // Initialize useRouter

  // Define paths where the Header (Navbar) should NOT be displayed
  const noHeaderPaths = ["/signup", "/login"]; // Add any other paths here

  // Determine if the Header should be shown
  const showHeader = !noHeaderPaths.includes(router.pathname);

  return (
    <div className="bg-white text-gray-900">
      {showHeader && <Header />} {/* Conditionally render the Header */}
      <main className="w-full">{children}</main>
      <Footer />
    </div>
  );
}
