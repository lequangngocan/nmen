"use client";


import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Tag, FileText, Settings, BookOpen, MapPin } from "lucide-react";

// Các mục menu trong sidebar
const menuItems = [
  { href: "/admin",            label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/categories", label: "Danh mục",   icon: Tag },
  { href: "/admin/products",   label: "Sản phẩm",   icon: Package },
  { href: "/admin/orders",     label: "Đơn hàng",   icon: ShoppingBag },
  { href: "/admin/users",      label: "Khách hàng", icon: Users },
  { href: "/admin/news",       label: "Tin tức",    icon: FileText },
  { href: "/admin/pages",      label: "Trang tĩnh", icon: BookOpen },
  { href: "/admin/locations",  label: "Địa lý",     icon: MapPin },
  { href: "/admin/settings",   label: "Cấu hình",   icon: Settings },
];

export default function AdminSidebar({ onClose }) {
  const pathname = usePathname();
  const router   = useRouter();
  const adminUser = (() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('nmen_admin_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  // Đăng xuất admin — chỉ xóa session admin, không đụng session client
  const handleLogout = () => {
    localStorage.removeItem("nmen_admin_token");
    localStorage.removeItem("nmen_admin_user");
    router.push("/admin/login");
  };

  // Avatar chữ cái đầu
  const initials = adminUser?.name
    ? adminUser.name.trim().split(" ").slice(-2).map((w) => w[0].toUpperCase()).join("")
    : "A";

  return (
    <aside className="w-64 bg-stone-900 text-white min-h-screen md:h-screen flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
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
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
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

      {/* User info + Đăng xuất */}
      <div className="p-4 border-t border-stone-700 space-y-3">
        {/* Thông tin admin đang đăng nhập */}
        {adminUser && (
          <div className="flex items-center gap-3 px-2 py-2">
            {/* Avatar chữ cái */}
            <div className="w-9 h-9 rounded-full bg-stone-600 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {adminUser.name || "Admin"}
              </p>
              <p className="text-[10px] text-stone-400 truncate mt-0.5">
                {adminUser.email}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-stone-400 hover:text-red-400 transition-colors w-full rounded hover:bg-stone-800"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
