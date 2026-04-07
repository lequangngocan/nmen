import Link from "next/link";
import ProductCard from "./ProductCard";
import { MOCK_NEW_ARRIVALS } from "@/constants/products";

export default function NewArrivals() {
  return (
    <section className="py-24 px-6 md:px-12 bg-surface">
      
      {/* ── Section Header ─────────────────────────────────────────────── */}
      <div className="flex justify-between items-end mb-16">
        <div>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tighter uppercase mb-2 text-black">
            New Arrivals
          </h2>
          <p className="font-body text-stone-500 text-xs md:text-sm uppercase tracking-widest">
            Selected pieces for the modern silhouette
          </p>
        </div>
        
        <Link 
          href="/new-arrivals"
          className="font-headline text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-1 hover:opacity-60 transition-opacity whitespace-nowrap shrink-0 ml-4"
        >
          View All
        </Link>
      </div>

      {/* ── Product Grid ─────────────────────────────────────────────────
          Using exactly gap-1 as per the Stitch design snippet for a 
          tight editorial grid feeling. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
        {MOCK_NEW_ARRIVALS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
    </section>
  );
}
