"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";

const toSlug = (str) =>
  str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .trim().replace(/\s+/g, "-");

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function NewsForm({ initialData = {}, onSubmit, submitLabel = "Lưu" }) {
  const router = useRouter();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title:             initialData.title             ?? "",
    slug:              initialData.slug              ?? "",
    author:            initialData.author            ?? "",
    image:             initialData.image             ?? "",
    status:            initialData.status            ?? "draft",
    short_description: initialData.short_description ?? "",
    description:       initialData.description       ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "title") {
      setForm((f) => ({ ...f, title: value, slug: toSlug(value) }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Upload ảnh thumbnail
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const token = localStorage.getItem("nmen_token");
      const res = await fetch(`${BASE}/api/upload/image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (data.url) setForm((f) => ({ ...f, image: data.url }));
      else setError(data.message || "Upload thất bại");
    } catch {
      setError("Upload thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message || "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <button type="button" onClick={() => router.back()}
          className="flex items-center gap-2 text-xs text-stone-400 hover:text-black uppercase tracking-widest transition-colors">
          <ArrowLeft size={14} /> Quay lại
        </button>
        <div className="flex items-center gap-3">
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" name="status" value="draft"
            onClick={() => setForm((f) => ({ ...f, status: "draft" }))}
            disabled={saving}
            className="border border-stone-300 px-5 py-2 text-xs font-bold uppercase tracking-widest hover:border-black transition-all disabled:opacity-50">
            Lưu nháp
          </button>
          <button type="submit"
            onClick={() => setForm((f) => ({ ...f, status: "published" }))}
            disabled={saving}
            className="bg-black text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-50">
            {saving ? "Đang lưu..." : submitLabel}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-stone-100 shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Tiêu đề *</label>
              <input name="title" value={form.title} onChange={handleChange} required
                placeholder="Nhập tiêu đề bài viết..."
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none" />
            </div>

            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange}
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none font-mono text-stone-500" />
            </div>

            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Tóm tắt</label>
              <textarea name="short_description" value={form.short_description} onChange={handleChange}
                rows={3} placeholder="Mô tả ngắn hiển thị ở trang danh sách..."
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none resize-none" />
            </div>

            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Nội dung</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={18} placeholder="Nhập nội dung bài viết..."
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none resize-y font-mono leading-relaxed" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Trạng thái */}
          <div className="bg-white border border-stone-100 shadow-sm p-5">
            <h3 className="font-headline font-bold uppercase tracking-tight text-black text-xs mb-4">Xuất bản</h3>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Trạng thái</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full border border-stone-300 focus:border-black bg-white px-3 py-2 text-sm outline-none">
                <option value="draft">Nháp</option>
                <option value="published">Xuất bản</option>
              </select>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="bg-white border border-stone-100 shadow-sm p-5">
            <h3 className="font-headline font-bold uppercase tracking-tight text-black text-xs mb-4">Ảnh thumbnail</h3>

            {form.image ? (
              <div className="relative mb-3">
                <img src={form.image.startsWith("/uploads") ? `${BASE}${form.image}` : form.image}
                  alt="thumbnail" className="w-full aspect-video object-cover border border-stone-100" />
                <button type="button" onClick={() => setForm((f) => ({ ...f, image: "" }))}
                  className="absolute top-2 right-2 bg-white text-stone-500 hover:text-red-500 border border-stone-200 p-1 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-stone-200 hover:border-stone-400 aspect-video flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors mb-3">
                <Upload size={20} className="text-stone-300" />
                <span className="text-xs text-stone-400 uppercase tracking-widest">
                  {uploading ? "Đang upload..." : "Click để chọn ảnh"}
                </span>
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

            <div className="mt-2">
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Hoặc nhập URL</label>
              <input name="image" value={form.image} onChange={handleChange}
                placeholder="https://..."
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-xs outline-none" />
            </div>
          </div>

          {/* Meta */}
          <div className="bg-white border border-stone-100 shadow-sm p-5 space-y-3">
            <h3 className="font-headline font-bold uppercase tracking-tight text-black text-xs">Thông tin thêm</h3>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Tác giả</label>
              <input name="author" value={form.author} onChange={handleChange}
                placeholder="Tên tác giả..."
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none" />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
