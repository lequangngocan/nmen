"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, X } from "lucide-react";
import { apiGet, apiPut } from "@/lib/api";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    site_name: "",
    logo_url: "",
    favicon_url: "",
    description: "",
    facebook_url: "",
    instagram_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const logoRef = useRef(null);
  const faviconRef = useRef(null);

  useEffect(() => {
    apiGet("/api/settings")
      .then((data) => {
        if (data) {
          setForm((f) => ({ ...f, ...data }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      if (data.url) {
        setForm((f) => ({ ...f, [field]: data.url }));
      } else {
        alert(data.message || "Upload thất bại");
      }
    } catch {
      alert("Upload thất bại");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setToast("");
    try {
      const res = await apiPut("/api/settings", form);
      if (res.message === "Cập nhật cấu hình thành công") {
        setToast("✅ Đã lưu cấu hình");
        setTimeout(() => setToast(""), 3000);
      } else {
        alert(res.message || "Lỗi khi lưu");
      }
    } catch (err) {
      alert(err.message || "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-stone-400 py-10 text-center text-sm">Đang tải...</div>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-black tracking-tight uppercase text-black">Cấu hình chung</h1>
          <p className="text-stone-500 text-sm mt-1">Quản lý thông tin hiển thị của website</p>
        </div>
        <div className="flex items-center gap-3">
          {toast && <span className="text-xs text-green-600 font-bold uppercase tracking-widest">{toast}</span>}
          <button onClick={handleSubmit} disabled={saving}
            className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-50">
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-stone-100 shadow-sm p-6 space-y-5">
            <h2 className="font-headline font-bold uppercase tracking-tight text-black text-sm mb-4">Thông tin cơ bản</h2>
            
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Tên website</label>
              <input name="site_name" value={form.site_name} onChange={handleChange}
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none" />
            </div>

            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Mô tả SEO / Footer</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none resize-none" />
            </div>
          </div>

          <div className="bg-white border border-stone-100 shadow-sm p-6 space-y-5">
            <h2 className="font-headline font-bold uppercase tracking-tight text-black text-sm mb-4">Mạng xã hội</h2>
            
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Facebook URL</label>
              <input name="facebook_url" value={form.facebook_url} onChange={handleChange}
                placeholder="https://facebook.com/..."
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none" />
            </div>

            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Instagram URL</label>
              <input name="instagram_url" value={form.instagram_url} onChange={handleChange}
                placeholder="https://instagram.com/..."
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Logo */}
          <div className="bg-white border border-stone-100 shadow-sm p-6">
            <h2 className="font-headline font-bold uppercase tracking-tight text-black text-sm mb-4">Logo website</h2>
            {form.logo_url ? (
              <div className="relative mb-3 bg-stone-50 p-4 border border-stone-100 flex justify-center">
                <img src={form.logo_url.startsWith("/uploads") ? `${BASE}${form.logo_url}` : form.logo_url}
                  alt="Logo" className="h-12 object-contain" />
                <button type="button" onClick={() => setForm(f => ({ ...f, logo_url: "" }))}
                  className="absolute top-2 right-2 bg-white text-stone-500 hover:text-red-500 border border-stone-200 p-1">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div onClick={() => logoRef.current?.click()}
                className="border-2 border-dashed border-stone-200 hover:border-stone-400 p-8 flex flex-col items-center justify-center gap-2 cursor-pointer mb-3 transition-colors">
                <Upload size={20} className="text-stone-300" />
                <span className="text-xs text-stone-400 uppercase tracking-widest">Tải logo lên</span>
              </div>
            )}
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "logo_url")} />
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Hoặc URL</label>
              <input name="logo_url" value={form.logo_url} onChange={handleChange} placeholder="https://..."
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-xs outline-none" />
            </div>
          </div>

          {/* Favicon */}
          <div className="bg-white border border-stone-100 shadow-sm p-6">
            <h2 className="font-headline font-bold uppercase tracking-tight text-black text-sm mb-4">Favicon</h2>
            <p className="text-[10px] text-stone-400 mb-3 leading-relaxed">Ảnh nhỏ xuất hiện trên tab trình duyệt (tỷ lệ 1:1).</p>
            {form.favicon_url ? (
              <div className="relative mb-3 bg-stone-50 p-4 border border-stone-100 flex justify-center">
                <img src={form.favicon_url.startsWith("/uploads") ? `${BASE}${form.favicon_url}` : form.favicon_url}
                  alt="Favicon" className="w-10 h-10 object-contain" />
                <button type="button" onClick={() => setForm(f => ({ ...f, favicon_url: "" }))}
                  className="absolute top-2 right-2 bg-white text-stone-500 hover:text-red-500 border border-stone-200 p-1">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div onClick={() => faviconRef.current?.click()}
                className="border-2 border-dashed border-stone-200 hover:border-stone-400 p-6 flex flex-col items-center justify-center gap-2 cursor-pointer mb-3 transition-colors">
                <Upload size={20} className="text-stone-300" />
                <span className="text-xs text-stone-400 uppercase tracking-widest">Tải Favicon</span>
              </div>
            )}
            <input ref={faviconRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "favicon_url")} />
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Hoặc URL</label>
              <input name="favicon_url" value={form.favicon_url} onChange={handleChange} placeholder="https://..."
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-xs outline-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
