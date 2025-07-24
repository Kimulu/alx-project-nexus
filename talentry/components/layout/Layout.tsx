import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white text-gray-900">
      <Header />
      <main className="w-full">{children}</main>
      <Footer />
    </div>
  );
}
