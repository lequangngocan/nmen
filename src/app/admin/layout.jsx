"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  // Khởi tạo false để server và client giống nhau → tránh hydration error
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Chỉ chạy ở client, sau khi component đã mount
    const adminLoggedIn = localStorage.getItem("adminLoggedIn");
    if (adminLoggedIn) {
      setIsLoggedIn(true);
    } else if (pathname !== "/admin/login") {
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
    <div className="font-body bg-stone-50 min-h-screen flex">
      {/* Sidebar bên trái */}
      <AdminSidebar />

      {/* Nội dung trang bên phải */}
      <main className="flex-1 p-6 lg:p-8 min-w-0">
        {children}
      </main>
    </div>
  );
}
