
import { Manrope, Work_Sans, Inter } from "next/font/google";
import "./globals.css";

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

export const metadata = {
  title: {
    default: "NMen — Modern Men's Fashion",
    template: "%s | NMen",
  },
  description:
    "Crafting the modern monolith since 2024. Discover premium men's fashion: new arrivals, clothing, and accessories.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${workSans.variable} ${inter.variable}`}
    >
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
