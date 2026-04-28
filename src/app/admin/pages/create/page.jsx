"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

const toSlug = (str) =>
  str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .trim().replace(/\s+/g, "-");

export default function AdminPageCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", slug: "", content: "", is_published: 1 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "title") {
      setForm((f) => ({ ...f, title: value, slug: toSlug(value) }));
    } else {
      setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const data = await apiPost("/api/pages", {
      ...form,
      is_published: form.is_published ? 1 : 0,
    });
    setSaving(false);
    if (data.id) {
      router.push("/admin/pages");
      router.refresh();
    } else {
      setError(data.message || "Lỗi khi tạo trang");
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-xs text-stone-400 hover:text-black uppercase tracking-widest transition-colors">
          ← Quay lại
        </button>
        <h1 className="font-headline text-3xl font-black tracking-tight uppercase text-black">Thêm trang tĩnh</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-stone-100 shadow-sm p-6 space-y-4">
        {error && <p className="text-red-500 text-xs">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Tiêu đề *</label>
            <input name="title" value={form.title} onChange={handleChange} required
              className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange}
              className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none font-mono" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Nội dung</label>
            <textarea name="content" value={form.content} onChange={handleChange} rows={12}
              className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none resize-none" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="is_published" id="pub" checked={!!form.is_published} onChange={handleChange}
              className="w-4 h-4 accent-black" />
            <label htmlFor="pub" className="text-sm text-stone-600 cursor-pointer">Hiển thị ngay</label>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="bg-black text-white px-8 py-2 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-50">
            {saving ? "Đang lưu..." : "Tạo trang"}
          </button>
        </div>
      </form>
    </div>
  );
}
