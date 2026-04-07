"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
// import mấy cái icon
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  UserCircle2,
  ShoppingBasket,
  LogOut,
  ChevronRight,
} from "lucide-react";

const navLinks = [
  { label: "Trang chủ", href: "/" },
  { label: "Hàng mới", href: "/clothing" },
  { label: "Quần áo", href: "/clothing" },
  { label: "Phụ kiện", href: "/clothing" },
  { label: "Khuyến mãi", href: "/clothing" },
];

// link của phần user
const userMenuItems = [
  { label: "Tài khoản", href: "/account", Icon: UserCircle2 },
  { label: "Đơn mua", href: "/account/history", Icon: ShoppingBasket },
  { label: "Yêu thích", href: "/account/wishlist", Icon: Heart }, 
  { label: "Đăng xuất", href: "/login", Icon: LogOut, danger: true },
];

export default function Header() {
  // khai báo state cho react
  const [activeLink, setActiveLink] = useState("Trang chủ"); // lưu tab đang active
  const [mobileNavOpen, setMobileNavOpen] = useState(false); // ẩn hiện menu di động
  const [userDrawerOpen, setUserDrawerOpen] = useState(false); // ẩn hiện acc ở di động
  const [searchOpen, setSearchOpen] = useState(false); // bật ô search
  const [userMenuOpen, setUserMenuOpen] = useState(false); // bật dropdown menu pc

  // đang fix cứng là mốt có login sau
  const isLoggedIn = true;

  const pathname = usePathname();

  // useEffect để cuộn lên đầu khi bấm chuyển trang (chống lỗi màn hình)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  // hàm tắt hết menu đi
  const closeAll = () => {
    setMobileNavOpen(false);
    setUserDrawerOpen(false);
    setUserMenuOpen(false);
  };

  return (
    // phần navbar trên cùng
    <nav className="fixed top-0 w-full z-50 bg-stone-50/85 backdrop-blur-md border-b border-stone-200/50">
      
      <div className="flex justify-between items-center px-6 md:px-12 py-5">
        
        {/* in cái chữ NMen ra logo */}
        <Link
          href="/"
          className="text-2xl md:text-3xl font-black tracking-tighter text-black uppercase font-headline select-none shrink-0"
        >
          NMen
        </Link>

        {/* nav pc */}
        <div className="hidden md:flex items-center space-x-10 lg:space-x-12">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setActiveLink(link.label)}
              className={`font-headline font-bold tracking-tighter uppercase text-sm transition-all duration-200 whitespace-nowrap ${
                activeLink === link.label
                  ? "text-black border-b-2 border-black pb-[2px]"
                  : "text-stone-500 hover:text-black"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* mấy cái nút bấm bên phải */}
        <div className="flex items-center gap-3 md:gap-5">
          
          {/* tìm kiếm */}
          <div className="flex items-center gap-2">
            {/* check nếu mở search thì render ô input ra */}
            {searchOpen === true && (
              <div className="hidden md:block w-[200px]">
                <input
                  type="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full bg-transparent text-sm border-0 border-b border-black/40 outline-none pb-1"
                />
              </div>
            )}
            {/* nút bấm đổi state để bật tắt text field */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-black hover:opacity-60 transition-opacity"
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
          </div>

          {/* Icon tài khoản của PC */}
          <div 
            className="relative hidden md:block"
            onMouseEnter={() => setUserMenuOpen(true)}
            onMouseLeave={() => setUserMenuOpen(false)}
          >
            <button className="text-black hover:opacity-60 transition-opacity flex items-center">
              <User size={20} />
            </button>

            {/* render dropdown */}
            {userMenuOpen === true && (
              <div className="absolute right-0 top-full z-50 pt-3 min-w-[220px]">
                <div className="bg-white shadow-lg border border-stone-100 py-2">
                  {/* if vòng lặp ktra tài khoản */}
                  {isLoggedIn ? (
                    userMenuItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setUserMenuOpen(false)}
                        className={`flex items-center gap-3 px-5 py-3 font-label text-xs uppercase tracking-widest ${
                          item.danger ? "text-red-500 hover:bg-red-50" : "hover:bg-stone-50"
                        }`}
                      >
                        <item.Icon size={14} />
                        {item.label}
                      </Link>
                    ))
                  ) : (
                    // else chưa đăng nhập
                    <div className="px-5 py-4 flex flex-col gap-2">
                      <Link href="/login" className="text-xs uppercase hover:underline">Đăng nhập</Link>
                      <Link href="/register" className="text-xs uppercase hover:underline">Tạo tài khoản</Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User mobile icon */}
          <button
            className="text-black md:hidden"
            onClick={() => {
              setUserDrawerOpen(!userDrawerOpen);
              setMobileNavOpen(false); // tắt nav
            }}
          >
            {userDrawerOpen ? <X size={20} /> : <User size={20} />}
          </button>

          {/* giỏ hàng */}
          <Link href="/cart" className="text-black hover:opacity-60">
            <ShoppingBag size={20} />
          </Link>

          {/* ba gạch (hamburger)  */}
          <button
            className="text-black md:hidden"
            onClick={() => {
              setMobileNavOpen(!mobileNavOpen);
              setUserDrawerOpen(false); // tắt user menu
            }}
          >
            {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* thanh search ở dt */}
      {searchOpen === true && (
        <div className="md:hidden bg-white p-3 border-b flex items-center gap-2">
          <Search size={16} className="text-stone-400" />
          <input
            type="search"
            placeholder="Tìm theo tên áo quần..."
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
      )}

      {/* dropdown list menu diện thoại */}
      {mobileNavOpen === true && (
        <div className="md:hidden bg-white border-b border-stone-100">
          <div className="flex flex-col px-6 py-4">
            <p className="text-[10px] uppercase text-stone-400 mb-4">Danh mục</p>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => {
                  setActiveLink(link.label);
                  closeAll();
                }}
                className="py-4 border-b border-stone-100 flex justify-between uppercase text-sm font-bold"
              >
                {link.label}
                <ChevronRight size={14} className="text-stone-300" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* dropdown acc đt */}
      {userDrawerOpen === true && (
        <div className="md:hidden bg-white border-b border-stone-100">
          <div className="flex flex-col px-6 py-4">
            <p className="text-[10px] uppercase text-stone-400 mb-4">Tài Khoản Của Tôi</p>
            {isLoggedIn ? (
              userMenuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeAll}
                  className={`py-4 border-b border-stone-100 flex items-center gap-3 uppercase text-xs ${item.danger ? "text-red-500" : ""}`}
                >
                  <item.Icon size={14} />
                  {item.label}
                </Link>
              ))
            ) : (
              <div className="flex flex-col gap-4">
                <Link href="/login" onClick={closeAll} className="py-2 underline uppercase text-xs font-bold">Đăng nhập</Link>
                <Link href="/register" onClick={closeAll} className="py-2 underline uppercase text-xs">Tạo tài khoản</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
