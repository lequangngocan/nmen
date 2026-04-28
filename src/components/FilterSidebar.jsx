"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const SIZES = ["S", "M", "L", "XL", "XXL"];
const COLORS = [
  { name: "Đen", hex: "#000000" },
  { name: "Trắng", hex: "#ffffff" },
  { name: "Xám", hex: "#6b7280" },
  { name: "Xanh lam", hex: "#1e3a8a" },
  { name: "Nâu", hex: "#D2B48C" },
];

export default function FilterSidebar({ className, onApplyMobile }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [categories, setCategories] = useState([]);
  
  // Local state cho bộ lọc (không tự động push router)
  const [localCategory, setLocalCategory] = useState("");
  const [localSizes, setLocalSizes] = useState([]);
  const [localColors, setLocalColors] = useState([]);
  const [localPrice, setLocalPrice] = useState(20000000);

  // Sync state từ URL khi trang load hoặc URL thay đổi
  useEffect(() => {
    setLocalCategory(searchParams.get("category") || "");
    setLocalSizes(searchParams.get("size") ? searchParams.get("size").split(",") : []);
    setLocalColors(searchParams.get("color") ? searchParams.get("color").split(",") : []);
    setLocalPrice(searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 20000000);
  }, [searchParams]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          let list = [];
          data.forEach(c => {
             list.push(c);
             if (c.children) list.push(...c.children);
          });
          setCategories(list);
        }
      })
      .catch(() => {});
  }, []);

  const toggleSize = (size) => {
    setLocalSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (colorHex) => {
    setLocalColors(prev => 
      prev.includes(colorHex) ? prev.filter(c => c !== colorHex) : [...prev, colorHex]
    );
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (localCategory) params.set("category", localCategory);
    else params.delete("category");
    
    if (localSizes.length > 0) params.set("size", localSizes.join(","));
    else params.delete("size");
    
    if (localColors.length > 0) params.set("color", localColors.join(","));
    else params.delete("color");
    
    if (localPrice < 20000000) params.set("maxPrice", localPrice);
    else params.delete("maxPrice");
    
    router.push(`${pathname}?${params.toString()}`);
    
    if (onApplyMobile) onApplyMobile();
  };

  const handleClearFilters = () => {
    setLocalCategory("");
    setLocalSizes([]);
    setLocalColors([]);
    setLocalPrice(20000000);
    
    // Giữ lại sort nếu có
    const params = new URLSearchParams();
    if (searchParams.get("sort")) params.set("sort", searchParams.get("sort"));
    if (searchParams.get("search")) params.set("search", searchParams.get("search"));
    
    router.push(`${pathname}?${params.toString()}`);
    
    if (onApplyMobile) onApplyMobile();
  };

  return (
    <aside className={`w-full md:w-64 flex flex-col h-full ${className ? className : "hidden lg:block"}`}>
      
      <div className="space-y-10 flex-1 overflow-y-auto pb-6">
        {/* ── Category (Danh mục) ── */}
        <div>
          <h3 className="font-headline font-bold uppercase border-b border-black pb-2 mb-4 text-xs tracking-widest text-black">Danh Mục</h3>
          <ul className="flex flex-col gap-3">
            <li className="flex justify-between cursor-pointer group">
              <button 
                onClick={() => setLocalCategory("")}
                className={`font-label text-xs tracking-widest uppercase cursor-pointer ${!localCategory ? "font-bold text-black border-b border-black" : "text-stone-500 group-hover:text-black"}`}
              >
                Tất cả
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id} className="flex justify-between cursor-pointer group">
                <button 
                  onClick={() => setLocalCategory(cat.slug)}
                  className={`font-label text-xs tracking-widest uppercase cursor-pointer ${cat.slug === localCategory ? "font-bold text-black border-b border-black" : "text-stone-500 group-hover:text-black"}`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Size (Kích thước) ── */}
        <div>
          <h3 className="font-headline font-bold uppercase border-b border-black pb-2 mb-4 text-xs tracking-widest text-black">Kích thước</h3>
          <div className="grid grid-cols-2 gap-2">
            {SIZES.map((size) => {
              const isSelected = localSizes.includes(size);
              return (
                <label 
                  key={size}
                  className={`border text-center py-3 cursor-pointer transition-all font-label text-xs ${
                    isSelected ? "bg-black text-white border-black font-bold" : "bg-white text-black border-stone-200 hover:border-black"
                  }`}
                >
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={isSelected}
                    onChange={() => toggleSize(size)} 
                  />
                  {size}
                </label>
              )
            })}
          </div>
        </div>

        {/* ── Color (Màu sắc) ── */}
        <div>
          <h3 className="font-headline font-bold uppercase border-b border-black pb-2 mb-4 text-xs tracking-widest text-black">Màu Sắc</h3>
          <div className="flex flex-wrap gap-4">
            {COLORS.map((color) => {
              const isSelected = localColors.includes(color.hex);
              return (
                <label key={color.name} className="cursor-pointer" title={color.name}>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={isSelected}
                    onChange={() => toggleColor(color.hex)}
                  />
                  <div 
                    className={`flex items-center justify-center w-8 h-8 rounded-full border border-stone-300 transition-all ${isSelected ? "ring-2 ring-offset-2 ring-black" : "opacity-80 hover:opacity-100"}`}
                    style={{ backgroundColor: color.hex }}
                  >
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {/* ── Giá (Tối đa) ── */}
        <div>
          <h3 className="font-headline font-bold uppercase border-b border-black pb-2 mb-4 text-xs tracking-widest text-black">Giá (Tối đa)</h3>
          <input 
            type="range" 
            min="500000" 
            max="20000000" 
            step="500000" 
            value={localPrice} 
            onChange={(e) => setLocalPrice(Number(e.target.value))}
            className="w-full mb-4 accent-black cursor-pointer" 
          />
          <div className="flex justify-between text-[10px] font-label tracking-widest uppercase text-stone-500 font-bold">
            <span>500k đ</span>
            <span>{localPrice >= 20000000 ? "Tất cả" : `${(localPrice / 1000).toLocaleString("vi-VN")}k đ`}</span>
          </div>
        </div>
      </div>

      {/* ── Nút Lọc và Bỏ Lọc ── */}
      <div className="flex gap-4 pt-6 mt-auto">
        <button 
          onClick={handleClearFilters}
          className="flex-1 py-3 border border-stone-300 font-headline font-bold text-xs uppercase tracking-widest text-stone-600 hover:border-black hover:text-black transition-colors cursor-pointer"
        >
          Bỏ Lọc
        </button>
        <button 
          onClick={handleApplyFilters}
          className="flex-1 py-3 bg-black border border-black font-headline font-bold text-xs uppercase tracking-widest text-white hover:bg-stone-800 transition-colors cursor-pointer"
        >
          Lọc
        </button>
      </div>
      
    </aside>
  );
}
