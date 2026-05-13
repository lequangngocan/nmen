"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { apiGet, apiPut } from "@/lib/api";

export default function EditPromoPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percent",
    discount_value: "",
    min_order: "0",
    max_uses: "",
    expires_at: "",
    is_active: 1,
  });

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const data = await apiGet(`/api/promo/${id}`);
        
        // Chuyển đổi expires_at thành định dạng datetime-local (YYYY-MM-DDTHH:mm)
        let formattedDate = "";
        if (data.expires_at) {
          const d = new Date(data.expires_at);
          d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
          formattedDate = d.toISOString().slice(0, 16);
        }

        setFormData({
          code: data.code,
          discount_type: data.discount_type,
          discount_value: data.discount_value,
          min_order: data.min_order,
          max_uses: data.max_uses || "",
          expires_at: formattedDate,
          is_active: data.is_active,
        });
      } catch (e) {
        alert("Lỗi khi tải thông tin mã giảm giá");
        router.push("/admin/promo");
      } finally {
        setLoading(false);
      }
    };
    fetchPromo();
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discount_value) {
      alert("Vui lòng nhập mã và mức giảm giá");
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discount_value: Number(formData.discount_value),
        min_order: formData.min_order ? Number(formData.min_order) : 0,
        max_uses: formData.max_uses ? Number(formData.max_uses) : null,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        is_active: Number(formData.is_active),
      };

      await apiPut(`/api/promo/${id}`, payload);
      alert("Cập nhật mã giảm giá thành công");
      router.push("/admin/promo");
    } catch (err) {
      alert(err.message || "Lỗi khi cập nhật mã giảm giá");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-stone-500">Đang tải...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/promo" className="p-2 hover:bg-stone-200 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-headline">Chỉnh sửa mã giảm giá</h1>
          <p className="text-stone-500 text-sm">Mã: {formData.code}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mã (Code) *</label>
            <input
              type="text"
              name="code"
              required
              placeholder="VD: WELCOME10"
              value={formData.code}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-black outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              name="is_active"
              value={formData.is_active}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-black outline-none"
            >
              <option value={1}>Hoạt động</option>
              <option value={0}>Tạm dừng</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Loại giảm giá *</label>
            <select
              name="discount_type"
              value={formData.discount_type}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-black outline-none"
            >
              <option value="percent">Phần trăm (%)</option>
              <option value="fixed">Tiền mặt (VNĐ)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Mức giảm {formData.discount_type === "percent" ? "(%)" : "(VNĐ)"} *
            </label>
            <input
              type="number"
              name="discount_value"
              required
              min="0"
              max={formData.discount_type === "percent" ? "100" : undefined}
              value={formData.discount_value}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Đơn tối thiểu (VNĐ)</label>
            <input
              type="number"
              name="min_order"
              min="0"
              value={formData.min_order}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Số lượt dùng tối đa</label>
            <input
              type="number"
              name="max_uses"
              min="1"
              placeholder="Bỏ trống nếu không giới hạn"
              value={formData.max_uses}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Ngày giờ hết hạn</label>
            <input
              type="datetime-local"
              name="expires_at"
              value={formData.expires_at}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-black outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded font-medium hover:bg-stone-800 transition disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Đang lưu..." : "Cập nhật mã giảm giá"}
          </button>
        </div>
      </form>
    </div>
  );
}
