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
        className="lg:hidden flex-1 md:flex-none flex items-center justify-center gap-2 border border-gray-300 px-4 py-3 font-bold uppercase text-xs"
      >
        <SlidersHorizontal size={14} /> Lọc sản phẩm
      </button>

      {/* Giao diện Drawer bật lên (hiển thị khi isOpen = true) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          
          {/* Lớp màn đen mờ (ấn vào đây sẽ đóng) */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Khung trắng chứa nội dung bộ lọc (Rộng 80% màn hình, nằm bên phải) */}
          <div className="relative w-4/5 max-w-sm bg-white h-full ml-auto flex flex-col shadow-xl">
            
            {/* Header của Drawer */}
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-bold text-lg uppercase">Bộ lọc</span>
              <button onClick={() => setIsOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            {/* Vùng cuộn của Bộ lọc */}
            <div className="flex-1 overflow-y-auto p-6 pb-20">
              {/* Gọi component FilterSidebar vào đây, truyền thêm class block để đè lên lệnh ẩn trên desktop */}
              <FilterSidebar className="block w-full" />
            </div>

            {/* Nút xác nhận dính ở dưới đáy */}
            <div className="absolute bottom-0 left-0 w-full p-4 border-t bg-white">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full bg-black text-white py-3 font-bold uppercase"
              >
                Áp dụng
              </button>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
