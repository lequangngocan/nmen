"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Tag } from "lucide-react";

// Các mục menu trong sidebar
const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/categories", label: "Danh mục", icon: Tag },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/admin/users", label: "Khách hàng", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    router.push("/admin/login");
  };

  return (
    <aside className="w-64 bg-stone-900 text-white min-h-screen flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-stone-700">
        <h1 className="font-headline text-xl font-black tracking-tight uppercase">
          NMen{" "}
          <span className="text-stone-400 text-sm font-normal normal-case">
            Admin
          </span>
        </h1>
        <p className="text-stone-500 text-xs mt-1">Quản trị hệ thống</p>
      </div>

      {/* Menu điều hướng */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Kiểm tra menu nào đang active
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded transition-colors ${
                isActive
                  ? "bg-white text-black"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Nút đăng xuất ở dưới cùng */}
      <div className="p-4 border-t border-stone-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-stone-400 hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
