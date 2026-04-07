"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Star, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { MOCK_NEW_ARRIVALS } from "@/constants/products";

export default function ProductDetailPage({ params }) {
  // state lưu kích thước khách chọn
  const [selectedSize, setSelectedSize] = useState("M");
  
  // state lưu màu khách chọn
  const [selectedColor, setSelectedColor] = useState("#2f2f2f");

  // lấy mảng size để in ra loop
  const SIZES = ["S", "M", "L", "XL"];
  
  // lấy mảng màu
  const COLORS = ["#2f2f2f", "#4a3728", "#1a1c1c"];

  // Giả lập chức năng mở giỏ hàng (chưa code)
  const handleAddToCart = () => {
    alert("Đã thêm vào giỏ hàng! (Chức năng đang phát triển)");
  };

  return (
    <div className="min-h-screen px-0 mx-auto w-full">
      
      {/* Khung chứa ảnh và giá chia làm 2 cột đt/pc */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* bên trái: Cột hiển thị ảnh sản phẩm to bự (chia 7 grid) */}
        <div className="lg:col-span-7 bg-stone-200 flex flex-col gap-0">
          {/* ảnh chính */}
          <div className="aspect-4/5 w-full overflow-hidden relative">
            <Image 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeQYuyXgRJVwvc5SDw3Jz0dOJgU6j2zOkthJlollUKmtupIBNBkmxE8GLHfHR0WecE6isHQk-22Rs7yvLGu9BBLbY9YeHeC633P52VWZFZC5tvgZmSItuH__wyNBqLeuFX4ylmuHJymIvXXzJsyL3O52b9kvHE2KKer9erVPmdVL7xmaQBqjTy502NGXFr_Gokg6HkmRLZjOrtDrHbjtNv3vlg49U4ln_z7aj9W1MfBGf3WllqBrUVnOm8csAryRJ6x5wblpwYUQ"
              alt="Ảnh chính áo khoác" 
              fill
              className="object-cover"
            />
          </div>
          {/* 2 ảnh vuông phụ ghép dọc */}
          <div className="grid grid-cols-2 gap-0 border-t border-stone-300">
            <div className="aspect-square relative bg-stone-100">
              <Image 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsZpKc5kORs32GtLCnIoBL5BG2-8Kq5biHk_4qlqL8gKEFreprR50Z_0sGbQjgcVr9dn2b-oVoRIpCTNJtIFxU1zKuKrsN3QkWIzTe57DJ0hbVkNwJ22CkXqsw6BHRhafiK3tGFS30ZZrCNTo1Bd-GxzgnbCXWoKNESyVLOZh_XNaV1SefT1qapYcblpyNjnUmaLirEy7RvGGGHwXnhFcbBPWkDvi6nikW2WKQQ7qUMkJfObnVM_-GG89Z6At3TVPJ4YvApUC8hQ"
                alt="Chất liệu" 
                fill
                className="object-cover"
              />
            </div>
            <div className="aspect-square relative bg-stone-100">
              <Image 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWfXErLUoP0yqjO0d8AQXw_e4orUPZ-V_LYHtZaasoQgvUktm16NRZ9bHWnjw0OWDyUJ5VcHtDfOQbMfffpxpTgDo0NQFgTGeeDqOBFrRAoy5NS6nVu8G2h6Tnl9MdHsEuqhartj8s2_86pAD5qlxpowokRYLaq834Fj3RkeKU21O_PYv7tAVwI4ZaAL0_k_IYM0Dfm9y5-hR0onmehX9QTm_iklAdiR3_djy51YMWFgFgc0n-Mgx_3ebtpX_lr_ScrvyjjDb1TA"
                alt="Người mẫu mặc" 
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* bên phải: form thông tin chọn size màu (5 grid) */}
        <div className="lg:col-span-5 px-8 lg:px-20 pt-8 pb-12 lg:pt-8 lg:pb-24 lg:sticky lg:top-24 self-start bg-surface">
          <div className="flex flex-col gap-12">
            
            {/* Tên và Giá hiển thị */}
            <div className="space-y-4 text-left">
              <Breadcrumbs />
              <p className="font-label text-xs uppercase tracking-[0.2em] text-stone-500 mt-4">Outerwear / Collection 04</p>
              <h1 className="font-headline text-5xl font-extrabold tracking-tighter leading-none">The Essential NMen Suede Jacket</h1>
              <p className="font-headline text-2xl font-light text-black">$350.00</p>
            </div>
            
            {/* đường kẻ ngang */}
            <div className="w-full h-px bg-stone-200"></div>
            
            {/* Các nút bấm */}
            <div className="space-y-8">
              
              {/* Chọn màu */}
              <div className="space-y-4">
                <span className="font-label text-[10px] uppercase tracking-widest text-stone-500">Select Color / Anthracite</span>
                <div className="flex gap-4">
                  {COLORS.map((color) => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full ${selectedColor === color ? 'ring-2 ring-offset-2 ring-black' : 'opacity-40 hover:opacity-100'}`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
              </div>
              
              {/* Chọn kích thước */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="font-label text-[10px] uppercase tracking-widest text-stone-500">Select Size</span>
                  <button className="font-label text-[10px] uppercase tracking-widest underline underline-offset-4 text-stone-700 hover:text-black">Size Guide</button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {SIZES.map((size) => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-4 font-label text-sm transition-all ${selectedSize === size ? 'border border-black font-bold' : 'border border-stone-200 hover:border-black'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Thêm giỏ hàng */}
            <div className="space-y-4">
              <button 
                onClick={handleAddToCart}
                className="w-full py-6 bg-black text-white font-headline font-bold uppercase tracking-widest hover:bg-stone-800"
              >
                Add to Cart
              </button>
              <button className="w-full py-4 border border-stone-200 font-label text-[10px] uppercase tracking-widest hover:bg-stone-50 flex items-center justify-center gap-2">
                <Heart size={14} />
                Add to Wishlist
              </button>
            </div>
            
            {/* Accordion chi tiết dài dài */}
            <div className="space-y-6">
              <details className="group border-b border-stone-200 pb-4" open>
                <summary className="list-none flex justify-between items-center cursor-pointer font-headline font-bold uppercase text-xs tracking-widest">
                  Description
                  <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
                </summary>
                <p className="pt-4 text-sm leading-relaxed text-stone-600 font-body">
                  A cornerstone of the NMen silhouette. Crafted from buttery-soft Italian goatskin suede, this jacket features a minimalist tailored cut, hidden horn-button closures, and a semi-structured shoulder for an architectural profile.
                </p>
              </details>

              <details className="group border-b border-stone-200 pb-4">
                <summary className="list-none flex justify-between items-center cursor-pointer font-headline font-bold uppercase text-xs tracking-widest">
                  Composition & Care
                  <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
                </summary>
                <p className="pt-4 text-sm leading-relaxed text-stone-600 font-body">
                  100% Suede Leather. Lining: 100% Cupro. Professional leather clean only. Handle with care.
                </p>
              </details>
            </div>

          </div>
        </div>
      </section>
      
      {/* Gợi Ý Sản Phẩm dưới đáy */}
      <section className="py-32 px-12 bg-stone-100">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-4">
          <h2 className="font-headline text-4xl font-black tracking-tighter uppercase text-black">Complete the Look</h2>
          <div className="h-px grow mx-12 hidden md:block bg-stone-300"></div>
          <a className="font-label text-xs uppercase tracking-widest border-b border-black text-black" href="/clothing">View All Collection</a>
        </div>
        
        {/* Render 3 cái áo quần bên dưới bằng mảng cứng */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {MOCK_NEW_ARRIVALS.slice(1, 4).map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>

      {/* Review bằng tay */}
      <section className="py-32 px-12 bg-surface">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="font-headline text-3xl font-black uppercase tracking-tighter text-black">Verified Reviews</h2>
            <div className="flex justify-center items-center gap-1 text-black">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={14} className="fill-black" />
              ))}
              <span className="font-label text-xs ml-2">4.9 / 5.0 (24 Reviews)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-16 text-black">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-headline font-bold uppercase text-sm">Marcus V.</h4>
                <span className="font-label text-[10px] text-stone-500">MARCH 12, 2024</span>
              </div>
              <p className="font-body text-sm leading-relaxed text-stone-600 max-w-2xl">
                "The quality of the suede is unparalleled at this price point. The cut is modern but not overly slim. It feels substantial and looks incredibly premium."
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-headline font-bold uppercase text-sm">Julian S.</h4>
                <span className="font-label text-[10px] text-stone-500">FEBRUARY 28, 2024</span>
              </div>
              <p className="font-body text-sm leading-relaxed text-stone-600 max-w-2xl">
                "Perfect architectural silhouette. Pairs exceptionally well with the tailored trousers. A true investment piece for the minimalist wardrobe."
              </p>
            </div>
          </div>
          
          <div className="mt-20 flex justify-center text-black">
            <button className="px-12 py-4 border border-black font-headline font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all">
              Write a Review
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
