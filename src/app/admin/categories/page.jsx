"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { ADMIN_CATEGORIES } from "@/constants/admin-data";

export default function AdminCategoriesPage() {
  // State danh sách danh mục (giả lập, thực tế sẽ gọi API)
  const [categories, setCategories] = useState(ADMIN_CATEGORIES);

  // State form thêm/sửa
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = thêm mới, có id = đang sửa
  const [form, setForm] = useState({ name: "", slug: "", description: "" });

  // Mở form thêm mới
  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ name: "", slug: "", description: "" });
    setShowForm(true);
  };

  // Mở form sửa danh mục
  const handleOpenEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description });
    setShowForm(true);
  };

  // Hàm tự động tạo slug từ tên (demo đơn giản)
  const handleNameChange = (e) => {
    const name = e.target.value;
    // Tạo slug tạm: bỏ dấu tiếng Việt thành chữ thường, thay space = dấu gạch
    // (Đơn giản hóa cho đồ án, thực tế cần thư viện slugify)
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setForm((prev) => ({ ...prev, name, slug }));
  };

  // Hàm lưu (thêm mới hoặc cập nhật)
  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      // Cập nhật danh mục đang sửa
      setCategories(
        categories.map((cat) =>
          cat.id === editingId ? { ...cat, ...form } : cat
        )
      );
    } else {
      // Thêm danh mục mới
      const newCat = {
        id: `cat${Date.now()}`, // id tạm
        ...form,
        productCount: 0,
      };
      setCategories([...categories, newCat]);
    }
    setShowForm(false);
  };

  // Hàm xóa danh mục
  const handleDelete = (id) => {
    const ok = confirm("Bạn có chắc muốn xóa danh mục này không?");
    if (ok) {
      setCategories(categories.filter((cat) => cat.id !== id));
    }
  };

  return (
    <div>
      {/* Tiêu đề + nút thêm mới */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline text-3xl font-black tracking-tight uppercase text-black">
            Danh mục
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {categories.length} danh mục sản phẩm
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-stone-800 transition-all active:scale-95"
        >
          <Plus size={16} />
          Thêm danh mục
        </button>
      </div>

      {/* Form thêm/sửa danh mục (inline) */}
      {showForm && (
        <div className="bg-white border border-stone-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-lg font-bold uppercase tracking-tight text-black">
              {editingId ? "Sửa danh mục" : "Thêm danh mục mới"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-stone-400 hover:text-black transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tên danh mục */}
            <div>
              <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">
                Tên danh mục *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={handleNameChange}
                required
                placeholder="VD: Áo khoác"
                className="w-full border border-stone-200 focus:border-black bg-white px-3 py-2 outline-none text-black text-sm transition-colors"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="VD: ao-khoac"
                className="w-full border border-stone-200 focus:border-black bg-white px-3 py-2 outline-none text-black text-sm transition-colors"
              />
            </div>

            {/* Mô tả */}
            <div>
              <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">
                Mô tả
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="VD: Áo khoác nam các loại"
                className="w-full border border-stone-200 focus:border-black bg-white px-3 py-2 outline-none text-black text-sm transition-colors"
              />
            </div>

            {/* Nút lưu */}
            <div className="sm:col-span-3 flex gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 bg-black text-white px-6 py-2 text-sm font-bold uppercase tracking-widest hover:bg-stone-800 transition-all"
              >
                <Check size={16} />
                {editingId ? "Lưu thay đổi" : "Thêm mới"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-stone-300 text-stone-600 text-sm font-bold uppercase tracking-widest hover:border-black hover:text-black transition-all"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bảng danh sách danh mục */}
      <div className="bg-white border border-stone-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">
                Tên danh mục
              </th>
              <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">
                Slug
              </th>
              <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">
                Mô tả
              </th>
              <th className="text-center px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">
                Số sản phẩm
              </th>
              <th className="px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500 text-center">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4 font-label font-bold text-black">
                  {cat.name}
                </td>
                <td className="px-6 py-4 text-stone-400 text-xs font-mono">
                  {cat.slug}
                </td>
                <td className="px-6 py-4 text-stone-600 text-xs">
                  {cat.description || "—"}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-label font-bold text-black">
                    {cat.productCount}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-2 text-stone-500 hover:text-black hover:bg-stone-100 rounded transition-colors"
                      title="Sửa"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-stone-400 text-sm"
                >
                  Chưa có danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
