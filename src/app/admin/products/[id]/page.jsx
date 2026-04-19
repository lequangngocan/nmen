"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { ADMIN_PRODUCTS } from "@/constants/admin-data";

export default function AdminProductDetailPage() {
  const params = useParams();
  const productId = params.id;
  const isNew = productId === "new";
  const existing = ADMIN_PRODUCTS.find((p) => p.id === productId);

  // ─── State thông tin cơ bản ───────────────────────────────────────────────
  const [form, setForm] = useState({
    name: existing?.name || "",
    category: existing?.category || "",
    price: existing?.price || "",
    description: existing?.description || "",
    image1: existing?.image1 || "",
    image2: existing?.image2 || "",
  });

  // ─── State danh sách màu ─────────────────────────────────────────────────
  const [colors, setColors] = useState(
    existing?.colors || [] // [{ hex, name }]
  );
  const [newColor, setNewColor] = useState({ hex: "#000000", name: "" });

  // ─── State danh sách size ─────────────────────────────────────────────────
  const [sizes, setSizes] = useState(existing?.sizes || []);
  const [newSize, setNewSize] = useState("");

  // ─── State biến thể (tồn kho theo màu + size) ────────────────────────────
  // variants = [{ color, size, stock }]
  const [variants, setVariants] = useState(existing?.variants || []);

  // Lấy stock của 1 biến thể cụ thể
  const getStock = (colorHex, size) => {
    const v = variants.find((v) => v.color === colorHex && v.size === size);
    return v?.stock ?? 0;
  };

  // Cập nhật stock của 1 biến thể
  const setStock = (colorHex, size, value) => {
    const stock = parseInt(value) || 0;
    setVariants((prev) => {
      const existing = prev.find((v) => v.color === colorHex && v.size === size);
      if (existing) {
        return prev.map((v) =>
          v.color === colorHex && v.size === size ? { ...v, stock } : v
        );
      }
      return [...prev, { color: colorHex, size, stock }];
    });
  };

  // ─── Thêm màu mới ─────────────────────────────────────────────────────────
  const handleAddColor = () => {
    if (!newColor.name.trim()) return;
    if (colors.find((c) => c.hex === newColor.hex)) {
      alert("Màu này đã tồn tại!");
      return;
    }
    setColors([...colors, { ...newColor }]);
    // Thêm variants mới cho màu này với tất cả size hiện tại
    const newVariants = sizes.map((s) => ({ color: newColor.hex, size: s, stock: 0 }));
    setVariants((prev) => [...prev, ...newVariants]);
    setNewColor({ hex: "#000000", name: "" });
  };

  // ─── Xóa màu ──────────────────────────────────────────────────────────────
  const handleDeleteColor = (hex) => {
    setColors(colors.filter((c) => c.hex !== hex));
    setVariants(variants.filter((v) => v.color !== hex));
  };

  // ─── Thêm size mới ────────────────────────────────────────────────────────
  const handleAddSize = () => {
    if (!newSize.trim()) return;
    if (sizes.includes(newSize.trim())) {
      alert("Size này đã tồn tại!");
      return;
    }
    const s = newSize.trim();
    setSizes([...sizes, s]);
    // Thêm variants mới cho size này với tất cả màu hiện tại
    const newVariants = colors.map((c) => ({ color: c.hex, size: s, stock: 0 }));
    setVariants((prev) => [...prev, ...newVariants]);
    setNewSize("");
  };

  // ─── Xóa size ─────────────────────────────────────────────────────────────
  const handleDeleteSize = (size) => {
    setSizes(sizes.filter((s) => s !== size));
    setVariants(variants.filter((v) => v.size !== size));
  };

  // ─── Lưu sản phẩm ─────────────────────────────────────────────────────────
  const handleSave = (e) => {
    e.preventDefault();
    alert(isNew ? "Đã thêm sản phẩm! (Demo)" : "Đã lưu thay đổi! (Demo)");
  };

  if (!isNew && !existing) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500 text-lg mb-4">Không tìm thấy sản phẩm.</p>
        <Link href="/admin/products" className="text-black underline underline-offset-4 text-sm font-label uppercase tracking-widest">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  return (
    <div>
      {/* Nút quay lại + Tiêu đề */}
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="flex items-center gap-2 text-stone-500 hover:text-black transition-colors text-sm font-label uppercase tracking-widest mb-4"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="font-headline text-3xl font-black tracking-tight uppercase text-black">
            {isNew ? "Thêm sản phẩm mới" : "Sửa sản phẩm"}
          </h1>
          <div className="text-stone-500 text-sm">
            Tổng tồn kho:{" "}
            <span className="font-label font-bold text-black">{totalStock} sản phẩm</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── Cột trái: Thông tin cơ bản + Biến thể ── */}
          <div className="xl:col-span-2 space-y-6">

            {/* Thông tin cơ bản */}
            <div className="bg-white border border-stone-100 shadow-sm p-6 space-y-5">
              <h2 className="font-headline text-base font-bold uppercase tracking-tight text-black border-b border-stone-100 pb-3">
                Thông tin cơ bản
              </h2>

              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Tên sản phẩm *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="VD: Áo Blazer Linen Phom Rộng"
                  className="w-full border border-stone-200 focus:border-black bg-white px-4 py-3 outline-none text-black text-sm transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Danh mục</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-stone-200 focus:border-black bg-white px-4 py-3 outline-none text-black text-sm transition-colors"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    <option>Áo khoác</option>
                    <option>Áo sơ mi</option>
                    <option>Áo len</option>
                    <option>Quần</option>
                    <option>Giày</option>
                    <option>Phụ kiện</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Giá (VNĐ) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    placeholder="VD: 4500000"
                    className="w-full border border-stone-200 focus:border-black bg-white px-4 py-3 outline-none text-black text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Mô tả ngắn về sản phẩm..."
                  className="w-full border border-stone-200 focus:border-black bg-white px-4 py-3 outline-none text-black text-sm transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">URL Ảnh chính</label>
                  <input
                    type="url"
                    value={form.image1}
                    onChange={(e) => setForm({ ...form, image1: e.target.value })}
                    placeholder="https://..."
                    className="w-full border border-stone-200 focus:border-black bg-white px-4 py-3 outline-none text-black text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">URL Ảnh phụ</label>
                  <input
                    type="url"
                    value={form.image2}
                    onChange={(e) => setForm({ ...form, image2: e.target.value })}
                    placeholder="https://..."
                    className="w-full border border-stone-200 focus:border-black bg-white px-4 py-3 outline-none text-black text-sm transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Màu sắc */}
            <div className="bg-white border border-stone-100 shadow-sm p-6">
              <h2 className="font-headline text-base font-bold uppercase tracking-tight text-black border-b border-stone-100 pb-3 mb-4">
                Màu sắc
              </h2>

              {/* Danh sách màu hiện có */}
              <div className="flex flex-wrap gap-3 mb-4">
                {colors.map((c) => (
                  <div
                    key={c.hex}
                    className="flex items-center gap-2 border border-stone-200 px-3 py-2"
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-stone-300 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-sm font-label font-medium text-black">{c.name}</span>
                    <span className="text-xs text-stone-400 font-mono">{c.hex}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteColor(c.hex)}
                      className="text-stone-400 hover:text-red-600 transition-colors ml-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {colors.length === 0 && (
                  <p className="text-stone-400 text-sm">Chưa có màu nào.</p>
                )}
              </div>

              {/* Form thêm màu */}
              <div className="flex gap-3 items-end flex-wrap">
                <div>
                  <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-1">Chọn mã màu</label>
                  <div className="flex items-center gap-2 border border-stone-200 px-3 py-2">
                    <input
                      type="color"
                      value={newColor.hex}
                      onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                      className="w-8 h-8 cursor-pointer border-none bg-transparent p-0"
                    />
                    <span className="text-xs font-mono text-stone-500">{newColor.hex}</span>
                  </div>
                </div>
                <div>
                  <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-1">Tên màu</label>
                  <input
                    type="text"
                    value={newColor.name}
                    onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                    placeholder="VD: Xám Đen"
                    className="border border-stone-200 focus:border-black bg-white px-3 py-2 outline-none text-black text-sm w-36 transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="flex items-center gap-2 bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all"
                >
                  <Plus size={14} />
                  Thêm màu
                </button>
              </div>
            </div>

            {/* Size */}
            <div className="bg-white border border-stone-100 shadow-sm p-6">
              <h2 className="font-headline text-base font-bold uppercase tracking-tight text-black border-b border-stone-100 pb-3 mb-4">
                Size
              </h2>

              {/* Danh sách size hiện có */}
              <div className="flex flex-wrap gap-2 mb-4">
                {sizes.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-2 border border-stone-200 px-3 py-2"
                  >
                    <span className="font-label font-bold text-sm text-black">{s}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSize(s)}
                      className="text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                {sizes.length === 0 && (
                  <p className="text-stone-400 text-sm">Chưa có size nào.</p>
                )}
              </div>

              {/* Form thêm size */}
              <div className="flex gap-3 items-end">
                <div>
                  <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-1">Size mới</label>
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSize())}
                    placeholder="VD: S, M, L, 42..."
                    className="border border-stone-200 focus:border-black bg-white px-3 py-2 outline-none text-black text-sm w-36 transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="flex items-center gap-2 bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all"
                >
                  <Plus size={14} />
                  Thêm size
                </button>
              </div>
            </div>

            {/* Bảng tồn kho biến thể */}
            {colors.length > 0 && sizes.length > 0 && (
              <div className="bg-white border border-stone-100 shadow-sm p-6">
                <h2 className="font-headline text-base font-bold uppercase tracking-tight text-black border-b border-stone-100 pb-3 mb-4">
                  Tồn kho theo biến thể (Màu × Size)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left py-2 pr-4 font-label text-[10px] uppercase tracking-widest text-stone-500 w-32">
                          Màu \ Size
                        </th>
                        {sizes.map((s) => (
                          <th
                            key={s}
                            className="text-center py-2 px-2 font-label text-[10px] uppercase tracking-widest text-stone-500 w-16"
                          >
                            {s}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {colors.map((c) => (
                        <tr key={c.hex}>
                          {/* Tên màu */}
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-4 h-4 rounded-full border border-stone-200 shrink-0"
                                style={{ backgroundColor: c.hex }}
                              />
                              <span className="text-xs font-label font-medium text-black">{c.name}</span>
                            </div>
                          </td>
                          {/* Ô nhập tồn kho cho từng size */}
                          {sizes.map((s) => (
                            <td key={s} className="py-3 px-2 text-center">
                              <input
                                type="number"
                                min={0}
                                value={getStock(c.hex, s)}
                                onChange={(e) => setStock(c.hex, s, e.target.value)}
                                className={`w-14 text-center border py-1 outline-none text-sm font-label font-bold transition-colors ${
                                  getStock(c.hex, s) === 0
                                    ? "border-red-200 bg-red-50 text-red-500"
                                    : "border-stone-200 focus:border-black bg-white text-black"
                                }`}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-stone-400 mt-3">
                  * Ô màu đỏ = hết hàng (tồn kho = 0)
                </p>
              </div>
            )}

            {/* Nút lưu */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex items-center gap-2 bg-black text-white px-8 py-3 font-bold uppercase tracking-widest text-sm hover:bg-stone-800 transition-all active:scale-95"
              >
                <Save size={16} />
                {isNew ? "Thêm sản phẩm" : "Lưu thay đổi"}
              </button>
              <Link
                href="/admin/products"
                className="px-8 py-3 border border-stone-300 text-stone-600 font-bold uppercase tracking-widest text-sm hover:border-black hover:text-black transition-all"
              >
                Hủy
              </Link>
            </div>
          </div>

          {/* ── Cột phải: Preview ảnh + Tóm tắt ── */}
          <div className="space-y-4">
            <div className="bg-white border border-stone-100 shadow-sm p-4">
              <h3 className="font-label text-[10px] uppercase tracking-widest text-stone-500 mb-3">
                Preview ảnh
              </h3>
              {form.image1 ? (
                <div className="aspect-3/4 bg-stone-100 relative overflow-hidden mb-3">
                  <Image src={form.image1} alt="Ảnh chính" fill className="object-cover" />
                </div>
              ) : (
                <div className="aspect-3/4 bg-stone-100 flex items-center justify-center mb-3">
                  <p className="text-stone-400 text-xs text-center px-4">Nhập URL ảnh chính</p>
                </div>
              )}
              {form.image2 && (
                <div className="aspect-3/4 bg-stone-100 relative overflow-hidden">
                  <Image src={form.image2} alt="Ảnh phụ" fill className="object-cover" />
                </div>
              )}
            </div>

            {/* Tóm tắt biến thể */}
            {colors.length > 0 && (
              <div className="bg-white border border-stone-100 shadow-sm p-4">
                <h3 className="font-label text-[10px] uppercase tracking-widest text-stone-500 mb-3">
                  Tóm tắt biến thể
                </h3>
                <div className="space-y-2">
                  {colors.map((c) => {
                    const colorTotal = sizes.reduce(
                      (sum, s) => sum + getStock(c.hex, s), 0
                    );
                    return (
                      <div key={c.hex} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full border border-stone-200"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="text-xs text-stone-600">{c.name}</span>
                        </div>
                        <span className="text-xs font-label font-bold text-black">
                          {colorTotal} cái
                        </span>
                      </div>
                    );
                  })}
                  <div className="border-t border-stone-100 pt-2 flex justify-between">
                    <span className="text-xs font-label uppercase tracking-widest text-stone-500">Tổng</span>
                    <span className="text-xs font-label font-bold text-black">{totalStock} cái</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
