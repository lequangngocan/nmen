import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

/**
 * Product Card Component
 * Refined based on Stitch design tokens and user specifications:
 * - 3:4 aspect ratio for images
 * - Smooth hover transition between image1 and image2
 * - Typography: Inter Semi-bold for name, neutral gray for price
 */
export default function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.id}`} className="group cursor-pointer flex flex-col">
      {/* ── Image Container ────────────────────────────────────────────── */}
      <div className="relative w-full aspect-3/4 overflow-hidden bg-stone-100">
        
        {/* Primary Image */}
        <Image
          src={product.image1}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
        />
        
        {/* Secondary Image (Hover State) */}
        <Image
          src={product.image2}
          alt={`${product.name} alternate view`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover absolute inset-0 opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-105"
        />

        {/* Favorite Icon inside image, visible on hover */}
        <div className="absolute top-4 right-4 text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <Heart size={20} strokeWidth={1.5} className="hover:fill-black transition-colors" />
        </div>
      </div>

      {/* ── Product Info ────────────────────────────────────────────────── */}
      <div className="mt-5 flex flex-col">
        {/* Category: Small uppercase text */}
        <p className="font-label text-[10px] uppercase tracking-widest text-stone-500 mb-1.5">
          {product.category}
        </p>
        
        {/* Name: Inter Semi-bold as requested */}
        <h3 className="font-label font-semibold text-sm text-black tracking-tight line-clamp-1">
          {product.name}
        </h3>
        
        {/* Price: Neutral gray */}
        <p className="font-label text-sm mt-1.5 text-stone-500">
          {product.price.toLocaleString("vi-VN")} đ
        </p>
      </div>
    </Link>
  );
}
