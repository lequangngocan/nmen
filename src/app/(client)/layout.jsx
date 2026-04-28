import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { fetchSiteSettings } from "@/lib/settings";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

// Layout cho các trang client: Header, Footer và AuthProvider bọc toàn bộ
export default async function ClientLayout({ children }) {
  const settings = await fetchSiteSettings();

  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <div className="font-body bg-surface text-on-surface flex flex-col min-h-screen selection:bg-black selection:text-white">
          <Header settings={settings} />
          <main className="grow pt-[76px] md:pt-[84px] bg-surface">
            {children}
          </main>
          <Footer settings={settings} />
        </div>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
