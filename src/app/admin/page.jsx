"use client";

import Link from "next/link";
import { Package, ShoppingBag, Users, TrendingUp, Clock } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { ADMIN_ORDERS, ADMIN_PRODUCTS, ADMIN_USERS } from "@/constants/admin-data";

export default function AdminDashboard() {
  // Tính số đơn đang giao
  const dangGiao = ADMIN_ORDERS.filter((o) => o.status === "Đang giao").length;

  // Tổng doanh thu (tính từ các đơn đã giao)
  const tongDoanhThu = ADMIN_ORDERS.filter((o) => o.status === "Đã giao").reduce(
    (sum, o) => sum + o.total,
    0
  );

  return (
    <div>
      {/* Tiêu đề trang */}
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-black tracking-tight uppercase text-black">
          Dashboard
        </h1>
        <p className="text-stone-500 text-sm mt-1">Xin chào, Admin! Đây là tổng quan hệ thống.</p>
      </div>

      {/* 4 Card thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        <StatCard
          title="Tổng sản phẩm"
          value={ADMIN_PRODUCTS.length}
          sub="Đang bán"
          icon={Package}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Tổng đơn hàng"
          value={ADMIN_ORDERS.length}
          sub="Tất cả thời gian"
          icon={ShoppingBag}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          title="Đang giao"
          value={dangGiao}
          sub="Cần xử lý"
          icon={Clock}
          color="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          title="Người dùng"
          value={ADMIN_USERS.length}
          sub="Đã đăng ký"
          icon={Users}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Bảng đơn hàng gần đây */}
      <div className="bg-white border border-stone-100 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="font-headline text-lg font-bold uppercase tracking-tight text-black">
            Đơn hàng gần đây
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs font-label text-stone-500 uppercase tracking-widest hover:text-black transition-colors underline underline-offset-4"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Mã đơn</th>
                <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Khách hàng</th>
                <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Ngày đặt</th>
                <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Trạng thái</th>
                <th className="text-right px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Tổng tiền</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {ADMIN_ORDERS.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-label font-bold text-black">#{order.id}</td>
                  <td className="px-6 py-4 text-stone-700">{order.customer}</td>
                  <td className="px-6 py-4 text-stone-500">{order.date}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-right font-label font-bold text-black">
                    {order.total.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-[10px] font-label uppercase tracking-widest text-stone-500 hover:text-black transition-colors underline underline-offset-4"
                    >
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Doanh thu tóm tắt */}
      <div className="mt-6 bg-black text-white p-6 flex items-center justify-between">
        <div>
          <p className="font-label text-xs uppercase tracking-widest text-stone-400 mb-1">
            Tổng doanh thu (đơn đã giao)
          </p>
          <p className="font-headline text-3xl font-black">
            {tongDoanhThu.toLocaleString("vi-VN")} đ
          </p>
        </div>
        <TrendingUp size={48} className="text-stone-600" />
      </div>
    </div>
  );
}

// Component badge trạng thái — dùng ở nhiều trang nên để ở đây tạm
export function StatusBadge({ status }) {
  const map = {
    "Đang giao": "bg-black text-white",
    "Đã giao": "bg-stone-200 text-black",
    "Đã hủy": "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${map[status] || "bg-stone-100 text-stone-600"}`}>
      {status}
    </span>
  );
}
