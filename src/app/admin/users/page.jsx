"use client";

import { useState } from "react";

import { ADMIN_USERS } from "@/constants/admin-data";

// Badge hạng thành viên — giữ màu giống client
function TierBadge({ tier }) {
  const map = {
    "Hạng Đen":  "bg-stone-900 text-white",
    "Hạng Vàng": "bg-yellow-400 text-black",
    "Hạng Bạc":  "bg-stone-300 text-black",
    "Hạng Đồng": "bg-orange-300 text-black",
  };
  return (
    <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest ${map[tier] || "bg-stone-100 text-stone-600"}`}>
      {tier}
    </span>
  );
}

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState("Tất cả");

  const TIERS = ["Tất cả", "Hạng Đen", "Hạng Vàng", "Hạng Bạc", "Hạng Đồng"];

  // Lọc theo tên/email và hạng
  const filtered = ADMIN_USERS.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchTier = filterTier === "Tất cả" || u.tier === filterTier;
    return matchSearch && matchTier;
  });

  // Tính tổng chi tiêu hệ thống
  const totalRevenue = ADMIN_USERS.reduce((s, u) => s + u.totalSpent, 0);

  return (
    <div>
      {/* ── Tiêu đề ── */}
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-black tracking-tight uppercase text-black">
          Khách hàng
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          {ADMIN_USERS.length} khách hàng đã đăng ký —{" "}
          Tổng doanh thu:{" "}
          <span className="font-label font-bold text-black">
            {totalRevenue.toLocaleString("vi-VN")} đ
          </span>
        </p>
      </div>

      {/* ── Tìm kiếm + Lọc hạng ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Tìm theo tên, email hoặc SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm border border-stone-300 focus:border-black bg-white px-4 py-3 outline-none text-sm text-black transition-colors"
        />
        {/* Tabs lọc hạng */}
        <div className="flex gap-2 flex-wrap">
          {TIERS.map((tier) => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${
                filterTier === tier
                  ? "bg-black text-white border-black"
                  : "border-stone-300 text-stone-500 hover:border-black hover:text-black"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bảng khách hàng ── */}
      <div className="bg-white border border-stone-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Họ tên</th>
              <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Liên hệ</th>
              <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Địa chỉ</th>
              <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Hạng thành viên</th>
              <th className="text-center px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Điểm thưởng</th>
              <th className="text-center px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Đơn hàng</th>
              <th className="text-right px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Tổng chi tiêu</th>
              <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Tham gia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-stone-50 transition-colors">

                {/* Họ tên */}
                <td className="px-6 py-4">
                  <p className="font-label font-bold text-black">{user.fullName}</p>
                </td>

                {/* Liên hệ: email + SĐT */}
                <td className="px-6 py-4">
                  <p className="text-stone-700 text-xs">{user.email}</p>
                  <p className="text-stone-400 text-xs mt-0.5">{user.phone}</p>
                </td>

                {/* Địa chỉ: thành phố */}
                <td className="px-6 py-4 text-stone-600 text-xs">
                  {user.city}
                </td>

                {/* Hạng thành viên */}
                <td className="px-6 py-4">
                  <TierBadge tier={user.tier} />
                </td>

                {/* Điểm thưởng */}
                <td className="px-6 py-4 text-center">
                  <span className="font-label font-bold text-black">
                    {user.points.toLocaleString()}
                  </span>
                  <span className="text-stone-400 text-xs ml-1">điểm</span>
                </td>

                {/* Số đơn hàng */}
                <td className="px-6 py-4 text-center text-stone-600">
                  {user.orderCount} đơn
                </td>

                {/* Tổng chi tiêu */}
                <td className="px-6 py-4 text-right font-label font-bold text-black">
                  {user.totalSpent.toLocaleString("vi-VN")} đ
                </td>

                {/* Ngày tham gia */}
                <td className="px-6 py-4 text-stone-500 text-xs whitespace-nowrap">
                  {user.joined}
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-stone-400 text-sm">
                  Không tìm thấy khách hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
