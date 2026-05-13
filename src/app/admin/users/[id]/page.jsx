"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { ArrowLeft, MapPin, ShoppingBag, Star, Phone, Mail, Calendar, User } from "lucide-react";
import Link from "next/link";



const ORDER_STATUS_STYLE = {
  "Chờ xác nhận": "bg-yellow-100 text-yellow-700",
  "Đang xử lý":   "bg-blue-100 text-blue-700",
  "Đang giao":    "bg-purple-100 text-purple-700",
  "Đã giao":      "bg-green-100 text-green-700",
  "Đã hủy":       "bg-red-100 text-red-700",
};

function Avatar({ url, name, size = 80 }) {
  if (url) {
    return <img src={url} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  const initials = (name || "?").split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div
      className="rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-600"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",

    status: "active"
  });

  const loadUser = () => {
    setLoading(true);
    apiGet(`/api/users/${id}`)
      .then(data => {
        setUser(data);
        setForm({
          full_name: data.full_name || "",
          phone: data.phone || "",

          status: data.status || "active"
        });
      })
      .catch(() => router.push("/admin/users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("nmen_token")}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) alert(data.message || "Lỗi cập nhật");
      else {
        setIsEditing(false);
        loadUser();
      }
    } catch {
      alert("Lỗi kết nối server");
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="py-20 text-center text-stone-400">Đang tải...</div>;
  }
  if (!user) return null;

  const totalSpent = (user.orders || []).reduce((s, o) => s + Number(o.total_amount || 0), 0);

  return (
    <div>
      {/* Back */}
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-black mb-8 transition-colors">
        <ArrowLeft size={16} /> Quay lại danh sách
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Chi tiết khách hàng</h1>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="bg-stone-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-stone-800 transition-colors">
            Chỉnh sửa thông tin
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)} disabled={saving} className="border border-stone-300 px-4 py-2 rounded text-sm font-medium hover:bg-stone-50 transition-colors">
              Hủy
            </button>
            <button onClick={handleSave} disabled={saving} className="bg-stone-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-stone-800 transition-colors disabled:opacity-50">
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white border border-stone-200 rounded-lg p-6 mb-6">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Họ và tên *</label>
              <input type="text" name="full_name" value={form.full_name} onChange={handleFormChange} required className="w-full border border-stone-300 px-3 py-2 outline-none focus:border-black text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Số điện thoại</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleFormChange} className="w-full border border-stone-300 px-3 py-2 outline-none focus:border-black text-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Trạng thái tài khoản</label>
              <select name="status" value={form.status} onChange={handleFormChange} className="w-full border border-stone-300 px-3 py-2 outline-none focus:border-black text-sm bg-white">
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã khóa (Banned)</option>
              </select>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-lg p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center mb-6">
          <Avatar url={user.avatar_url} name={user.full_name} size={80} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-stone-900">{user.full_name}</h2>

              {user.status === 'inactive' && (
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded bg-red-100 text-red-700">
                  Đã khóa
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-stone-500">
              <a href={`mailto:${user.email}`} className="flex items-center gap-1.5 hover:text-black transition-colors">
                <Mail size={13} />{user.email}
              </a>
              {user.phone && (
                <a href={`tel:${user.phone}`} className="flex items-center gap-1.5 hover:text-black transition-colors">
                  <Phone size={13} />{user.phone}
                </a>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                Tham gia {new Date(user.joined_at).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>

        </div>
      )}

      {/* Thống kê */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng đơn", value: user.orders?.length || 0, icon: ShoppingBag },
          { label: "Tổng chi tiêu", value: `${totalSpent.toLocaleString("vi-VN")} đ`, icon: Star },
          { label: "Địa chỉ lưu", value: user.addresses?.length || 0, icon: MapPin },
          { label: "Đơn hoàn thành", value: (user.orders || []).filter((o) => o.status === "Đã giao").length, icon: ShoppingBag },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-stone-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className="text-stone-400" />
              <p className="text-xs text-stone-500 uppercase tracking-widest">{label}</p>
            </div>
            <p className="text-xl font-bold text-stone-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Danh sách địa chỉ */}
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <h2 className="font-bold text-stone-800 flex items-center gap-2">
              <MapPin size={15} className="text-stone-500" />
              Địa chỉ giao hàng ({user.addresses?.length || 0})
            </h2>
          </div>
          <div className="divide-y divide-stone-50">
            {!user.addresses || user.addresses.length === 0 ? (
              <p className="px-5 py-8 text-sm text-stone-400 text-center">Chưa có địa chỉ nào</p>
            ) : user.addresses.map((addr) => (
              <div key={addr.id} className="px-5 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-widest bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                        {addr.label}
                      </span>
                      {addr.is_default === 1 && (
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">✓ Mặc định</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-stone-800">
                      {addr.recipient}
                      {addr.phone && <span className="ml-2 text-stone-400 font-normal">· {addr.phone}</span>}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">{addr.address}</p>
                    {(addr.commune_name || addr.province_name) && (
                      <p className="text-xs text-stone-400 mt-0.5">
                        {addr.commune_name && `${addr.commune_name}, `}{addr.province_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lịch sử đơn hàng */}
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <h2 className="font-bold text-stone-800 flex items-center gap-2">
              <ShoppingBag size={15} className="text-stone-500" />
              Lịch sử đơn hàng ({user.orders?.length || 0})
            </h2>
          </div>
          <div className="divide-y divide-stone-50 max-h-[480px] overflow-y-auto">
            {!user.orders || user.orders.length === 0 ? (
              <p className="px-5 py-8 text-sm text-stone-400 text-center">Chưa có đơn hàng nào</p>
            ) : user.orders.map((o) => (
              <div key={o.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-sm font-bold text-stone-800 hover:text-black font-mono underline underline-offset-4 transition-colors"
                  >
                    #{o.order_number}
                  </Link>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {new Date(o.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded ${ORDER_STATUS_STYLE[o.status] || "bg-stone-100 text-stone-500"}`}>
                    {o.status}
                  </span>
                  <p className="text-sm font-bold text-stone-800 mt-1">
                    {Number(o.total_amount).toLocaleString("vi-VN")} đ
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
