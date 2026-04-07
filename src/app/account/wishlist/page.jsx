"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

// Dữ liệu giả lập 4 món hàng sinh viên yêu thích lưu
const MOCK_WISHLIST = [
  {
    id: "w1",
    name: "Structured Wool Coat",
    price: 890.00,
    category: "Outerwear",
    color: "Charcoal",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0yLABgqNj4OjqYRaWH77kJ1ulJ7UxWw7P5RRc8ZFbe3vCPr1SsQunAZ2lolcnJZ74nFua8LveyeXOo83gKQCWx8wHw_ZvQmjJUWEWw1fk5iFSIf6fjFAmYVX48pKnX_iLfj-o434D1Qe18cGM05D0PEWvG8Er4aQAJyk7pINSmrBlFdXusfXEFcjiBG9hKApBvrcHHZ2GbTZ52A232K8iGA0mILzuOaRscya8_-p0lx1bRgHFq_ceU0uGypfrQ28p2_E3qLerFQ"
  },
  {
    id: "w2",
    name: "Heavyweight Tee",
    price: 85.00,
    category: "Essentials",
    color: "Optical White",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmlatJdqz5-5IU0kqXU1yCV-fLp7dPzn3wUXvNIdSKTEnjD_MaK0UA0YnHsaQurjIFnUDKNC216KX6m7OZ7GtlTi2lprMub4rvcQ6UbDP1W-6woKfcgDIUKu4ShE9fOmBZHpUrn8iC0t-WVZPr_o-axQ7N8IjWRgAYFRxm-XjgPQ8ch-a9pXab23B-2YBKheJQrO9GrRvXdcrvNqsNl06R5Ai69JmGiOs3bm3nuQS53uehiTr1Rx1cJx2jml4tlygfaUb7LsiVYw"
  },
  {
    id: "w3",
    name: "Asymmetric Leather Jacket",
    price: 1250.00,
    category: "Limited",
    color: "Nero",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAs4RriRP26E96w-Atn007ULEqX-vM1WMQGiCTBpD6N389NChQFWyRQMaIKNl-4rNHZ1nXfO4uyHygJnYeT4lP_3mWtDoB_oGCOWNYEGikFP9rtSb6e8DEpSytzIfGvg-acL9FIkp9q1ZIiLZnHbzJX7b4SKD6e9_wRj-qZyPwUdGLkKbJXv8IzIKQoINLuVYpvuVIF2sJ5IYEZlt_V3KASsIYhCB1AEotrIBCqwn5STxFB8gdK-FprMYd7zva0lgn_7gybZs_P_w"
  },
  {
    id: "w4",
    name: "Suede Chelsea Boot",
    price: 320.00,
    category: "Footwear",
    color: "Onyx",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDCAMe1RJUL3mXvzkxfMGYEawpsfA--reXRTyQvmRRj-JRNKn8uxHXd7Ou42eTN3MFAa4fsJTJ-2Cd-pF0LwF751RGaNUnxVlIv5Iqs4-RFrmJ8_X-HFeWDNgrFN3e9mY8aY7NESdv0DNQGWwpK_sSkTtRR9rWtL68HDWmDW3YPVUf5gap3X12ZL9f-CVcO0YG8mwmVallSJbbISa8zN2SbqLTihX96nALTxPC8J8vIsCO-oFY1vaOmxKHXsHCDlUbub2IqyjpJQ"
  }
];

export default function WishlistNestedPage() {
  const [wishlistItems, setWishlistItems] = useState(MOCK_WISHLIST);

  const removeItem = (id) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id));
  };

  const handleAddToCart = (itemName) => {
    alert(`Đã thêm siêu phẩm "${itemName}" vào giỏ hàng!`);
  };

  return (
    <section>
      
      {/* Tiêu đề Box Wishlist */}
      <header className="mb-16">
        <h1 className="font-headline text-4xl lg:text-5xl font-black tracking-tighter uppercase mb-4 text-black mt-3">Wishlist</h1>
        <p className="text-stone-500 font-label uppercase text-xs tracking-widest">
          You have {wishlistItems.length} items saved for later
        </p>
      </header>

      {/* RENDER GRID DANH SÁCH MÓN HÀNG (Chuẩn 4 Cột V2) */}
      {wishlistItems.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-stone-300">
          <p className="font-body text-xl text-stone-500 mb-6">Your wishlist is completely empty.</p>
          <Link href="/clothing" className="inline-block px-8 py-4 bg-black text-white font-bold uppercase text-sm tracking-widest hover:bg-stone-800 transition">
            Explore Fashion
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {wishlistItems.map((item) => (
            <div key={item.id} className="group flex flex-col">
              
              {/* Ảnh bìa */}
              <div className="aspect-[3/4] bg-stone-200 mb-6 relative overflow-hidden">
                <Image 
                  src={item.image} 
                  alt={item.name} 
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                />
                <button 
                  onClick={() => removeItem(item.id)}
                  className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 text-black hover:bg-black hover:text-white transition-all z-10"
                  title="Remove from Wishlist"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tựa đề & Giá */}
              <div className="space-y-2 flex-grow">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-headline font-bold uppercase text-sm tracking-tight text-black">{item.name}</h3>
                  <span className="font-label text-sm text-stone-500 shrink-0">
                    ${item.price.toLocaleString("en-US", {minimumFractionDigits: 0})}
                  </span>
                </div>
                <p className="text-stone-400 text-xs uppercase tracking-widest">
                  {item.category} / {item.color}
                </p>
              </div>

              {/* Nút giả lập bỏ vào giỏ hàng & Xóa */}
              <div className="pt-4 space-y-2 mt-auto">
                <button 
                  onClick={() => handleAddToCart(item.name)}
                  className="w-full py-4 bg-black text-white font-headline font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-stone-800 transition-all active:scale-[0.98]"
                >
                  Add to Cart
                </button>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="w-full py-2 text-stone-500 font-label uppercase text-[10px] tracking-widest hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </section>
  );
}
