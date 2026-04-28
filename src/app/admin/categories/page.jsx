"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

const toSlug = (str) =>
  str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .trim().replace(/\s+/g, "-");

const EMPTY_FORM = {
  name: "", slug: "", parent_id: "", position: 0,
  status: "active", description: "",
};

function StatusBadge({ status }) {
  return status === "active"
    ? <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-700">Active</span>
    : <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-stone-100 text-stone-500">Inactive</span>;
}

// ── Modal ──────────────────────────────────────────────────────────────────
function CategoryModal({ open, onClose, onSaved, editTarget, parents }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    if (editTarget) {
      setForm({
        name:        editTarget.name        ?? "",
        slug:        editTarget.slug        ?? "",
        parent_id:   editTarget.parent_id   ?? "",
        position:    editTarget.position    ?? 0,
        status:      editTarget.status      ?? "active",
        description: editTarget.description ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, editTarget]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      setForm((f) => ({ ...f, name: value, slug: toSlug(value) }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const body = {
      ...form,
      parent_id: form.parent_id === "" ? null : Number(form.parent_id),
      position: Number(form.position),
    };
    const res = editTarget
      ? await apiPut(`/api/categories/${editTarget.id}`, body)
      : await apiPost("/api/categories", body);
    setSaving(false);
    if (res.message && res.message !== "Cập nhật thành công") {
      setError(res.message);
    } else {
      onSaved();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white w-full max-w-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-headline font-bold uppercase tracking-tight text-black text-base">
            {editTarget ? `Chỉnh sửa: ${editTarget.name}` : "Thêm danh mục"}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-black transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-red-500 text-xs bg-red-50 border border-red-200 px-3 py-2">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Tên danh mục *</label>
              <input name="name" value={form.name} onChange={handleChange} required autoFocus
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none" />
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange}
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none font-mono text-stone-500" />
            </div>

            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Danh mục cha</label>
              <select name="parent_id" value={form.parent_id} onChange={handleChange}
                className="w-full border border-stone-300 focus:border-black bg-white px-3 py-2 text-sm outline-none">
                <option value="">-- Không có (cấp gốc) --</option>
                {parents
                  .filter((p) => !editTarget || p.id !== editTarget.id)
                  .map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Thứ tự</label>
              <input name="position" type="number" min="0" value={form.position} onChange={handleChange}
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none" />
            </div>

            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Trạng thái</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full border border-stone-300 focus:border-black bg-white px-3 py-2 text-sm outline-none">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">Mô tả</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                className="w-full border border-stone-300 focus:border-black px-3 py-2 text-sm outline-none resize-none" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="border border-stone-300 px-6 py-2 text-xs font-bold uppercase tracking-widest hover:border-black transition-all">
              Huỷ
            </button>
            <button type="submit" disabled={saving}
              className="bg-black text-white px-8 py-2 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-50">
              {saving ? "Đang lưu..." : editTarget ? "Lưu thay đổi" : "Tạo danh mục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Trang chính ────────────────────────────────────────────────────────────
export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterParent, setFilterParent] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create

  // Danh sách root categories cho select "Danh mục cha"
  const rootCategories = categories.filter((c) => !c.parent_id);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ flat: "1" });
    if (filterStatus) params.set("status", filterStatus);
    if (filterParent !== "") params.set("parent_id", filterParent);
    apiGet(`/api/categories?${params}`)
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [filterStatus, filterParent]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit   = (cat) => { setEditTarget(cat); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleDelete = async (cat) => {
    if (!confirm(`Xóa danh mục "${cat.name}"?`)) return;
    const res = await apiDelete(`/api/categories/${cat.id}`);
    if (res.message && res.message !== "Đã xóa danh mục") {
      alert(res.message);
    } else {
      load();
    }
  };

  return (
    <>
      <CategoryModal
        open={modalOpen}
        onClose={closeModal}
        onSaved={load}
        editTarget={editTarget}
        parents={rootCategories}
      />

      <div>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-headline text-3xl font-black tracking-tight uppercase text-black">Danh mục</h1>
            <p className="text-stone-500 text-sm mt-1">{categories.length} danh mục</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all">
            <Plus size={14} /> Thêm danh mục
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Filter status */}
          <div className="flex gap-2">
            {[["", "Tất cả"], ["active", "Active"], ["inactive", "Inactive"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilterStatus(val)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${
                  filterStatus === val ? "bg-black text-white border-black" : "border-stone-300 text-stone-500 hover:border-black hover:text-black"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Filter parent */}
          <select value={filterParent} onChange={(e) => setFilterParent(e.target.value)}
            className="border border-stone-300 bg-white px-3 py-2 text-xs text-stone-600 outline-none focus:border-black transition-colors">
            <option value="">Tất cả cấp</option>
            <option value="null">Cấp gốc</option>
            {rootCategories.map((p) => (
              <option key={p.id} value={p.id}>Con của: {p.name}</option>
            ))}
          </select>

          {/* Nút Bỏ lọc — chỉ hiện khi đang filter */}
          {(filterStatus !== "" || filterParent !== "") && (
            <button
              onClick={() => { setFilterStatus(""); setFilterParent(""); }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-red-500 border border-stone-200 hover:border-red-300 transition-all"
            >
              <X size={12} /> Bỏ lọc
            </button>
          )}
        </div>

        {/* Bảng */}
        <div className="bg-white border border-stone-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {["Tên","Slug","Danh mục cha","Thứ tự","Trạng thái","Số SP",""].map((h) => (
                  <th key={h} className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-stone-400">Đang tải...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-stone-400">Không có danh mục nào.</td></tr>
              ) : categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-black">{cat.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-stone-400">{cat.slug}</td>
                  <td className="px-6 py-4 text-stone-500">{cat.parent_name || <span className="text-stone-300">—</span>}</td>
                  <td className="px-6 py-4 text-stone-500">{cat.position}</td>
                  <td className="px-6 py-4"><StatusBadge status={cat.status} /></td>
                  <td className="px-6 py-4 text-stone-500">{cat.product_count}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEdit(cat)} className="text-stone-400 hover:text-black transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(cat)} className="text-stone-400 hover:text-red-500 transition-colors">
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
    </>
  );
}
