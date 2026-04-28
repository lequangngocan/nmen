"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2, Plus, Upload } from "lucide-react";
import { apiGet, apiPut, apiPost, apiDelete } from "@/lib/api";

const toSlug = (str) =>
  str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .trim().replace(/\s+/g, "-");

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const EMPTY_VARIANT = { sku: "", color_name: "", color_hex: "#000000", size: "M", stock: 0 };

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [variantForm, setVariantForm] = useState(EMPTY_VARIANT);
  const [addingVariant, setAddingVariant] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = () => {
    Promise.all([apiGet(`/api/products/${id}`), apiGet("/api/categories")])
      .then(([p, c]) => {
        if (p.id) {
          setProduct(p);
          setForm({
            name: p.name, slug: p.slug, sku: p.sku || "", price: p.price, sale_price: p.sale_price || "",
            category_id: p.category_id, description: p.description || "",
            images: p.images ? p.images.map(img => img.image_url) : [],
            is_published: p.is_published,
          });
        }
        setCategories(Array.isArray(c) ? c : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Tên sản phẩm không được để trống");
    if (!form.price || Number(form.price) < 0) return alert("Giá sản phẩm không hợp lệ");
    if (!form.category_id) return alert("Vui lòng chọn danh mục");
    if (form.sale_price && Number(form.sale_price) < 0) return alert("Giá khuyến mãi không hợp lệ");
    if (form.sale_price && Number(form.sale_price) >= Number(form.price)) return alert("Giá khuyến mãi phải nhỏ hơn giá gốc");
    if (!form.images || form.images.length === 0) return alert("Vui lòng thêm ít nhất 1 hình ảnh");

    setSaving(true);
    const body = { 
      ...form, 
      price: Number(form.price), 
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      is_published: form.is_published ? 1 : 0 
    };
    await apiPut(`/api/products/${id}`, body);
    setSaving(false);
    showToast("✅ Đã lưu thay đổi");
  };

  const handleAddVariant = async (e) => {
    e.preventDefault();
    if (!variantForm.size) return alert("Vui lòng chọn size");
    if (!variantForm.sku || !variantForm.sku.trim()) return alert("Vui lòng nhập SKU cho variant");
    
    setAddingVariant(true);
    const res = await apiPost(`/api/products/${id}/variants`, variantForm);
    setAddingVariant(false);
    if (res.id) {
      setVariantForm(EMPTY_VARIANT);
      load();
    }
  };

  const handleDeleteVariant = async (vid) => {
    if (!confirm("Xóa variant này?")) return;
    await apiDelete(`/api/products/${id}/variants/${vid}`);
    load();
  };

  if (loading) return <div className="text-stone-400 py-10 text-center text-sm">Đang tải...</div>;
  if (!product) return <div className="text-red-500 py-10 text-center text-sm">Không tìm thấy sản phẩm.</div>;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-xs text-stone-400 hover:text-black uppercase tracking-widest transition-colors">
          ← Quay lại
        </button>
        <div>
          <h1 className="font-headline text-3xl font-black tracking-tight uppercase text-black">{product.name}</h1>
          <p className="text-stone-500 text-sm mt-1 font-mono">{product.slug}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form edit */}
        <form onSubmit={handleSave} className="lg:col-span-2 bg-white border border-stone-100 shadow-sm p-6 space-y-4">
          <h2 className="font-headline font-bold uppercase tracking-tight text-black text-sm mb-2">Thông tin sản phẩm</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Tên sản phẩm</label>
              <input name="name" value={form.name} onChange={handleChange}
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
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Giá (VNĐ)</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} min="0"
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Giá Sale (VNĐ)</label>
              <input name="sale_price" type="number" value={form.sale_price} onChange={handleChange} min="0"
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Danh mục</label>
              <select name="category_id" value={form.category_id} onChange={handleChange}
                className="w-full border border-stone-300 focus:border-black bg-white px-3 py-2 text-sm outline-none">
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
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none resize-none" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="is_published" id="pub" checked={!!form.is_published} onChange={handleChange}
                className="w-4 h-4 accent-black" />
              <label htmlFor="pub" className="text-sm text-stone-600 cursor-pointer">Hiển thị trên cửa hàng</label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="bg-black text-white px-8 py-2 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-50">
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            {toast && <span className="text-xs text-green-600">{toast}</span>}
          </div>
        </form>

        {/* Sidebar variants */}
        <div className="space-y-6">
          {/* Danh sách variants */}
          <div className="bg-white border border-stone-100 shadow-sm">
            <div className="p-4 border-b border-stone-100">
              <h2 className="font-headline font-bold uppercase tracking-tight text-black text-sm">
                Variants ({product.variants?.length || 0})
              </h2>
            </div>
            <div className="divide-y divide-stone-50">
              {(product.variants || []).length === 0 ? (
                <p className="px-4 py-6 text-stone-400 text-xs text-center">Chưa có variant</p>
              ) : product.variants.map((v) => (
                <div key={v.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {v.color_hex && (
                      <span className="w-4 h-4 rounded-full border border-stone-200 inline-block" style={{ background: v.color_hex }} />
                    )}
                    <span className="text-sm text-black font-medium">{v.size}</span>
                    <span className="text-xs font-mono text-stone-500">{v.sku}</span>
                    {v.color_name && <span className="text-xs text-stone-400">{v.color_name}</span>}
                    <span className="text-xs text-stone-400">SL: {v.stock}</span>
                  </div>
                  <button onClick={() => handleDeleteVariant(v.id)} className="text-stone-300 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form thêm variant */}
          <form onSubmit={handleAddVariant} className="bg-white border border-stone-100 shadow-sm p-4 space-y-3">
            <h2 className="font-headline font-bold uppercase tracking-tight text-black text-sm">Thêm variant</h2>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-stone-400 uppercase tracking-widest mb-1">Size *</label>
                <select value={variantForm.size} onChange={(e) => setVariantForm((f) => ({ ...f, size: e.target.value }))}
                  className="w-full border border-stone-300 focus:border-black bg-white px-2 py-1.5 text-sm outline-none">
                  {SIZES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-stone-400 uppercase tracking-widest mb-1">SKU Variant</label>
                <input value={variantForm.sku}
                  onChange={(e) => setVariantForm((f) => ({ ...f, sku: e.target.value }))}
                  className="w-full border border-stone-300 focus:border-black px-2 py-1.5 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-stone-400 uppercase tracking-widest mb-1">Tồn kho</label>
                <input type="number" min="0" value={variantForm.stock}
                  onChange={(e) => setVariantForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                  className="w-full border border-stone-300 focus:border-black px-2 py-1.5 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-stone-400 uppercase tracking-widest mb-1">Tên màu</label>
                <input value={variantForm.color_name}
                  onChange={(e) => setVariantForm((f) => ({ ...f, color_name: e.target.value }))}
                  className="w-full border border-stone-300 focus:border-black px-2 py-1.5 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-stone-400 uppercase tracking-widest mb-1">Màu</label>
                <input type="color" value={variantForm.color_hex}
                  onChange={(e) => setVariantForm((f) => ({ ...f, color_hex: e.target.value }))}
                  className="w-full h-9 border border-stone-300 px-1 cursor-pointer" />
              </div>
            </div>
            <button type="submit" disabled={addingVariant}
              className="w-full bg-black text-white py-2 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              <Plus size={14} /> {addingVariant ? "Đang thêm..." : "Thêm variant"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
