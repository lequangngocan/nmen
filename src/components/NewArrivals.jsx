import Link from "next/link";
import ProductCard from "./ProductCard";
import { normalizeProduct } from "@/lib/api";

async function fetchProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`, {
      next: { revalidate: 60 }, // cache 60 giây
    });
    const data = await res.json();
    return Array.isArray(data) ? data.slice(0, 4).map(normalizeProduct) : [];
  } catch {
    return [];
  }
}

export default async function NewArrivals() {
  const products = await fetchProducts();

  return (
    <section className="py-24 px-6 md:px-12 bg-surface">
      
      {/* ── Section Header ─────────────────────────────────────────────── */}
      <div className="flex justify-between items-end mb-16">
        <div>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tighter uppercase mb-2 text-black">
            Tuyệt Tác Mới Nhất
          </h2>
          <p className="font-body text-stone-500 text-xs md:text-sm uppercase tracking-widest">
            Những điểm nhấn thời thượng nâng tầm tủ đồ
          </p>
        </div>
        
        <Link 
          href="/all"
          className="font-headline text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-1 hover:opacity-60 transition-opacity whitespace-nowrap shrink-0 ml-4"
        >
          Xem trọn bộ
        </Link>
      </div>

      {/* ── Product Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          // Skeleton khi không có dữ liệu
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-3/4 bg-stone-100 animate-pulse" />
          ))
        )}
      </div>
      
    </section>
  );
}
