"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/context/WishlistContext";
import { getFullUrl } from "@/lib/api";

export default function WishlistNestedPage() {
  const router = useRouter();
  const { mounted, user } = useAuth();
  const { items: wishlistItems, removeFromWishlist } = useWishlist();

  const handleAddToCart = (productSlug) => {
    // Chuyển hướng sang trang chi tiết để chọn màu/size
    router.push(`/product/${productSlug}`);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 font-headline uppercase tracking-widest text-stone-500">
        Vui lòng đăng nhập để xem danh sách yêu thích.
      </div>
    );
  }

  return (
    <section>
      <header className="mb-16">
        <h1 className="font-headline text-4xl lg:text-5xl font-black tracking-tighter uppercase mb-4 text-black mt-3">Danh sách yêu thích</h1>
        <p className="text-stone-500 font-label uppercase text-xs tracking-widest">
          Bạn có {wishlistItems.length} sản phẩm đã lưu
        </p>
      </header>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-stone-300">
          <p className="font-body text-xl text-stone-500 mb-6">Danh sách yêu thích của bạn đang trống.</p>
          <Link href="/clothing" className="inline-block px-8 py-4 bg-black text-white font-bold uppercase text-sm tracking-widest hover:bg-stone-800 transition">
            Khám phá ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {wishlistItems.map((item) => (
            <div key={item.product_id} className="group flex flex-col">
              
              <div className="aspect-[3/4] bg-stone-200 mb-6 relative overflow-hidden">
                <Link href={`/product/${item.slug}`}>
                  <Image 
                    src={getFullUrl(item.primary_image) || "/placeholder.svg"} 
                    alt={item.name} 
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                    unoptimized
                  />
                </Link>
                <button 
                  onClick={() => removeFromWishlist(item.product_id)}
                  className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 text-black hover:bg-black hover:text-white transition-all z-10"
                  title="Remove from Wishlist"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2 flex-grow">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-headline font-bold uppercase text-sm tracking-tight text-black line-clamp-1">{item.name}</h3>
                  <div className="flex flex-col items-end shrink-0">
                    {item.sale_price ? (
                      <>
                        <span className="font-label text-sm text-red-600 font-bold">
                          {Number(item.sale_price).toLocaleString("vi-VN")} đ
                        </span>
                        <span className="font-label text-xs text-stone-400 line-through">
                          {Number(item.price).toLocaleString("vi-VN")} đ
                        </span>
                      </>
                    ) : (
                      <span className="font-label text-sm text-stone-500">
                        {Number(item.price).toLocaleString("vi-VN")} đ
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-stone-400 text-xs uppercase tracking-widest">
                  {item.category_name || "Sản phẩm"}
                </p>
              </div>

              <div className="pt-4 mt-auto">
                <button 
                  onClick={() => handleAddToCart(item.slug)}
                  className="w-full py-4 bg-black text-white font-headline font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-stone-800 transition-all active:scale-[0.98]"
                >
                  Xem chi tiết
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </section>
  );
}
