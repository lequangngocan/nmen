"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Package, ChevronRight } from "lucide-react";
import { apiGet, apiPost, getFullUrl } from "@/lib/api";

// ─── Màu trạng thái ───────────────────────────────────────────────────────────
const STATUS_STYLE = {
  pending:    { label: "Chờ xác nhận",  bg: "bg-yellow-100",  text: "text-yellow-700" },
  confirmed:  { label: "Đã xác nhận",   bg: "bg-blue-50",     text: "text-blue-700"   },
  processing: { label: "Đang xử lý",    bg: "bg-indigo-50",   text: "text-indigo-700" },
  shipping:   { label: "Đang giao",     bg: "bg-orange-50",   text: "text-orange-700" },
  delivered:  { label: "Đã giao",       bg: "bg-emerald-50",  text: "text-emerald-700"},
  cancelled:  { label: "Đã hủy",        bg: "bg-red-50",      text: "text-red-600"    },
  returned:   { label: "Trả hàng",      bg: "bg-stone-100",   text: "text-stone-600"  },
};

// ─── Thanh timeline ───────────────────────────────────────────────────────────
const STEPS = ["pending", "confirmed", "processing", "shipping", "delivered"];
const STEP_LABELS = {
  pending:    "Chờ xác nhận",
  confirmed:  "Đã xác nhận",
  processing: "Đang xử lý",
  shipping:   "Đang giao hàng",
  delivered:  "Đã giao",
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { label: status, bg: "bg-stone-100", text: "text-stone-600" };
  return (
    <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function ProgressBar({ status }) {
  const idx = STEPS.indexOf(status);
  const isCancelled = status === "cancelled" || status === "returned";
  if (isCancelled) return null;

  return (
    <div className="mt-10 mb-2">
      <div className="relative flex justify-between items-center">
        {/* Nền xám */}
        <div className="absolute top-4 left-0 w-full h-[2px] bg-stone-200 z-0" />
        {/* Tiến trình đen */}
        <div
          className="absolute top-4 left-0 h-[2px] bg-black z-0 transition-all duration-500"
          style={{ width: idx < 0 ? "0%" : `${(idx / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((step, i) => {
          const done = i <= idx;
          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-2 flex-1 first:items-start last:items-end">
              <div className={`w-8 h-8 flex items-center justify-center border-2 transition-all
                ${done ? "bg-black border-black" : "bg-white border-stone-300"}`}>
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-stone-300" />
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
    </div>
  );
}

function OrderLookupContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [order, setOrder]             = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Pre-fill mã đơn và SĐT nếu được truyền qua URL
  useEffect(() => {
    const fromUrlOrder = searchParams.get("order_number");
    const fromUrlPhone = searchParams.get("phone");
    if (fromUrlOrder) setOrderNumber(fromUrlOrder);
    if (fromUrlPhone) setPhone(fromUrlPhone);
  }, [searchParams]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError("Vui lòng nhập đầy đủ mã đơn hàng và số điện thoại.");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const data = await apiGet(
        `/api/orders/lookup?order_number=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );
      setOrder(data);
    } catch (err) {
      setError(err?.message || "Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn và số điện thoại đã dùng khi đặt hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.")) return;
    setIsCancelling(true);
    try {
      await apiPost("/api/orders/cancel", {
        order_number: order.order_number,
        phone: phone.trim(),
      });
      setOrder((prev) => ({ ...prev, status: "cancelled", status_label: "Đã hủy" }));
    } catch (err) {
      alert(err.message || "Không thể hủy đơn hàng. Vui lòng thử lại.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="pt-4 lg:pt-8 pb-24 px-6 lg:px-12 max-w-[1440px] mx-auto min-h-screen">

      {/* ─── Header ─────────────────────────────────────────────────── */}
      <header className="mb-12 lg:mb-20">
        <h1 className="font-headline text-3xl lg:text-5xl font-extrabold tracking-tighter uppercase mb-4 text-black">
          Tra cứu đơn hàng
        </h1>
        <p className="font-body text-sm text-stone-500 uppercase tracking-widest">
          Nhập mã đơn và email để kiểm tra trạng thái
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

        {/* ─── Form tra cứu (trái) ─────────────────────────────────── */}
        <div className="lg:col-span-5">
          <div className="bg-white p-8 lg:p-10 ring-1 ring-black/5 shadow-sm">
            <form onSubmit={handleSearch} className="space-y-8">
              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">
                  Mã đơn hàng <span className="text-black">*</span>
                </label>
                <input
                  type="text"
                  id="order-number"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="VD: NM-12345"
                  className="w-full bg-transparent border-b border-stone-300 focus:border-black px-0 py-3 transition-colors focus:ring-0 outline-none placeholder:text-stone-300 text-black font-body text-sm"
                />
              </div>

              <div>
                <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">
                  Số điện thoại đặt hàng <span className="text-black">*</span>
                </label>
                <input
                  type="tel"
                  id="lookup-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0912345678"
                  className="w-full bg-transparent border-b border-stone-300 focus:border-black px-0 py-3 transition-colors focus:ring-0 outline-none placeholder:text-stone-300 text-black font-body text-sm"
                />
              </div>

              {error && (
                <p className="font-body text-sm text-red-600 bg-red-50 px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                id="lookup-submit"
                disabled={loading}
                className="w-full bg-black text-white py-5 font-headline font-bold uppercase tracking-widest text-sm hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search size={16} />
                )}
                {loading ? "Đang tìm..." : "Tra cứu"}
              </button>
            </form>

            {/* Gợi ý */}
            <div className="mt-10 pt-8 border-t border-stone-100 space-y-3">
              <p className="font-label text-[10px] uppercase tracking-widest text-stone-400">Lưu ý</p>
              <ul className="space-y-2 font-body text-xs text-stone-500">
                <li className="flex items-start gap-2">
                  <ChevronRight size={12} className="mt-0.5 shrink-0" />
                  Mã đơn hàng có dạng <strong className="text-black">NM-XXXXX</strong>, được gửi qua email xác nhận.
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight size={12} className="mt-0.5 shrink-0" />
                  Nhập đúng số điện thoại bạn đã dùng khi đặt hàng.
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight size={12} className="mt-0.5 shrink-0" />
                  Nếu có tài khoản, hãy <Link href="/login" className="text-black underline underline-offset-2">đăng nhập</Link> để xem toàn bộ lịch sử đơn hàng.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ─── Kết quả (phải) ──────────────────────────────────────── */}
        <div className="lg:col-span-7">
          {/* Trạng thái chờ */}
          {!order && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-stone-200">
              <Package size={48} strokeWidth={1} className="text-stone-300 mb-6" />
              <p className="font-headline text-lg font-bold uppercase tracking-tighter text-stone-300">Kết quả hiển thị tại đây</p>
              <p className="font-body text-xs text-stone-400 mt-2">Nhập thông tin và nhấn tra cứu</p>
            </div>
          )}

          {/* Không tìm thấy */}
          {!order && !loading && error && (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-stone-200 bg-stone-50">
              <span className="text-4xl mb-6">🔍</span>
              <p className="font-headline text-xl font-bold uppercase tracking-tighter text-black mb-2">Không tìm thấy đơn hàng</p>
              <p className="font-body text-sm text-stone-500 max-w-xs leading-relaxed">{error}</p>
            </div>
          )}

          {order && (
            <div className="space-y-8 animate-in fade-in duration-300">

              {/* Thẻ trạng thái */}
              <div className="bg-white ring-1 ring-black/5 shadow-sm p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-stone-400 mb-1">Mã đơn hàng</p>
                    <p className="font-headline font-bold text-2xl tracking-tight text-black">{order.order_number}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-stone-400 mb-1">Ngày đặt</p>
                    <p className="font-body text-black">
                      {new Date(order.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </p>
                  </div>
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-stone-400 mb-1">Khách hàng</p>
                    <p className="font-body text-black">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-stone-400 mb-1">Thanh toán</p>
                    <p className="font-body text-black uppercase">{order.payment_method}</p>
                  </div>
                  <div className="col-span-2 md:col-span-3">
                    <p className="font-label text-[10px] uppercase tracking-widest text-stone-400 mb-1">Địa chỉ nhận hàng</p>
                    <p className="font-body text-black text-sm leading-relaxed">
                      {[order.shipping_address, order.shipping_commune, order.shipping_province].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>

                {/* Thanh tiến trình */}
                <ProgressBar status={order.status} />

                {/* Nút hủy đơn — chỉ hiện khi pending */}
                {order.status === "pending" && (
                  <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between gap-4">
                    <p className="font-body text-xs text-stone-500">
                      Đơn hàng chưa được xác nhận. Bạn có thể hủy ngay bây giờ.
                    </p>
                    <button
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="shrink-0 px-6 py-3 border border-red-300 text-red-600 font-headline font-bold text-xs uppercase tracking-widest hover:bg-red-50 hover:border-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isCancelling && <span className="inline-block w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />}
                      {isCancelling ? "Đang hủy..." : "Hủy đơn hàng"}
                    </button>
                  </div>
                )}
              </div>

              {/* Danh sách sản phẩm */}
              <div className="bg-white ring-1 ring-black/5 shadow-sm p-8">
                <h2 className="font-headline text-lg font-bold uppercase tracking-tight text-black mb-8">
                  Sản phẩm ({order.items?.length || 0})
                </h2>
                <div className="space-y-6 divide-y divide-stone-100">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex gap-5 pt-6 first:pt-0">
                      <div className="w-16 h-20 bg-stone-100 overflow-hidden shrink-0 relative flex items-center justify-center">
                        {item.image_url
                          ? <Image src={getFullUrl(item.image_url)} alt={item.product_name} fill className="object-cover grayscale" unoptimized />
                          : <Package size={24} className="text-stone-400" />
                        }
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-headline font-bold text-sm uppercase text-black">{item.product_name}</p>
                          <p className="font-label text-[10px] uppercase tracking-widest text-stone-500 mt-1">
                            {item.size && `Size: ${item.size}`}
                            {item.color_name && ` · ${item.color_name}`}
                            {` · SL: ${item.quantity}`}
                          </p>
                        </div>
                        <p className="font-headline font-bold text-sm text-black mt-2">
                          {(item.unit_price * item.quantity).toLocaleString("vi-VN")} đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng bill */}
              <div className="bg-black text-white p-8">
                <h2 className="font-headline text-lg font-bold uppercase tracking-tight mb-6">Hóa đơn</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between font-label text-[10px] uppercase tracking-widest text-stone-400">
                    <span>Cộng gộp</span>
                    <span className="text-white">{Number(order.subtotal).toLocaleString("vi-VN")} đ</span>
                  </div>
                  {Number(order.discount_amount) > 0 && (
                    <div className="flex justify-between font-label text-[10px] uppercase tracking-widest text-stone-400">
                      <span>Giảm giá</span>
                      <span className="text-emerald-400">-{Number(order.discount_amount).toLocaleString("vi-VN")} đ</span>
                    </div>
                  )}
                  <div className="flex justify-between font-label text-[10px] uppercase tracking-widest text-stone-400">
                    <span>Giao hàng</span>
                    <span className="font-bold text-white">{Number(order.shipping_fee) === 0 ? "Miễn phí" : `${Number(order.shipping_fee).toLocaleString("vi-VN")} đ`}</span>
                  </div>
                </div>
                <div className="border-t border-white/20 pt-6 flex justify-between items-end">
                  <span className="font-headline font-extrabold text-sm uppercase tracking-widest">Tổng cộng</span>
                  <span className="font-headline font-extrabold text-2xl">{Number(order.total_amount).toLocaleString("vi-VN")} đ</span>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderLookupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <OrderLookupContent />
    </Suspense>
  );
}
