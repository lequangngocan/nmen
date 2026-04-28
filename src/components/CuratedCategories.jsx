import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  {
    id: "shirts",
    title: "Áo sơ mi",
    subtitle: "Thoải mái bật cá tính",
    href: "/clothing",
    image: "/images/img_f0ccbd0b.jpg",
  },
  {
    id: "pants",
    title: "Quần Nam",
    subtitle: "Chuyển động tự do",
    href: "/clothing",
    image: "/images/img_e531fefc.jpg",
  },
  {
    id: "suits",
    title: "Bộ Suit",
    subtitle: "Bản lĩnh quý ông",
    href: "/clothing",
    image: "/images/img_7aec8eb3.jpg",
  },
];

export default function CuratedCategories() {
  return (
    <section className="py-24 px-6 md:px-12 bg-surface-container">
      {/* ── Section Title ────────────────────────────────────────────── */}
      <h2 className="font-headline text-xs font-bold tracking-[0.4em] uppercase text-center mb-16 text-black/50">
        Tủ Đồ Thiết Yếu
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
