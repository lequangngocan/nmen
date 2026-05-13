"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiGet, apiPatch, apiPut, getFullUrl } from "@/lib/api";
import { ArrowLeft, Edit2, Package, CheckCircle2 } from "lucide-react";

const ALLOWED_TRANSITIONS = {
  pending:    ["confirmed", "cancelled"],
  confirmed:  ["processing", "cancelled"],
  processing: ["shipping", "cancelled"],
  shipping:   ["delivered", "returned"],
  delivered:  ["returned"],
  cancelled:  [],
  returned:   [],
};

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

const TERMINAL = ["cancelled", "returned"];
const ITEM_EDITABLE = ["pending", "confirmed"];

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipping", "delivered"];

function StatusBadge({ status }) {
  const map = {
    pending:    "bg-yellow-100 text-yellow-700",
    confirmed:  "bg-sky-100 text-sky-700",
    processing: "bg-blue-100 text-blue-700",
    shipping:   "bg-indigo-100 text-indigo-700",
    delivered:  "bg-green-100 text-green-700",
    cancelled:  "bg-red-100 text-red-700",
    returned:   "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded ${map[status] || "bg-stone-100 text-stone-600"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function StatusTimeline({ currentStatus }) {
  const isTerminal = TERMINAL.includes(currentStatus);
  const currentIdx = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="bg-white border border-stone-100 shadow-sm p-5 mb-6">
      {isTerminal ? (
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${currentStatus === "cancelled" ? "text-red-600" : "text-orange-600"}`}>
            {STATUS_LABELS[currentStatus]}
          </span>
          <span className="text-xs text-stone-400">— Đơn hàng đã kết thúc</span>
        </div>
      ) : (
        <div className="flex items-center gap-0">
          {STATUS_STEPS.map((s, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                    ${done   ? "bg-black border-black text-white"
                    : active ? "bg-white border-black text-black"
                    :          "bg-white border-stone-200 text-stone-300"}`}>
                    {done ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  <span className={`text-[9px] mt-1 font-medium uppercase tracking-wide whitespace-nowrap
                    ${active ? "text-black" : done ? "text-stone-500" : "text-stone-300"}`}>
                    {STATUS_LABELS[s]}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < currentIdx ? "bg-black" : "bg-stone-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // status update
  const [newStatus, setNewStatus] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusToast, setStatusToast] = useState("");

  // payment status update
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

  // info edit
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({});
  const [savingInfo, setSavingInfo] = useState(false);

  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  useEffect(() => {
    apiGet(`/api/orders/${id}`)
      .then((data) => {
        if (data.id) {
          setOrder(data);
          setNewStatus(data.status);
          setNewPaymentStatus(data.payment_status || "pending");
          setInfoForm({
            customer_name: data.customer_name || "",
            phone: data.phone || "",
            email: data.email || "",
            shipping_address: data.shipping_address || "",
            note: data.note || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async () => {
    if (newStatus === order.status) return;
    setSavingStatus(true);
    try {
      await apiPatch(`/api/orders/${id}/status`, {
        status: newStatus,
        cancelled_reason: (newStatus === "cancelled" || newStatus === "returned") ? cancelReason : undefined,
      });
      setOrder((prev) => ({ ...prev, status: newStatus, cancelled_reason: cancelReason }));
      showToast("✅ Đã cập nhật trạng thái");
    } catch (err) {
      showToast(err.message || "Lỗi khi cập nhật trạng thái", "error");
      setNewStatus(order.status);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (newPaymentStatus === order.payment_status) return;
    setSavingPayment(true);
    try {
      await apiPut(`/api/orders/${id}/info`, { payment_status: newPaymentStatus });
      setOrder((prev) => ({ ...prev, payment_status: newPaymentStatus }));
      showToast("✅ Đã cập nhật trạng thái thanh toán");
    } catch (err) {
      showToast(err.message || "Lỗi khi cập nhật", "error");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    try {
      await apiPut(`/api/orders/${id}/info`, infoForm);
      setOrder((prev) => ({ ...prev, ...infoForm }));
      setEditingInfo(false);
      showToast("✅ Đã cập nhật thông tin giao hàng");
    } catch (err) {
      showToast(err.message || "Lỗi khi lưu thông tin", "error");
    } finally {
      setSavingInfo(false);
    }
  };

  if (loading) return <div className="text-stone-400 text-sm py-10 text-center">Đang tải...</div>;
  if (!order)  return <div className="text-red-500 text-sm py-10 text-center">Không tìm thấy đơn hàng.</div>;

  const isTerminal = TERMINAL.includes(order.status);
  const canEditItems = ITEM_EDITABLE.includes(order.status);
  const allowedNextStatuses = ALLOWED_TRANSITIONS[order.status] || [];
  const shippingFull = [order.shipping_address, order.shipping_commune, order.shipping_province]
    .filter(Boolean).join(", ");

  const inputClass = "w-full border border-stone-300 bg-white px-3 py-2 text-sm text-black focus:border-black outline-none";

  return (
    <div>
      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 text-sm font-medium shadow-lg rounded transition-all
          ${toast.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-black uppercase tracking-widest mb-3 transition-colors">
          <ArrowLeft size={12} /> Quay lại
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-3xl font-black tracking-tight uppercase text-black">
              Đơn {order.order_number}
            </h1>
            <p className="text-stone-500 text-sm mt-1">{new Date(order.created_at).toLocaleString("vi-VN")}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Stepper timeline */}
      <StatusTimeline currentStatus={order.status} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel trái */}
        <div className="lg:col-span-2 space-y-6">

          {/* Thông tin khách hàng */}
          <div className="bg-white border border-stone-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline font-bold uppercase tracking-tight text-black text-sm">Thông tin khách hàng</h2>
              {!isTerminal && !editingInfo && (
                <button
                  onClick={() => setEditingInfo(true)}
                  className="flex items-center gap-1 text-xs text-stone-400 hover:text-black transition-colors"
                >
                  <Edit2 size={12} /> Sửa
                </button>
              )}
            </div>

            {editingInfo ? (
              <div className="space-y-3">
                {[
                  ["Họ tên", "customer_name", "text"],
                  ["Điện thoại", "phone", "text"],
                  ["Email", "email", "email"],
                  ["Địa chỉ", "shipping_address", "text"],
                ].map(([label, field, type]) => (
                  <div key={field}>
                    <label className="text-[10px] font-label uppercase tracking-widest text-stone-400 block mb-1">{label}</label>
                    <input
                      type={type}
                      value={infoForm[field] || ""}
                      onChange={(e) => setInfoForm((f) => ({ ...f, [field]: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-label uppercase tracking-widest text-stone-400 block mb-1">Ghi chú</label>
                  <textarea
                    value={infoForm.note || ""}
                    onChange={(e) => setInfoForm((f) => ({ ...f, note: e.target.value }))}
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSaveInfo}
                    disabled={savingInfo}
                    className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-40"
                  >
                    {savingInfo ? "Đang lưu..." : "Lưu thông tin"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingInfo(false);
                      setInfoForm({
                        customer_name: order.customer_name,
                        phone: order.phone,
                        email: order.email,
                        shipping_address: order.shipping_address,
                        note: order.note || "",
                      });
                    }}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-stone-300 text-stone-600 hover:border-stone-500 transition-all"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {[
                  ["Họ tên", order.customer_name],
                  ["Email", order.email],
                  ["Điện thoại", order.phone],
                  ["Địa chỉ", shippingFull],
                  ["Thanh toán", order.payment_method],
                  ["TT Thanh toán", PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status],
                ].map(([label, val]) => (
                  <div key={label}>
                    <dt className="text-[10px] font-label uppercase tracking-widest text-stone-400 mb-1">{label}</dt>
                    <dd className="text-black font-medium">{val || "—"}</dd>
                  </div>
                ))}
              </dl>
            )}

            {!editingInfo && order.note && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <dt className="text-[10px] font-label uppercase tracking-widest text-stone-400 mb-1">Ghi chú</dt>
                <dd className="text-black text-sm">{order.note}</dd>
              </div>
            )}
            {order.cancelled_reason && (
              <div className="mt-4 pt-4 border-t border-red-100 bg-red-50 px-3 py-2 rounded">
                <dt className="text-[10px] font-label uppercase tracking-widest text-red-400 mb-1">Lý do hủy / trả</dt>
                <dd className="text-red-700 text-sm">{order.cancelled_reason}</dd>
              </div>
            )}
          </div>

          {/* Sản phẩm */}
          <div className="bg-white border border-stone-100 shadow-sm">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-headline font-bold uppercase tracking-tight text-black text-sm">
                Sản phẩm ({order.items?.length || 0})
              </h2>
              {canEditItems && (
                <Link
                  href={`/admin/orders/${id}/items`}
                  className="flex items-center gap-1.5 text-xs font-medium border px-3 py-1.5 transition-all
                    hover:bg-stone-900 hover:text-white hover:border-stone-900
                    border-stone-300 text-stone-600"
                >
                  <Package size={12} />
                  Sửa sản phẩm
                  <span className={`ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest
                    ${order.payment_method === "COD"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"}`}>
                    {order.payment_method === "COD" ? "Đầy đủ" : "Chỉ variant"}
                  </span>
                </Link>
              )}
            </div>
            <div className="divide-y divide-stone-50">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex gap-4 px-5 py-4 items-start">
                  <div className="w-14 h-18 bg-stone-100 shrink-0 relative overflow-hidden" style={{ height: "72px", width: "56px" }}>
                    {item.image_url ? (
                      <Image src={getFullUrl(item.image_url)} alt={item.product_name} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">N/A</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-black text-sm truncate">{item.product_name}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{item.color_name || "—"} / {item.size || "—"}</p>
                    <p className="text-xs text-stone-400 mt-0.5">SL: {item.quantity}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-bold text-black">{Number(item.unit_price).toLocaleString("vi-VN")} đ</span>
                      {Number(item.original_price) > Number(item.unit_price) && (
                        <span className="text-xs text-stone-400 line-through">{Number(item.original_price).toLocaleString("vi-VN")} đ</span>
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
        <div className="space-y-5">
          {/* Tổng đơn */}
          <div className="bg-white border border-stone-100 shadow-sm p-5">
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

              </div>
            </dl>
          </div>

          {/* Cập nhật trạng thái */}
          <div className="bg-white border border-stone-100 shadow-sm p-5">
            <h2 className="font-headline font-bold uppercase tracking-tight text-black mb-4 text-sm">Trạng thái đơn</h2>
            {isTerminal ? (
              <div className="text-xs text-stone-500 bg-stone-50 border border-stone-200 px-3 py-2 rounded">
                Đơn hàng đã kết thúc — không thể thay đổi
              </div>
            ) : (
              <>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-stone-300 bg-white px-3 py-2 text-sm text-black focus:border-black outline-none mb-3"
                >
                  <option value={order.status}>{STATUS_LABELS[order.status]} (hiện tại)</option>
                  {allowedNextStatuses.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>

                {(newStatus === "cancelled" || newStatus === "returned") && newStatus !== order.status && (
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder={newStatus === "cancelled" ? "Lý do hủy đơn..." : "Lý do trả hàng..."}
                    rows={2}
                    className="w-full border border-stone-300 bg-white px-3 py-2 text-sm text-black focus:border-black outline-none mb-3 resize-none"
                  />
                )}

                <button
                  onClick={handleUpdateStatus}
                  disabled={savingStatus || newStatus === order.status}
                  className="w-full bg-black text-white py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-40"
                >
                  {savingStatus ? "Đang lưu..." : "Lưu trạng thái"}
                </button>
                {statusToast && <p className="mt-2 text-xs text-green-600 text-center">{statusToast}</p>}
              </>
            )}
          </div>

          {/* Trạng thái thanh toán */}
          <div className="bg-white border border-stone-100 shadow-sm p-5">
            <h2 className="font-headline font-bold uppercase tracking-tight text-black mb-4 text-sm">Trạng thái thanh toán</h2>
            <select
              value={newPaymentStatus}
              onChange={(e) => setNewPaymentStatus(e.target.value)}
              disabled={isTerminal}
              className="w-full border border-stone-300 bg-white px-3 py-2 text-sm text-black focus:border-black outline-none mb-3 disabled:opacity-50"
            >
              {Object.entries(PAYMENT_STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <button
              onClick={handleUpdatePayment}
              disabled={savingPayment || newPaymentStatus === order.payment_status || isTerminal}
              className="w-full bg-black text-white py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-40"
            >
              {savingPayment ? "Đang lưu..." : "Lưu thanh toán"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
