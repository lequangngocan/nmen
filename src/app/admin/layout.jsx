"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Menu, X } from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  // Khởi tạo false để server và client giống nhau → tránh hydration error
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("nmen_admin_token");
    let user = null;
    try {
      const userStr = localStorage.getItem("nmen_admin_user");
      if (userStr) user = JSON.parse(userStr);
    } catch (e) {}

    if (token && user?.role === "admin") {
      setIsLoggedIn(true);
    } else if (pathname !== "/admin/login") {
      // Dọn dẹp session admin cũ nếu không hợp lệ
      localStorage.removeItem("nmen_admin_token");
      localStorage.removeItem("nmen_admin_user");
      router.push("/admin/login");
    }
    setMounted(true);
  }, [pathname, router]);

  // Chưa mount → server và client đều trả về null, không có hydration mismatch
  if (!mounted) return null;

  // Trang login: không cần sidebar
  if (pathname === "/admin/login") {
    return (
      <div className="font-body bg-stone-100 min-h-screen">
        {children}
      </div>
    );
  }

  // Chưa đăng nhập → đừng render (đang redirect)
  if (!isLoggedIn) return null;

  return (
    <div className="font-body bg-stone-50 min-h-screen flex flex-col md:flex-row relative">
      {/* Mobile Header */}
      <div className="md:hidden bg-stone-900 text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <h1 className="font-headline text-lg font-black tracking-tight uppercase">NMen <span className="text-stone-400 font-normal">Admin</span></h1>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 hover:bg-stone-800 rounded">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar bên trái */}
      <div className={`
        fixed inset-y-0 left-0 z-50 md:sticky md:top-0 md:h-screen md:z-0
        transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        transition-transform duration-300 ease-in-out
      `}>
        <AdminSidebar onClose={() => setMobileMenuOpen(false)} />
      </div>

      {/* Nội dung trang bên phải */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
