
import { Manrope, Work_Sans, Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

/* ─── Typography from NMen Master Layout Base ──────────────────────────────
   Design tokens:
     headline: Manrope   → font-headline
     body:     Work Sans → font-body
     label:    Inter     → font-label
   Border radius: 0px (Sharp edges — "The Architectural Monolith")
   Primary:   #000000
   Surface:   #f9f9f9
   On-surface: #1a1c1c
 ─────────────────────────────────────────────────────────────────────────── */
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-label",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: {
    default: "NMen — Modern Men's Fashion",
    template: "%s | NMen",
  },
  description:
    "Crafting the modern monolith since 2024. Discover premium men's fashion: new arrivals, clothing, and accessories.",
  // Note: Header icons use lucide-react (no external font needed)
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${workSans.variable} ${inter.variable}`}
    >
      {/*
        Design spec: body flex flex-col min-h-screen
        background: surface (#f9f9f9)
        color: on-surface (#1a1c1c)
        suppressHydrationWarning: browser extensions (Bitwarden) inject attrs
      */}
      <body
        className="font-body bg-surface text-on-surface flex flex-col min-h-screen selection:bg-black selection:text-white"
        suppressHydrationWarning
      >
        {/* Header: fixed top-0, full-width, z-50
            height: ~84px (py-5 × 2 + content) — main compensates with pt-[84px] */}
        <Header />

        {/* MAIN CONTENT AREA
            Design spec: flex-grow, pt-[84px] to clear the fixed header
            bg-surface (#f9f9f9) as per design */}
        <main className="grow pt-[76px] md:pt-[84px] bg-surface">
          {children}
        </main>

        {/* Footer: bg-stone-100, pt-24 pb-12, grid 4-cols */}
        <Footer />
      </body>
    </html>
  );
}
