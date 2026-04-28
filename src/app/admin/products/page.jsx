"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, ExternalLink } from "lucide-react";
import { apiGet, apiPost, apiDelete, normalizeProduct } from "@/lib/api";

const toSlug = (str) =>
  str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .trim().replace(/\s+/g, "-");

const EMPTY_FORM = { name: "", slug: "", sku: "", price: "", sale_price: "", category_id: "", description: "", images: [], is_published: true };

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([apiGet("/api/products"), apiGet("/api/categories")])
      .then(([p, c]) => {
        setProducts(Array.isArray(p) ? p.map(normalizeProduct) : []);
        setCategories(Array.isArray(c) ? c : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "name") {
      setForm((f) => ({ ...f, name: value, slug: toSlug(value) }));
    } else {
      setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fd = new FormData();
      fd.append("file", file);
      const token = localStorage.getItem("nmen_token");
      const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${BASE}/api/upload/image?folder=products`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (data.url) {
        setForm((f) => ({ ...f, images: [...(f.images || []), data.url] }));
      } else {
        alert(data.message || "Upload thất bại");
      }
    } catch {
      alert("Upload thất bại");
    }
  };

  const removeImage = (idx) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Tên sản phẩm không được để trống");
    if (!form.price || Number(form.price) < 0) return setError("Giá sản phẩm không hợp lệ");
    if (!form.category_id) return setError("Vui lòng chọn danh mục");
    if (form.sale_price && Number(form.sale_price) < 0) return setError("Giá khuyến mãi không hợp lệ");
    if (form.sale_price && Number(form.sale_price) >= Number(form.price)) return setError("Giá khuyến mãi phải nhỏ hơn giá gốc");
    if (!form.images || form.images.length === 0) return setError("Vui lòng thêm ít nhất 1 hình ảnh");

    setSaving(true);
    const body = { 
      ...form, 
      price: Number(form.price), 
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      is_published: form.is_published ? 1 : 0 
    };
    const data = await apiPost("/api/products", body);
    setSaving(false);
    if (data.id) {
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } else {
      setError(data.message || "Lỗi khi tạo sản phẩm");
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Xóa sản phẩm "${product.name}"?`)) return;
    await apiDelete(`/api/products/${product.id}`);
    load();
  };

  const filtered = products.filter((p) =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-black tracking-tight uppercase text-black">Sản phẩm</h1>
          <p className="text-stone-500 text-sm mt-1">{products.length} sản phẩm</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all"
        >
          <Plus size={14} /> Thêm sản phẩm
        </button>
      </div>

      {/* Form thêm */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border border-stone-100 shadow-sm p-6 mb-6">
          <h2 className="font-headline font-bold uppercase tracking-tight text-black mb-4 text-sm">Sản phẩm mới</h2>
          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Tên sản phẩm *</label>
              <input name="name" value={form.name} onChange={handleChange} required
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange}
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none font-mono" />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">SKU</label>
              <input name="sku" value={form.sku} onChange={handleChange}
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Giá (VNĐ) *</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} required min="0"
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Giá Sale (VNĐ)</label>
              <input name="sale_price" type="number" value={form.sale_price} onChange={handleChange} min="0"
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Danh mục *</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} required
                className="w-full border border-stone-300 focus:border-black bg-white px-3 py-2 text-sm outline-none">
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Hình ảnh</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(form.images || []).map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 bg-stone-100 border border-stone-200 group">
                    <img src={img.startsWith("/uploads") ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${img}` : img} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100">x</button>
                  </div>
                ))}
                <label className="w-16 h-16 bg-stone-100 hover:bg-stone-200 border border-stone-300 flex flex-col items-center justify-center cursor-pointer transition-colors text-stone-500">
                  <Upload size={16} className="mb-1" />
                  <span className="text-[8px] uppercase tracking-widest">Thêm</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Mô tả</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none resize-none" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="is_published" id="is_published" checked={form.is_published} onChange={handleChange}
                className="w-4 h-4 accent-black" />
              <label htmlFor="is_published" className="text-sm text-stone-600 cursor-pointer">Hiển thị ngay</label>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="bg-black text-white px-8 py-2 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-50">
              {saving ? "Đang lưu..." : "Tạo sản phẩm"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setError(""); }}
              className="border border-stone-300 px-8 py-2 text-xs font-bold uppercase tracking-widest hover:border-black transition-all">
              Huỷ
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="mb-4">
        <input type="text" placeholder="Tìm sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-stone-300 focus:border-black bg-white px-4 py-3 outline-none text-sm transition-colors" />
      </div>

      {/* Bảng */}
      <div className="bg-white border border-stone-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              {["Sản phẩm","Danh mục","Giá","Hiển thị",""].map((h) => (
                <th key={h} className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-stone-400">Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-stone-400">Không có sản phẩm.</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 relative bg-stone-100 shrink-0 border border-stone-200">
                    <img src={p.primary_image || "/placeholder.svg"} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-black">{p.name}</p>
                    <p className="text-stone-400 font-mono text-xs">{p.sku || p.slug}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-stone-500">{p.category_name}</td>
                <td className="px-6 py-4 font-bold text-black">
                  {p.sale_price ? (
                    <div>
                      <span className="text-red-600">{Number(p.sale_price).toLocaleString("vi-VN")} đ</span>
                      <br/>
                      <span className="text-stone-400 line-through text-xs font-normal">{Number(p.price).toLocaleString("vi-VN")} đ</span>
                    </div>
                  ) : (
                    <span>{Number(p.price).toLocaleString("vi-VN")} đ</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {p.is_published ? (
                    <span className="inline-flex items-center gap-1 text-green-600 text-xs"><Eye size={12} /> Có</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-stone-400 text-xs"><EyeOff size={12} /> Ẩn</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                  <Link href={`/product/${p.slug}`} target="_blank" title="Xem trang khách hàng" className="text-stone-400 hover:text-blue-500 transition-colors">
                    <ExternalLink size={15} />
                  </Link>
                  <Link href={`/admin/products/${p.id}`} className="text-stone-400 hover:text-black transition-colors">
                    <Pencil size={15} />
                  </Link>
                  <button onClick={() => handleDelete(p)} className="text-stone-400 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
