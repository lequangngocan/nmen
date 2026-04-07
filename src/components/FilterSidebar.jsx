"use client";

import { useState } from "react";

// mảng chứa các danh mục quần áo
const CATEGORIES = [
  { name: "Jackets", count: 24 },
  { name: "Shirts", count: 48 },
  { name: "Pants", count: 32 },
];

// mảng tính năng rỗng để chứa cái size
const SIZES = ["S", "M", "L", "XL"];

// màu của đồ
const COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "Blue", hex: "#1e3a8a" },
  { name: "Tan", hex: "#D2B48C" },
];

export default function FilterSidebar({ className }) {
  // khai báo biến state cho mảng
  const [activeCategory, setActiveCategory] = useState("Jackets"); // biến chứa tên nút đang nhấp
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  
  // biến giá
  const [priceMax, setPriceMax] = useState(1000);

  // Hàm chọn/bỏ chọn Size
  const toggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      // Nếu đã có thì lọc bỏ đi
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      // Nếu chưa có thì thêm vào mảng
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  // hàm xử lý bật/tắt color
  const toggleColor = (colorHex) => {
    if (selectedColors.includes(colorHex)) {
      setSelectedColors(selectedColors.filter((c) => c !== colorHex));
    } else {
      setSelectedColors([...selectedColors, colorHex]); // đẩy vô mảng state
    }
  };

  return (
    // cái này hiển thị 2 cục div cho pc và đt
    <aside className={`w-full md:w-64 space-y-10 ${className ? className : "hidden lg:block"}`}>
      
      {/* ── Category (Danh mục) ── */}
      <div>
        <h3 className="font-bold uppercase border-b pb-2 mb-4">Danh Mục</h3>
        <ul className="flex flex-col gap-3">
          {CATEGORIES.map((cat) => (
            <li 
              key={cat.name} 
              onClick={() => setActiveCategory(cat.name)}
              className="flex justify-between cursor-pointer"
            >
              {/* Thêm class in đậm nếu danh mục này đang active */}
              <span className={cat.name === activeCategory ? "font-bold text-black" : "text-gray-500 hover:text-black"}>
                {cat.name}
              </span>
              <span className="text-gray-400 text-sm">({cat.count})</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Size (Kích thước) ── */}
      <div>
        <h3 className="font-bold uppercase border-b pb-2 mb-4">Kích thước</h3>
        <div className="grid grid-cols-2 gap-2">
          {SIZES.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <label 
                key={size}
                className={`border text-center py-2 cursor-pointer ${
                  isSelected ? "bg-black text-white" : "bg-white text-black"
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
        <h3 className="font-bold uppercase border-b pb-2 mb-4">Màu Sắc</h3>
        <div className="flex gap-4">
          {COLORS.map((color) => {
            const isSelected = selectedColors.includes(color.hex);
            return (
              <label key={color.name} className="cursor-pointer" title={color.name}>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={isSelected}
                  onChange={() => toggleColor(color.hex)}
                />
                <span 
                  className={`block w-8 h-8 rounded-full border border-gray-300 ${isSelected ? "ring-2 ring-offset-2 ring-black" : ""}`}
                  style={{ backgroundColor: color.hex }}
                ></span>
              </label>
            )
          })}
        </div>
      </div>

      {/* thanh trượt làm bằng input thuần html */}
      <div>
        <h3 className="font-bold uppercase border-b pb-2 mb-4">Giá (Tối đa)</h3>
        {/* input chỉnh range giá */}
        <input 
          type="range" 
          min="50" 
          max="1500" 
          step="10" 
          value={priceMax} 
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full mb-2 accent-black" 
        />
        <div className="flex justify-between text-sm text-gray-500 font-bold">
          <span>$50</span>
          <span>${priceMax}</span>
        </div>
      </div>
      
    </aside>
  );
}
