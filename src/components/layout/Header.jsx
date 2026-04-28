"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
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
  ChevronDown,
} from "lucide-react";

// Component dropdown cho từng danh mục gốc có children
function NavDropdown({ cat, currentCat }) {
  const hasChildren = cat.children?.length > 0;
  
  const isActive = currentCat === cat.slug || cat.children?.some(c => c.slug === currentCat);

  if (!hasChildren) {
    return (
      <Link
        href={`/${cat.slug}`}
        className={`font-headline font-bold tracking-tighter uppercase text-sm transition-all duration-200 whitespace-nowrap ${
          isActive ? "text-black border-b-2 border-black pb-[2px]" : "text-stone-500 hover:text-black"
        }`}
      >
        {cat.name}
      </Link>
    );
  }

  return (
    <div className="relative group">
      <button
        className={`flex items-center gap-1 font-headline font-bold tracking-tighter uppercase text-sm transition-all duration-200 whitespace-nowrap ${
          isActive ? "text-black border-b-2 border-black pb-[2px]" : "text-stone-500 hover:text-black"
        }`}
      >
        {cat.name}
        <ChevronDown size={12} className="transition-transform group-hover:rotate-180" />
      </button>
      {/* Submenu */}
      <div className="absolute top-full left-0 pt-4 z-50 hidden group-hover:block min-w-[180px]">
        <div className="bg-white shadow-lg border border-stone-100 py-2">
          <Link
            href={`/${cat.slug}`}
            className="block px-5 py-3 text-xs font-label uppercase tracking-widest text-stone-400 hover:bg-stone-50 hover:text-black border-b border-stone-100"
          >
            Tất cả {cat.name}
          </Link>
          {cat.children.map((child) => (
            <Link
              key={child.id}
              href={`/${child.slug}`}
              className={`block px-5 py-3 text-xs font-label uppercase tracking-widest hover:bg-stone-50 hover:text-black ${
                currentCat === child.slug ? "text-black font-bold" : "text-stone-600"
              }`}
            >
              {child.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// link của phần user
const userMenuItems = [
  { label: "Tài khoản", href: "/account", Icon: UserCircle2 },
  { label: "Đơn mua", href: "/account/history", Icon: ShoppingBasket },
  { label: "Yêu thích", href: "/account/wishlist", Icon: Heart }, 
  { label: "Đăng xuất", href: null, Icon: LogOut, danger: true, isLogout: true },
];

export default function Header({ settings = {} }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  // Danh mục động từ API (tree: root + children)
  const [categoryTree, setCategoryTree] = useState([]);
  const [mobileOpenCat, setMobileOpenCat] = useState(null); // id danh mục đang mở submenu mobile

  const { user, logout, mounted } = useAuth();
  const { totalItems, mounted: cartMounted } = useCart();
  const isLoggedIn = mounted && !!user;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCat = searchParams.get("category");

  const handleSearch = (e) => {
    e.preventDefault();
    const q = e.target.search.value.trim();
    if (q) {
      router.push(`/all?search=${encodeURIComponent(q)}`);
      setSearchOpen(false);
    }
  };

  // Fetch danh mục khi mount
  useEffect(() => {
    const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    fetch(`${BASE}/api/categories`)
      .then((r) => r.json())
      .then((data) => setCategoryTree(Array.isArray(data) ? data.filter((c) => c.status === "active") : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  const closeAll = () => {
    setMobileNavOpen(false);
    setUserDrawerOpen(false);
    setUserMenuOpen(false);
    setMobileOpenCat(null);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-stone-50/85 backdrop-blur-md border-b border-stone-200/50">
      
      <div className="flex justify-between items-center px-6 md:px-12 py-5">
        
        {/* in cái chữ NMen ra logo */}
        <Link
          href="/"
          className="text-2xl md:text-3xl font-black tracking-tighter text-black uppercase font-headline select-none shrink-0"
        >
          {settings.logo_url ? (
            <Image
              src={settings.logo_url.startsWith("/uploads") ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${settings.logo_url}` : settings.logo_url}
              alt={settings.site_name || "NMen"}
              height={32}
              width={120}
              className="h-8 w-auto object-contain"
              unoptimized
            />
          ) : (
            settings.site_name || "NMen"
          )}
        </Link>

        {/* nav pc — dynamic */}
        <div className="hidden md:flex items-center space-x-8 lg:space-x-10">
          {/* Trang chủ */}
          <Link
            href="/"
            className={`font-headline font-bold tracking-tighter uppercase text-sm transition-all duration-200 whitespace-nowrap ${
              pathname === "/" ? "text-black border-b-2 border-black pb-[2px]" : "text-stone-500 hover:text-black"
            }`}
          >
            Trang chủ
          </Link>

          {/* Danh mục từ API */}
          {categoryTree.map((cat) => (
            <NavDropdown key={cat.id} cat={cat} currentCat={currentCat} />
          ))}

          {/* Tin tức */}
          <Link
            href="/news"
            className={`font-headline font-bold tracking-tighter uppercase text-sm transition-all duration-200 whitespace-nowrap ${
              pathname.startsWith("/news") ? "text-black border-b-2 border-black pb-[2px]" : "text-stone-500 hover:text-black"
            }`}
          >
            Tin tức
          </Link>
        </div>

        {/* mấy cái nút bấm bên phải */}
        <div className="flex items-center gap-3 md:gap-5">
          
          {/* tìm kiếm */}
          <div className="flex items-center gap-2">
            {/* check nếu mở search thì render ô input ra */}
            {searchOpen === true && (
              <form onSubmit={handleSearch} className="absolute top-full left-0 w-full bg-white px-6 py-4 shadow-lg border-t border-stone-100 md:static md:w-[200px] md:bg-transparent md:p-0 md:shadow-none md:border-0">
                <input
                  type="search"
                  name="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full bg-transparent text-sm border-0 border-b border-black/40 outline-none pb-1"
                  autoFocus
                />
              </form>
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
            <button className="text-black hover:opacity-60 transition-opacity flex items-center gap-2">
              {isLoggedIn ? (
                <span className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center uppercase">
                    {user.full_name?.split(' ').slice(-1)[0]?.[0] || <User size={14} />}
                  </span>
                  <span className="font-label text-xs font-bold uppercase tracking-widest hidden lg:block max-w-[100px] truncate">
                    {user.full_name?.split(' ').slice(-1)[0]}
                  </span>
                </span>
              ) : (
                <User size={20} />
              )}
            </button>

            {/* render dropdown */}
            {userMenuOpen === true && (
              <div className="absolute right-0 top-full z-50 pt-3 min-w-[220px]">
                <div className="bg-white shadow-lg border border-stone-100 py-2">
                  {/* header tên user */}
                  {isLoggedIn && (
                    <div className="px-5 py-3 border-b border-stone-100">
                      <p className="font-bold text-sm text-stone-900 truncate">{user.full_name}</p>
                      <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
                    </div>
                  )}
                  {isLoggedIn ? (
                    userMenuItems.map((item) =>
                      item.isLogout ? (
                        <button
                          key={item.label}
                          onClick={() => { setUserMenuOpen(false); logout(); }}
                          className="w-full flex items-center gap-3 px-5 py-3 font-label text-xs uppercase tracking-widest text-red-500 hover:bg-red-50"
                        >
                          <item.Icon size={14} />
                          {item.label}
                        </button>
                      ) : (
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
                      )
                    )
                  ) : (
                    // else chưa đăng nhập
                    <div className="px-5 py-4 flex flex-col gap-3">
                      <Link href="/login" className="block w-full bg-black text-white text-center text-xs uppercase tracking-widest py-3 font-bold hover:bg-stone-800 transition-colors">
                        Đăng nhập
                      </Link>
                      <Link href="/register" className="text-xs uppercase tracking-widest text-stone-500 hover:text-black text-center underline underline-offset-4">
                        Tạo tài khoản
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User mobile icon */}
          <button
            className="text-black md:hidden flex items-center"
            onClick={() => {
              setUserDrawerOpen(!userDrawerOpen);
              setMobileNavOpen(false);
            }}
          >
            {userDrawerOpen ? <X size={20} /> : (
              isLoggedIn ? (
                <span className="w-7 h-7 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center uppercase">
                  {user.full_name?.split(' ').slice(-1)[0]?.[0] || '?'}
                </span>
              ) : <User size={20} />
            )}
          </button>

          {/* giỏ hàng */}
          <Link href="/cart" className="relative text-black hover:opacity-60 transition-opacity">
            <ShoppingBag size={20} />
            {cartMounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-black text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
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

      {/* dropdown list menu di động — dynamic */}
      {mobileNavOpen === true && (
        <div className="md:hidden bg-white border-b border-stone-100">
          <div className="flex flex-col px-6 py-4">
            <p className="text-[10px] uppercase text-stone-400 mb-4">Menu</p>

            {/* Trang chủ */}
            <Link href="/" onClick={closeAll}
              className="py-4 border-b border-stone-100 flex justify-between uppercase text-sm font-bold">
              Trang chủ <ChevronRight size={14} className="text-stone-300" />
            </Link>

            {/* Danh mục động */}
            {categoryTree.map((cat) => (
              <div key={cat.id}>
                <button
                  onClick={() => setMobileOpenCat(mobileOpenCat === cat.id ? null : cat.id)}
                  className="w-full py-4 border-b border-stone-100 flex justify-between uppercase text-sm font-bold"
                >
                  {cat.name}
                  <ChevronDown size={14} className={`text-stone-400 transition-transform ${mobileOpenCat === cat.id ? "rotate-180" : ""}`} />
                </button>
                {mobileOpenCat === cat.id && (
                  <div className="bg-stone-50 pl-4">
                    <Link href={`/${cat.slug}`} onClick={closeAll}
                      className="py-3 border-b border-stone-100 flex items-center gap-2 text-xs uppercase text-stone-500">
                      <ChevronRight size={10} /> Tất cả {cat.name}
                    </Link>
                    {(cat.children || []).map((child) => (
                      <Link key={child.id} href={`/${child.slug}`} onClick={closeAll}
                        className="py-3 border-b border-stone-100 flex items-center gap-2 text-xs uppercase text-stone-600">
                        <ChevronRight size={10} /> {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Tin tức */}
            <Link href="/news" onClick={closeAll}
              className="py-4 border-b border-stone-100 flex justify-between uppercase text-sm font-bold">
              Tin tức <ChevronRight size={14} className="text-stone-300" />
            </Link>
          </div>
        </div>
      )}

      {/* dropdown acc đt */}
      {userDrawerOpen === true && (
        <div className="md:hidden bg-white border-b border-stone-100">
          <div className="flex flex-col px-6 py-4">
            <p className="text-[10px] uppercase text-stone-400 mb-4">Tài Khoản Của Tôi</p>
            {isLoggedIn ? (
              userMenuItems.map((item) =>
                item.isLogout ? (
                  <button
                    key={item.label}
                    onClick={() => { closeAll(); logout(); }}
                    className={`py-4 border-b border-stone-100 flex items-center gap-3 uppercase text-xs text-red-500`}
                  >
                    <item.Icon size={14} />
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeAll}
                    className={`py-4 border-b border-stone-100 flex items-center gap-3 uppercase text-xs ${item.danger ? "text-red-500" : ""}`}
                  >
                    <item.Icon size={14} />
                    {item.label}
                  </Link>
                )
              )
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
