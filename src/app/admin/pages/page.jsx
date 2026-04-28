"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { apiGet, apiDelete } from "@/lib/api";

const STATUS_BADGE = {
  1: "bg-green-100 text-green-700",
  0: "bg-stone-100 text-stone-500",
};
const STATUS_LABEL = { 1: "Đã xuất bản", 0: "Nháp" };

export default function AdminPagesPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    apiGet("/api/pages")
      .then((data) => setPages(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const handleDelete = async (page) => {
    if (!confirm(`Xóa trang "${page.title}"?`)) return;
    await apiDelete(`/api/pages/${page.id}`);
    load();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-black tracking-tight uppercase text-black">Trang tĩnh</h1>
          <p className="text-stone-500 text-sm mt-1">{pages.length} trang</p>
        </div>
        <Link href="/admin/pages/create"
          className="flex items-center gap-2 bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all">
          <Plus size={14} /> Thêm trang
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              {["Tiêu đề", "Trạng thái", "Ngày tạo", ""].map((h) => (
                <th key={h} className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-stone-400">Đang tải...</td></tr>
            ) : pages.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-stone-400">Chưa có trang nào.</td></tr>
            ) : pages.map((p) => (
              <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-black line-clamp-1">{p.title}</p>
                  <p className="text-stone-400 font-mono text-xs">{p.slug}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_BADGE[p.is_published]}`}>
                    {STATUS_LABEL[p.is_published]}
                  </span>
                </td>
                <td className="px-6 py-4 text-stone-400">
                  {new Date(p.created_at).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/pages/${p.id}`} className="text-stone-400 hover:text-black transition-colors">
                      <Pencil size={15} />
                    </Link>
                    <button onClick={() => handleDelete(p)} className="text-stone-400 hover:text-red-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
