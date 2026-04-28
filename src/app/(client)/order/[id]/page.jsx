"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Headset, Loader2 } from "lucide-react";
import { apiGet, apiPost, getFullUrl } from "@/lib/api";

// ─── Trạng thái ───────────────────────────────────────────────────────────────
const STATUS_LABELS = {
  pending:    "Chờ xác nhận",
  confirmed:  "Đã xác nhận",
  processing: "Đang xử lý",
  shipping:   "Đang giao hàng",
  delivered:  "Đã giao",
  cancelled:  "Đã hủy",
  returned:   "Trả hàng",
};

const STATUS_STYLE = {
  pending:    { bg: "bg-yellow-100",  text: "text-yellow-700" },
  confirmed:  { bg: "bg-blue-50",     text: "text-blue-700"   },
  processing: { bg: "bg-indigo-50",   text: "text-indigo-700" },
  shipping:   { bg: "bg-orange-50",   text: "text-orange-700" },
  delivered:  { bg: "bg-emerald-50",  text: "text-emerald-700"},
  cancelled:  { bg: "bg-red-50",      text: "text-red-600"    },
  returned:   { bg: "bg-stone-100",   text: "text-stone-600"  },
};

const STEPS = ["pending", "confirmed", "processing", "shipping", "delivered"];
const STEP_LABELS = {
  pending:    "Chờ xác nhận",
  confirmed:  "Đã xác nhận",
  processing: "Đang xử lý",
  shipping:   "Đang giao",
  delivered:  "Đã giao",
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { bg: "bg-stone-100", text: "text-stone-600" };
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${s.bg} ${s.text}`}>
      {label}
    </span>
  );
}

function ProgressBar({ status }) {
  const idx = STEPS.indexOf(status);
  const isCancelled = status === "cancelled" || status === "returned";
  if (isCancelled) return null;

  return (
    <div className="relative flex justify-between items-center">
      <div className="absolute top-4 left-0 w-full h-[2px] bg-stone-300 z-0" />
      <div
        className="absolute top-4 left-0 h-[2px] bg-black z-0 transition-all duration-500"
        style={{ width: idx < 0 ? "0%" : `${(idx / (STEPS.length - 1)) * 100}%` }}
      />
      {STEPS.map((step, i) => {
        const done = i <= idx;
        return (
          <div key={step} className="relative z-10 flex flex-col items-center gap-3 flex-1 first:items-start last:items-end">
            <div className={`w-8 h-8 flex items-center justify-center border-2 transition-all
              ${done ? "bg-black border-black" : "bg-stone-200 border-stone-300"}`}>
              {done ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span className="w-2 h-2 rounded-full bg-stone-400" />
              )}
            </div>
            <span className={`font-label text-[9px] uppercase tracking-widest text-center leading-tight
              ${done ? "text-black font-bold" : "text-stone-400"}`}>
              {STEP_LABELS[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params?.id;

  const [order, setOrder]     = useState(null);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    apiGet(`/api/orders/${orderId}`)
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message || "Không thể tải đơn hàng"))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleCancel = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.")) return;
    setIsCancelling(true);
    try {
      await apiPost("/api/orders/cancel", {
        order_number: order.order_number,
        phone: order.phone,
      });
      setOrder((prev) => ({ ...prev, status: "cancelled" }));
    } catch (err) {
      alert(err.message || "Không thể hủy đơn hàng. Vui lòng thử lại.");
    } finally {
      setIsCancelling(false);
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-stone-400" />
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (error || !order) {
    return (
      <main className="pt-16 pb-24 max-w-7xl mx-auto px-6 md:px-12 min-h-screen">
        <Link href="/account/history" className="flex items-center gap-2 mb-12 hover:opacity-60 transition-all w-max">
          <ArrowLeft size={16} />
          <span className="font-label text-xs uppercase tracking-widest font-medium">Trở về Lịch sử đơn hàng</span>
        </Link>
        <div className="text-center py-24 border border-dashed border-stone-200">
          <p className="font-headline text-xl font-bold uppercase tracking-tighter text-black mb-2">Không tìm thấy đơn hàng</p>
          <p className="font-body text-sm text-stone-500">{error}</p>
        </div>
      </main>
    );
  }

  // ─── Dữ liệu ─────────────────────────────────────────────────────────────
  const dateStr = new Date(order.created_at).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  const address = [
    order.customer_name,
    order.shipping_address,
    order.shipping_commune,
    order.shipping_province,
    order.phone,
  ].filter(Boolean).join("\n");

  return (
    <main className="pt-4 lg:pt-8 pb-24 max-w-7xl mx-auto px-6 md:px-12 text-black min-h-screen">

      {/* Nút Quay lại */}
      <Link href="/account/history" className="flex items-center gap-2 mb-12 hover:opacity-60 transition-all w-max group">
        <ArrowLeft size={16} />
        <span className="font-label text-xs uppercase tracking-widest font-medium">Trở về Lịch sử đơn hàng</span>
      </Link>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-stone-200 pb-8">
        <div>
          <h1 className="font-headline text-3xl lg:text-5xl font-extrabold tracking-tighter uppercase mb-4 text-black">
            Chi Tiết Đơn Hàng
          </h1>
          <div className="flex flex-wrap gap-x-8 gap-y-4 items-center">
            <div className="flex flex-col">
              <span className="font-label text-[10px] text-stone-500 uppercase tracking-[0.2em] mb-1">Mã đơn hàng</span>
              <span className="font-headline font-bold text-lg uppercase text-black">{order.order_number}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label text-[10px] text-stone-500 uppercase tracking-[0.2em] mb-1">Ngày đặt</span>
              <span className="font-headline font-bold text-lg text-black">{dateStr}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label text-[10px] text-stone-500 uppercase tracking-[0.2em] mb-1">Trạng thái</span>
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>
      </header>

      {/* Thanh tiến trình */}
      <section className="mb-16 bg-stone-100 p-8 md:p-12">
        <ProgressBar status={order.status} />
        {(order.status === "cancelled" || order.status === "returned") && (
          <p className="font-body text-sm text-center text-red-600 mt-2">
            {STATUS_LABELS[order.status]}
            {order.cancelled_reason ? ` — ${order.cancelled_reason}` : ""}
          </p>
        )}

        {/* Nút hủy đơn — chỉ hiện khi pending */}
        {order.status === "pending" && (
          <div className="mt-8 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="font-body text-xs text-stone-500">
              Đơn hàng chưa được xác nhận. Bạn có thể hủy ngay bây giờ.
            </p>
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="shrink-0 px-6 py-3 border border-red-300 text-red-600 font-headline font-bold text-xs uppercase tracking-widest hover:bg-red-50 hover:border-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCancelling && (
                <span className="inline-block w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
              )}
              {isCancelling ? "Đang hủy..." : "Hủy đơn hàng"}
            </button>
          </div>
        )}
      </section>

      {/* Body: sản phẩm + bill */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* Trái: danh sách sản phẩm */}
        <div className="lg:col-span-8">
          <h3 className="font-headline font-extrabold text-2xl uppercase tracking-tighter mb-8 text-black">
            Đơn hàng gồm ({order.items?.length || 0})
          </h3>

          <div className="space-y-12">
            {order.items?.map((item, i) => (
              <div key={i} className="flex gap-6 sm:gap-8 group">
                {/* Ảnh */}
                <div className="w-24 sm:w-32 md:w-40 aspect-3/4 bg-stone-100 overflow-hidden shrink-0 relative">
                  {item.image_url ? (
                    <Image
                      src={getFullUrl(item.image_url)}
                      alt={item.product_name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 grayscale"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400 text-xs uppercase tracking-widest">
                      No image
                    </div>
                  )}
                </div>

                {/* Thông tin */}
                <div className="flex-1 flex flex-col justify-between py-1 sm:py-2">
                  <div className="flex flex-col xl:flex-row justify-between items-start gap-4">
                    <div>
                      <h4 className="font-headline font-bold text-lg sm:text-xl uppercase tracking-tight mb-2 text-black">
                        {item.product_name}
                      </h4>
                      {item.color_name && (
                        <p className="font-label text-[10px] sm:text-xs text-stone-500 uppercase tracking-widest mb-1">
                          Màu: {item.color_name}
                        </p>
                      )}
                      {item.size && (
                        <p className="font-label text-[10px] sm:text-xs text-stone-500 uppercase tracking-widest">
                          Size: {item.size}
                        </p>
                      )}
                    </div>
                    <span className="font-headline font-bold text-lg sm:text-xl text-black shrink-0">
                      {Number(item.unit_price).toLocaleString("vi-VN")} đ
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-6">
                    <span className="font-label text-[10px] uppercase tracking-widest text-stone-500">
                      Số lượng: {item.quantity}
                    </span>
                    <span className="font-label text-[10px] uppercase tracking-widest text-stone-400">
                      Thành tiền: {(Number(item.unit_price) * item.quantity).toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phải: địa chỉ + bill */}
        <div className="lg:col-span-4 space-y-8">

          {/* Địa chỉ */}
          <div className="bg-white ring-1 ring-black/5 shadow-sm p-8 lg:p-10">
            <h3 className="font-headline font-extrabold text-lg uppercase tracking-tighter mb-6 text-black">
              Địa chỉ nhận hàng
            </h3>
            <p className="font-body text-sm leading-relaxed text-stone-600 whitespace-pre-line">
              {address}
            </p>

            <div className="mt-8 pt-6 border-t border-stone-200">
              <h3 className="font-headline font-extrabold text-base uppercase tracking-tighter mb-3 text-black">
                Phương thức thanh toán
              </h3>
              <p className="font-body text-sm text-black uppercase">{order.payment_method}</p>
            </div>
          </div>

          {/* Bill */}
          <div className="bg-black text-white p-8 lg:p-10 shadow-lg">
            <h3 className="font-headline font-extrabold text-lg uppercase tracking-tighter mb-8">Hóa đơn</h3>
            <div className="space-y-5 mb-8">
              <div className="flex justify-between font-label text-[10px] uppercase tracking-widest text-stone-300">
                <span>Cộng gộp</span>
                <span>{Number(order.subtotal).toLocaleString("vi-VN")} đ</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between font-label text-[10px] uppercase tracking-widest text-stone-300">
                  <span>Giảm giá</span>
                  <span className="text-emerald-400">-{Number(order.discount_amount).toLocaleString("vi-VN")} đ</span>
                </div>
              )}
              <div className="flex justify-between font-label text-[10px] uppercase tracking-widest text-stone-300">
                <span>Phí giao hàng</span>
                <span>{Number(order.shipping_fee) === 0 ? "Miễn phí" : `${Number(order.shipping_fee).toLocaleString("vi-VN")} đ`}</span>
              </div>
            </div>
            <div className="pt-6 border-t border-white/20 flex justify-between items-end">
              <span className="font-headline font-extrabold text-lg uppercase tracking-widest">Tổng tiền</span>
              <span className="font-headline font-extrabold text-3xl md:text-2xl xl:text-3xl">
                {Number(order.total_amount).toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>

          {/* Hỗ trợ */}
          <div className="p-1 border border-stone-200 hover:border-black transition-colors">
            <div className="p-6 lg:p-8 bg-stone-100 flex items-center gap-4 cursor-pointer hover:bg-stone-200 transition-colors">
              <Headset size={32} className="text-black shrink-0" />
              <div>
                <p className="font-headline font-bold text-sm uppercase text-black">Cần hỗ trợ?</p>
                <p className="font-label text-[10px] uppercase tracking-widest text-stone-500 mt-1">Liên hệ CSKH 24/7</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
