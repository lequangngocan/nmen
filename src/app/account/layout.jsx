"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, ReceiptText, Heart, LogOut } from "lucide-react";

export default function AccountLayout({ children }) {
  const pathname = usePathname();

  // Helper để kiểm tra Link nào đang active dựa trên pathname hiện tại
  const isActive = (path) => pathname === path;

  return (
    <div className="pt-24 lg:pt-32 min-h-screen bg-stone-50 px-6 lg:px-12 pb-24 text-black">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-x-12 mt-12">
        
        {/* CỘT TRÁI: SIDEBAR NAVIGATION DÙNG CHUNG CHO MỌI TAB TRONG ACCOUNT */}
        <aside className="lg:col-span-3 mb-12 lg:mb-0">
          <div className="sticky top-32 space-y-8">
            <h2 className="font-headline text-xs font-black tracking-widest uppercase text-stone-400">My Account</h2>
            
            <nav className="flex flex-col gap-4">
              
              <Link 
                href="/" 
                className="flex items-center gap-3 font-label text-sm font-medium text-stone-500 hover:text-black transition-colors py-2 group"
              >
                <Home size={20} />
                Home
              </Link>

              <Link 
                href="/account" 
                className={`flex items-center gap-3 font-label text-sm py-2 ${
                  isActive('/account') 
                    ? 'font-bold text-black border-r-2 border-black' 
                    : 'font-medium text-stone-500 hover:text-black transition-colors group'
                }`}
              >
                <User size={20} className={isActive('/account') ? "fill-black" : ""} />
                Profile
              </Link>
              
              <Link 
                href="/account/history" 
                className={`flex items-center gap-3 font-label text-sm py-2 ${
                  isActive('/account/history') 
                    ? 'font-bold text-black border-r-2 border-black' 
                    : 'font-medium text-stone-500 hover:text-black transition-colors group'
                }`}
              >
                <ReceiptText size={20} className={isActive('/account/history') ? "fill-black" : ""} />
                Order History
              </Link>

              <Link 
                href="/account/wishlist" 
                className={`flex items-center gap-3 font-label text-sm py-2 ${
                  isActive('/account/wishlist') 
                    ? 'font-bold text-black border-r-2 border-black' 
                    : 'font-medium text-stone-500 hover:text-black transition-colors group'
                }`}
              >
                <Heart size={20} className={isActive('/account/wishlist') ? "fill-black" : ""} />
                Wishlist
              </Link>

              <div className="pt-6 border-t border-stone-200 mt-4">
                <button className="flex items-center gap-3 font-label text-sm font-medium text-red-600 hover:opacity-70 transition-opacity py-2 group">
                  <LogOut size={20} />
                  Sign Out
                </button>
              </div>

            </nav>

            {/* Member Perk Bonus Box */}
            <div className="pt-12 hidden lg:block">
              <div className="p-6 bg-stone-100 border-l-4 border-black">
                <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-black">Member Perk</p>
                <p className="font-body text-xs leading-relaxed text-stone-500">
                  Enjoy complimentary shipping on all orders over $250.
                </p>
              </div>
            </div>

          </div>
        </aside>

        {/* CỘT PHẢI: KHỐI CHỨA "RUỘT" DO CÁC TRANG CON ĐẨY LÊN */}
        <div className="lg:col-span-9">
          {children}
        </div>

      </div>
    </div>
  );
}
