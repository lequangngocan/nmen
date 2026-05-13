"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { apiGet, apiDelete } from "@/lib/api";

export default function PromoListPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPromos = async () => {
    try {
      const data = await apiGet("/api/promo");
      setPromos(data);
    } catch (e) {
      alert("Lỗi khi tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleDelete = async (id, code) => {
    if (!confirm(`Bạn có chắc muốn xóa mã giảm giá "${code}"?`)) return;
    try {
      await apiDelete(`/api/promo/${id}`);
      fetchPromos();
    } catch (e) {
      alert("Lỗi khi xóa mã giảm giá");
    }
  };

  const filteredPromos = promos.filter((p) =>
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-headline">Mã giảm giá</h1>
          <p className="text-stone-500 text-sm">Quản lý các mã khuyến mãi</p>
        </div>
        <Link
          href="/admin/promo/new"
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded font-medium hover:bg-stone-800 transition"
        >
          <Plus size={18} />
          Tạo mã mới
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-200">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo mã (VD: WELCOME)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-center py-10 text-stone-500">Đang tải...</p>
        ) : filteredPromos.length === 0 ? (
          <p className="text-center py-10 text-stone-500">Không tìm thấy mã giảm giá nào</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-100 text-stone-600 font-medium border-b">
                <tr>
                  <th className="py-3 px-4">Mã</th>
                  <th className="py-3 px-4">Mức giảm</th>
                  <th className="py-3 px-4">Đơn tối thiểu</th>
                  <th className="py-3 px-4">Đã dùng / Tổng</th>
                  <th className="py-3 px-4">Ngày hết hạn</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPromos.map((promo) => (
                  <tr key={promo.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4 font-semibold">{promo.code}</td>
                    <td className="py-3 px-4 text-emerald-600 font-medium">
                      {promo.discount_type === "percent"
                        ? `${promo.discount_value}%`
                        : `${Number(promo.discount_value).toLocaleString("vi-VN")} đ`}
                    </td>
                    <td className="py-3 px-4">
                      {Number(promo.min_order).toLocaleString("vi-VN")} đ
                    </td>
                    <td className="py-3 px-4">
                      {promo.used_count} / {promo.max_uses ? promo.max_uses : "∞"}
                    </td>
                    <td className="py-3 px-4">
                      {promo.expires_at
                        ? new Date(promo.expires_at).toLocaleDateString("vi-VN")
                        : "Không thời hạn"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          promo.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {promo.is_active ? "Đang chạy" : "Tạm dừng"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/promo/${promo.id}`}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(promo.id, promo.code)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
