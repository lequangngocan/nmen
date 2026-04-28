"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { apiGet, apiDelete } from "@/lib/api";

const STATUS_BADGE = {
  published: "bg-green-100 text-green-700",
  draft:     "bg-stone-100 text-stone-500",
};
const STATUS_LABEL = { published: "Đã xuất bản", draft: "Nháp" };

export default function AdminNewsPage() {
  const [news, setNews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (filterStatus) params.set("status", filterStatus);
    if (search)       params.set("search", search);
    apiGet(`/api/news/admin/all?${params}`)
      .then((data) => { setNews(data.data || []); setTotal(data.total || 0); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus]); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleDelete = async (item) => {
    if (!confirm(`Xóa bài viết "${item.title}"?`)) return;
    const res = await apiDelete(`/api/news/${item.id}`);
    if (res.message && res.message !== "Đã xóa bài viết") {
      alert(res.message);
    } else {
      load();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-black tracking-tight uppercase text-black">Tin tức</h1>
          <p className="text-stone-500 text-sm mt-1">{total} bài viết</p>
        </div>
        <Link href="/admin/news/create"
          className="flex items-center gap-2 bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all">
          <Plus size={14} /> Viết bài mới
        </Link>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {[["", "Tất cả"], ["published", "Đã xuất bản"], ["draft", "Nháp"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilterStatus(val)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${
              filterStatus === val ? "bg-black text-white border-black" : "border-stone-300 text-stone-500 hover:border-black hover:text-black"
            }`}>
            {label}
          </button>
        ))}

        <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
          <input
            type="text"
            placeholder="Tìm tiêu đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-stone-300 focus:border-black px-3 py-2 text-xs outline-none w-48 transition-colors"
          />
          <button type="submit"
            className="border border-stone-300 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:border-black transition-all">
            Tìm
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              {["Tiêu đề", "Tác giả", "Trạng thái", "Ngày tạo", ""].map((h) => (
                <th key={h} className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-stone-400">Đang tải...</td></tr>
            ) : news.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-stone-400">Chưa có bài viết nào.</td></tr>
            ) : news.map((item) => (
              <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-black line-clamp-1">{item.title}</p>
                  <p className="text-stone-400 font-mono text-xs">{item.slug}</p>
                </td>
                <td className="px-6 py-4 text-stone-500">{item.author || "—"}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_BADGE[item.status]}`}>
                    {STATUS_LABEL[item.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-stone-400">
                  {new Date(item.created_at).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/news/${item.id}`} className="text-stone-400 hover:text-black transition-colors">
                      <Pencil size={15} />
                    </Link>
                    <button onClick={() => handleDelete(item)} className="text-stone-400 hover:text-red-500 transition-colors">
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
