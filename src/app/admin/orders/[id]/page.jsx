"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { apiGet, apiPatch, getFullUrl } from "@/lib/api";

const STATUSES = ["pending", "confirmed", "processing", "shipping", "delivered", "cancelled", "returned"];

const STATUS_LABELS = {
  pending:    "Chờ xác nhận",
  confirmed:  "Đã xác nhận",
  processing: "Đang xử lý",
  shipping:   "Đang giao",
  delivered:  "Đã giao",
  cancelled:  "Đã hủy",
  returned:   "Trả hàng",
};

const PAYMENT_STATUS_LABELS = {
  pending:  "Chờ thanh toán",
  paid:     "Đã thanh toán",
  failed:   "Lỗi thanh toán",
  refunded: "Đã hoàn tiền",
};

function StatusBadge({ status }) {
  const map = {
    pending:    "bg-yellow-100 text-yellow-700",
    confirmed:  "bg-sky-100 text-sky-700",
    processing: "bg-blue-100 text-blue-700",
    shipping:   "bg-indigo-100 text-indigo-700",
    delivered:  "bg-stone-200 text-stone-700",
    cancelled:  "bg-red-100 text-red-700",
    returned:   "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${map[status] || "bg-stone-100 text-stone-600"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [cancelledReason, setCancelledReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    apiGet(`/api/orders/${id}`)
      .then((data) => {
        if (data.id) {
          setOrder(data);
          setNewStatus(data.status);
          setCancelledReason(data.cancelled_reason || "");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async () => {
    if (newStatus === order.status) return;
    setSaving(true);
    const res = await apiPatch(`/api/orders/${id}/status`, {
      status: newStatus,
      cancelled_reason: newStatus === "cancelled" ? cancelledReason : undefined,
    });
    setSaving(false);
    if (res.message === "Cập nhật trạng thái thành công") {
      setOrder((prev) => ({ ...prev, status: newStatus, cancelled_reason: cancelledReason }));
      setToast("✅ Đã cập nhật trạng thái");
      setTimeout(() => setToast(""), 3000);
    }
  };

  if (loading) return <div className="text-stone-400 text-sm py-10 text-center">Đang tải...</div>;
  if (!order)  return <div className="text-red-500 text-sm py-10 text-center">Không tìm thấy đơn hàng.</div>;

  const shippingFull = [
    order.shipping_address,
    order.shipping_commune,
    order.shipping_province,
  ].filter(Boolean).join(", ");

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button onClick={() => router.back()} className="text-xs text-stone-400 hover:text-black uppercase tracking-widest mb-3 transition-colors">
            ← Quay lại
          </button>
          <h1 className="font-headline text-3xl font-black tracking-tight uppercase text-black">
            Đơn {order.order_number}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {new Date(order.created_at).toLocaleString("vi-VN")}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin khách */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-stone-100 shadow-sm p-6">
            <h2 className="font-headline font-bold uppercase tracking-tight text-black mb-4 text-sm">Thông tin khách hàng</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ["Họ tên",       order.customer_name],
                ["Email",        order.email],
                ["Điện thoại",   order.phone],
                ["Địa chỉ",      shippingFull],
                ["Thanh toán",   order.payment_method],
                ["TT Thanh toán", PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status],
              ].map(([label, val]) => (
                <div key={label}>
                  <dt className="text-[10px] font-label uppercase tracking-widest text-stone-400 mb-1">{label}</dt>
                  <dd className="text-black font-medium">{val || "—"}</dd>
                </div>
              ))}
            </dl>
            {order.note && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <dt className="text-[10px] font-label uppercase tracking-widest text-stone-400 mb-1">Ghi chú</dt>
                <dd className="text-black text-sm">{order.note}</dd>
              </div>
            )}
            {order.cancelled_reason && (
              <div className="mt-4 pt-4 border-t border-red-100 bg-red-50 px-3 py-2 rounded">
                <dt className="text-[10px] font-label uppercase tracking-widest text-red-400 mb-1">Lý do hủy</dt>
                <dd className="text-red-700 text-sm">{order.cancelled_reason}</dd>
              </div>
            )}
          </div>

          {/* Sản phẩm */}
          <div className="bg-white border border-stone-100 shadow-sm">
            <div className="p-6 border-b border-stone-100">
              <h2 className="font-headline font-bold uppercase tracking-tight text-black text-sm">Sản phẩm ({order.items?.length || 0})</h2>
            </div>
            <div className="divide-y divide-stone-50">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex gap-4 px-6 py-4 items-start">
                  {/* Ảnh snapshot */}
                  <div className="w-16 h-20 bg-stone-100 shrink-0 relative overflow-hidden">
                    {item.image_url ? (
                      <Image src={getFullUrl(item.image_url)} alt={item.product_name} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">N/A</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-black text-sm truncate">{item.product_name}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{item.color_name || "—"} / {item.size || "—"}</p>
                    <p className="text-xs text-stone-400 mt-0.5">Số lượng: {item.quantity}</p>
                    {/* Giá gốc vs. giá sale */}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-bold text-black">
                        {Number(item.unit_price).toLocaleString("vi-VN")} đ
                      </span>
                      {Number(item.original_price) > Number(item.unit_price) && (
                        <span className="text-xs text-stone-400 line-through">
                          {Number(item.original_price).toLocaleString("vi-VN")} đ
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-sm text-black">
                      {Number(item.line_total || item.unit_price * item.quantity).toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tổng đơn */}
          <div className="bg-white border border-stone-100 shadow-sm p-6">
            <h2 className="font-headline font-bold uppercase tracking-tight text-black mb-4 text-sm">Tổng đơn hàng</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-stone-500">Tạm tính</dt><dd>{Number(order.subtotal).toLocaleString("vi-VN")} đ</dd></div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <dt>Giảm giá ({order.promo_code})</dt>
                  <dd>-{Number(order.discount_amount).toLocaleString("vi-VN")} đ</dd>
                </div>
              )}
              <div className="flex justify-between text-stone-500">
                <dt>Phí ship</dt>
                <dd>{Number(order.shipping_fee) === 0 ? "Miễn phí" : Number(order.shipping_fee).toLocaleString("vi-VN") + " đ"}</dd>
              </div>
              <div className="flex justify-between border-t border-stone-100 pt-2 font-bold">
                <dt>Tổng cộng</dt>
                <dd>{Number(order.total_amount).toLocaleString("vi-VN")} đ</dd>
              </div>
              <div className="flex justify-between text-stone-400 text-xs">
                <dt>Điểm tích lũy</dt><dd>+{order.points_earned} điểm</dd>
              </div>
            </dl>
          </div>

          {/* Cập nhật trạng thái */}
          <div className="bg-white border border-stone-100 shadow-sm p-6">
            <h2 className="font-headline font-bold uppercase tracking-tight text-black mb-4 text-sm">Cập nhật trạng thái</h2>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full border border-stone-300 bg-white px-3 py-2 text-sm text-black focus:border-black outline-none mb-3"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>

            {/* Lý do hủy — chỉ hiện khi chọn cancelled */}
            {newStatus === "cancelled" && (
              <textarea
                value={cancelledReason}
                onChange={(e) => setCancelledReason(e.target.value)}
                placeholder="Lý do hủy đơn (tùy chọn)..."
                rows={2}
                className="w-full border border-stone-300 bg-white px-3 py-2 text-sm text-black focus:border-black outline-none mb-3 resize-none"
              />
            )}

            <button
              onClick={handleUpdateStatus}
              disabled={saving || newStatus === order.status}
              className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-40"
            >
              {saving ? "Đang lưu..." : "Lưu trạng thái"}
            </button>
            {toast && <p className="mt-2 text-xs text-green-600 text-center">{toast}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
