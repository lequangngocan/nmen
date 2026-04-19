"use client";

import { useState } from "react";
import Link from "next/link";
import { ADMIN_ORDERS } from "@/constants/admin-data";

// Các tab lọc trạng thái đơn hàng
const STATUS_TABS = ["Tất cả", "Chờ xác nhận", "Đang giao", "Đã giao", "Đã hủy"];

// Component badge trạng thái
function StatusBadge({ status }) {
  const map = {
    "Chờ xác nhận": "bg-yellow-100 text-yellow-700",
    "Đang giao":       "bg-blue-100 text-blue-700",
    "Đã giao":         "bg-stone-200 text-stone-700",
    "Đã hủy":          "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${map[status] || "bg-stone-100 text-stone-600"}`}>
      {status}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [search, setSearch] = useState("");

  // Lọc theo tab và ô tìm kiếm
  const filteredOrders = ADMIN_ORDERS.filter((order) => {
    const matchTab = activeTab === "Tất cả" || order.status === activeTab;
    const matchSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div>
      {/* Tiêu đề */}
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-black tracking-tight uppercase text-black">
          Đơn hàng
        </h1>
        <p className="text-stone-500 text-sm mt-1">{ADMIN_ORDERS.length} đơn hàng trong hệ thống</p>
      </div>

      {/* Ô tìm kiếm */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm theo mã đơn hoặc tên khách..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-stone-300 focus:border-black bg-white px-4 py-3 outline-none focus:ring-0 text-sm text-black transition-colors"
        />
      </div>

      {/* Tabs lọc trạng thái */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${
              activeTab === tab
                ? "bg-black text-white border-black"
                : "border-stone-300 text-stone-500 hover:border-black hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bảng đơn hàng */}
      <div className="bg-white border border-stone-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Mã đơn</th>
              <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Khách hàng</th>
              <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Ngày đặt</th>
              <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Thanh toán</th>
              <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Trạng thái</th>
              <th className="text-right px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Tổng tiền</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4 font-label font-bold text-black">#{order.id}</td>
                <td className="px-6 py-4">
                  <p className="font-medium text-black">{order.customer}</p>
                  <p className="text-stone-400 text-xs">{order.email}</p>
                </td>
                <td className="px-6 py-4 text-stone-500">{order.date}</td>
                <td className="px-6 py-4 text-stone-600">{order.payment}</td>
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

            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-stone-400 text-sm">
                  Không có đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
