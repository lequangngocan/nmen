"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

export default function SortDropdown({ sortOptions, defaultSortValue }) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  const currentSort = searchParams.get("sort") || defaultSortValue;
  const currentSortLabel = sortOptions.find(o => o.value === currentSort)?.label || sortOptions[0].label;

  const getSortUrl = (sortValue) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("sort", sortValue);
    return `${pathname}?${p.toString()}`;
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative z-40" ref={dropdownRef}>
      <div 
        className="flex items-center space-x-2 border-b border-black pb-2 justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-headline font-bold text-xs uppercase tracking-tighter text-black">
          Sắp xếp: {currentSortLabel}
        </span>
        <ChevronDown size={14} className={`text-black transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      <div 
        className={`absolute top-full right-0 pt-2 z-50 min-w-full transition-all duration-200 origin-top ${
          isOpen ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-0 pointer-events-none"
        }`}
      >
        <div className="bg-white shadow-xl border border-stone-100">
          {sortOptions.map((o) => (
            <Link 
              key={o.value} 
              href={getSortUrl(o.value)} 
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 text-[10px] font-label uppercase tracking-widest transition-colors whitespace-nowrap ${
                currentSort === o.value ? "bg-stone-100 text-black font-bold" : "text-stone-500 hover:bg-stone-50 hover:text-black"
              }`}
            >
              {o.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
