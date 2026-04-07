import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  {
    id: "shirts",
    title: "Áo sơ mi",
    subtitle: "Thiết yếu mỗi ngày",
    href: "/clothing",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWZuyrZeq07D0ZcUEfoRTnI5FfdKhjgMGIJtHsR-ocOmXMbIfpOxXiPKzNzTTi7Mrd6V8ozIgdOz9Nk5wF0tc0xx9pxxChYAz86EESbyvVPi9cNZCMB-eF4OHBqKRJdWxB4eIu5f54ioJG2OYBKnwWN4spHHe3eV0opu39y6BFK81BTpFg0AVWYm09wPLB8xlWpmoroZzFuPSDBvXx34rO0iwkOzSMc_dZTY-UjM_2ZeB89X_ixiMLEvUiKs0eIpjfTdHSx7xBNA",
  },
  {
    id: "pants",
    title: "Quần Nam",
    subtitle: "Đường cắt tối giản",
    href: "/clothing",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCe-7USu3-sNi5_ri2UJG33gejjGYAapFTRBRc9Lw8EWPbVzpNQQnpcDitqMFipkt8Hov8_6-R6X5n64oFbhtnLX6BBUFoKsrW_ARhCIYfb3iNqrfDf4N0PYHUvFW3j53FQ6Uyry0YmVuEVysuiPvm0tUS99C1CCFL1OSdPM1AEF5g3YZhhVxBHIc3MfL25W21VxhoL9sZf1FUncR0V7acyU7W93-V5rOgdQCXVtwDfulqLKupqmHKNyft6Im_MeUil2Xl4GpSFtQ",
  },
  {
    id: "suits",
    title: "Bộ Suit",
    subtitle: "Di sản hiện đại",
    href: "/clothing",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDTIXoaGIK0fvLdorXBBYycitXmKZ6h3sbi9ha6VVbwSK-TTFkXhwdg8M7EOpEk-1o1NVMoenb0ZtiX6bzinet3gzYdQYdQ365K_9-d_mB19lJAQZZtWtvexC5qMJ1T9D_daH3yblNQF7UXYqzIBfHTp2jPaJ836iKISVqlpxE9x6rBMJ2NA1Xy5XeFQqjkKxsRDCPJ-gb2iMoIUJQ3PTv4Wa2a_bH8soIkXiulm0mRONrkdGwhFB6j4xcZ6_Rg1YxPFLQsBIGdQ",
  },
];

export default function CuratedCategories() {
  return (
    <section className="py-24 px-6 md:px-12 bg-surface-container">
      {/* ── Section Title ────────────────────────────────────────────── */}
      <h2 className="font-headline text-xs font-bold tracking-[0.4em] uppercase text-center mb-16 text-black/50">
        Danh mục nổi bật
      </h2>

      {/* ── 3 Column Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className="group relative cursor-pointer overflow-hidden min-h-[400px] md:h-[600px] block"
          >
            {/* Background Image: scales up gracefully on hover */}
            <Image
              src={category.image}
              alt={category.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            />
            
            {/* Overlay: darkens slightly on hover to make text pop */}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-700 pointer-events-none" />

            {/* Text Content: fixed to bottom-left */}
            <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 pointer-events-none">
              <h3 className="text-white font-headline text-3xl md:text-4xl font-extrabold tracking-tighter uppercase">
                {category.title}
              </h3>
              <p className="text-white/70 font-label text-[10px] uppercase tracking-widest mt-2 transition-colors group-hover:text-white/90">
                {category.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
