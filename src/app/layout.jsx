
import { Manrope, Work_Sans, Inter } from "next/font/google";
import { fetchSiteSettings } from "@/lib/settings";
import "./globals.css";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ─── Root Layout — chỉ setup html/body/fonts ───────────────────────────────
   Header/Footer được đặt ở (client)/layout.jsx
   Admin có layout riêng ở admin/layout.jsx
 ──────────────────────────────────────────────────────────────────────────── */
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

export async function generateMetadata() {
  const settings = await fetchSiteSettings();
  
  const siteName = settings?.site_name || "NMen";
  const desc = settings?.description || "Modern Men's Fashion";
  const favicon = settings?.favicon_url 
    ? (settings.favicon_url.startsWith("/uploads") ? `${BASE}${settings.favicon_url}` : settings.favicon_url) 
    : "/favicon.ico";

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: desc,
    icons: {
      icon: favicon,
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${workSans.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
