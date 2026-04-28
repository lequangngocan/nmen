"use client";

import { useState } from "react";
import FilterSidebar from "./FilterSidebar";
import { SlidersHorizontal, X } from "lucide-react";

export default function MobileFilterDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Nút bấm để mở bộ lọc trên Mobile */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex-1 md:flex-none flex items-center justify-center gap-2 border border-gray-300 px-4 py-3 font-bold uppercase text-xs cursor-pointer"
      >
        <SlidersHorizontal size={14} /> Lọc sản phẩm
      </button>

      {/* Giao diện Drawer bật lên (Luôn render để chạy animation CSS) */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden flex transition-all duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        
        {/* Lớp màn nền mờ (Backdrop Blur thay vì nền đen) */}
        <div 
          className="absolute inset-0 bg-white/20 backdrop-blur-md transition-opacity duration-300" 
          onClick={() => setIsOpen(false)} 
        />
        
        {/* Khung trắng chứa nội dung bộ lọc (Nằm bên TRÁI: mr-auto) */}
        <div 
          className={`relative w-4/5 max-w-sm bg-white h-full mr-auto flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          
          {/* Header của Drawer */}
          <div className="flex items-center justify-between p-4 border-b">
            <span className="font-headline font-bold text-lg uppercase">Bộ lọc</span>
            <button onClick={() => setIsOpen(false)} className="cursor-pointer hover:rotate-90 transition-transform">
              <X size={24} />
            </button>
          </div>
          
          {/* Vùng cuộn của Bộ lọc */}
          <div className="flex-1 overflow-y-auto p-6">
            <FilterSidebar className="block w-full" onApplyMobile={() => setIsOpen(false)} />
          </div>
          
        </div>
      </div>
    </>
  );
}
