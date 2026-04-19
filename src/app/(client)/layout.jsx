import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Layout cho các trang client: có Header và Footer
export default function ClientLayout({ children }) {
  return (
    <div className="font-body bg-surface text-on-surface flex flex-col min-h-screen selection:bg-black selection:text-white">
      <Header />
      <main className="grow pt-[76px] md:pt-[84px] bg-surface">
        {children}
      </main>
      <Footer />
    </div>
  );
}
