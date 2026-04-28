"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { ArrowLeft, MapPin, ShoppingBag, Star, Phone, Mail, Calendar, User } from "lucide-react";
import Link from "next/link";

const TIER_STYLE = {
  "Hạng Đồng": "bg-amber-100 text-amber-700",
  "Hạng Bạc":  "bg-stone-200 text-stone-600",
  "Hạng Vàng": "bg-yellow-100 text-yellow-700",
  "Hạng Đen":  "bg-stone-900 text-white",
};

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

  useEffect(() => {
    apiGet(`/api/users/${id}`)
      .then(setUser)
      .catch(() => router.push("/admin/users"))
      .finally(() => setLoading(false));
  }, [id]);

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

      {/* Header card */}
      <div className="bg-white border border-stone-200 rounded-lg p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center mb-6">
        <Avatar url={user.avatar_url} name={user.full_name} size={80} />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-stone-900">{user.full_name}</h1>
            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded ${TIER_STYLE[user.tier] || "bg-stone-100 text-stone-500"}`}>
              {user.tier}
            </span>
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
        {/* Điểm thưởng */}
        <div className="text-center bg-stone-50 rounded-lg px-6 py-4 min-w-[120px]">
          <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Điểm thưởng</p>
          <p className="text-3xl font-bold text-stone-900">{user.points}</p>
        </div>
      </div>

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
