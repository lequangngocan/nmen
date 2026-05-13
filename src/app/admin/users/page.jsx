"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Search, Users, MapPin, ShoppingBag, TrendingUp } from "lucide-react";



// avatar placeholder khi không có ảnh
function Avatar({ url, name, size = 36 }) {
  if (url) {
    return <img src={url} alt={name} width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  const initials = (name || "?").split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div
      className="rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-600 shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    apiGet("/api/users")
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  // lọc theo tìm kiếm và hạng
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q);
    return matchSearch;
  });

  // thống kê nhanh
  const totalSpent = users.reduce((s, u) => s + Number(u.total_spent || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Users size={22} className="text-stone-600" />
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Khách hàng</h1>
          <p className="text-sm text-stone-500 mt-0.5">{users.length} thành viên đã đăng ký</p>
        </div>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Tổng khách</p>
          <p className="text-3xl font-bold text-stone-900">{users.length}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Tổng doanh thu</p>
          <p className="text-xl font-bold text-stone-900">{totalSpent.toLocaleString("vi-VN")} đ</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-4">
          <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Đã có địa chỉ</p>
          <p className="text-3xl font-bold text-stone-900">{users.filter((u) => u.address_count > 0).length}</p>
        </div>
      </div>

      {/* Thanh lọc */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm tên, email, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-stone-300 focus:border-black bg-white outline-none text-sm text-black transition-colors w-64"
          />
        </div>
        {(search) && (
          <button
            onClick={() => { setSearch(""); }}
            className="text-xs text-stone-400 hover:text-black underline underline-offset-4"
          >
            Xóa bộ lọc
          </button>
        )}
        <span className="ml-auto text-sm text-stone-500 self-center">
          {filtered.length} kết quả
        </span>
      </div>

      {/* Bảng */}
      <div className="bg-white border border-stone-200 shadow-sm overflow-x-auto rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              {["Khách hàng", "Liên hệ", "Địa chỉ mặc định", "Đơn hàng", "Tổng chi", "Ngày đăng ký", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-stone-400">Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-stone-400">Không tìm thấy khách hàng nào.</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                {/* Tên + avatar */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar url={u.avatar_url} name={u.full_name} size={36} />
                    <span className="font-medium text-stone-900">{u.full_name}</span>
                  </div>
                </td>

                {/* Email + SĐT */}
                <td className="px-5 py-3.5">
                  <p className="text-stone-600 text-xs">{u.email}</p>
                  {u.phone && <p className="text-stone-400 text-xs mt-0.5">{u.phone}</p>}
                </td>


                {/* Địa chỉ mặc định */}
                <td className="px-5 py-3.5">
                  {u.default_province ? (
                    <div className="flex items-start gap-1 text-xs text-stone-500">
                      <MapPin size={11} className="shrink-0 mt-0.5 text-stone-400" />
                      <span>
                        {u.default_commune && `${u.default_commune}, `}{u.default_province}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-stone-300 italic">Chưa có</span>
                  )}
                  {u.address_count > 1 && (
                    <p className="text-[10px] text-stone-400 mt-0.5 ml-4">+{u.address_count - 1} địa chỉ khác</p>
                  )}
                </td>

                {/* Số đơn */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 text-stone-600">
                    <ShoppingBag size={13} className="text-stone-400" />
                    {u.order_count}
                  </div>
                </td>

                {/* Tổng chi */}
                <td className="px-5 py-3.5 font-bold text-stone-800 whitespace-nowrap">
                  {Number(u.total_spent).toLocaleString("vi-VN")} đ
                </td>

                {/* Ngày đăng ký + Trạng thái */}
                <td className="px-5 py-3.5 text-stone-400 text-xs whitespace-nowrap">
                  {new Date(u.joined_at).toLocaleDateString("vi-VN")}
                  <br />
                  <span className={`inline-block mt-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded ${u.status === 'inactive' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {u.status || 'active'}
                  </span>
                </td>

                {/* Link xem chi tiết */}
                <td className="px-5 py-3.5">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-black underline underline-offset-4 transition-colors whitespace-nowrap"
                  >
                    Xem →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
