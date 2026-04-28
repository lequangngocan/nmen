import Image from "next/image";
import Link from "next/link";
import WishlistButton from "@/components/WishlistButton";

export default function ProductCard({ product }) {
  const img1 = product.primary_image || '/placeholder.svg';
  const img2 = product.hover_image || img1;

  return (
    <Link href={`/product/${product.slug}`} className="group cursor-pointer flex flex-col">
      {/* Image Container */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-stone-100">
        
        {/* Primary Image */}
        <Image
          src={img1}
          alt={product.name}
          fill
          unoptimized
          className="object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
        />
        
        {/* Secondary Image (Hover) */}
        <Image
          src={img2}
          alt={product.name}
          fill
          unoptimized
          className="object-cover opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-105"
        />

        {/* Wishlist Icon */}
        <WishlistButton product={product} />
      </div>

      {/* Product Info */}
      <div className="mt-5 flex flex-col">
        <p className="font-label text-[10px] uppercase tracking-widest text-stone-500 mb-1.5">
          {product.category}
        </p>
        <h3 className="font-label font-semibold text-sm text-black tracking-tight line-clamp-1">
          {product.name}
        </h3>
        <div className="font-label text-sm mt-1.5 flex items-center gap-2">
          {product.sale_price ? (
            <>
              <span className="text-red-600 font-medium">{product.sale_price.toLocaleString("vi-VN")} đ</span>
              <span className="text-stone-400 line-through text-xs">{product.price.toLocaleString("vi-VN")} đ</span>
            </>
          ) : (
            <span className="text-stone-500">{product.price.toLocaleString("vi-VN")} đ</span>
          )}
        </div>
      </div>
    </Link>
  );
}
