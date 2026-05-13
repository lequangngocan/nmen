"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import Link from "next/link";
import { XCircle, ArrowLeft, Package, List } from "lucide-react";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

function FailedContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order");
  const phone = params.get("phone") || "";
  const { user, mounted: authMounted } = useAuth();
  const isLoggedIn = authMounted && !!user;

  useEffect(() => {
    if (orderNumber) {
      apiPost('/api/orders/verify-sepay', { order_number: orderNumber, status: 'failed' }).catch(console.error);
    }
  }, [orderNumber]);

  // Nếu đã đăng nhập → danh sách đơn hàng, khách → tra cứu đơn
  const orderUrl = isLoggedIn
    ? "/account/history"
    : orderNumber
      ? `/order/lookup?order_number=${encodeURIComponent(orderNumber)}${phone ? `&phone=${encodeURIComponent(phone)}` : ""}`
      : "/order/lookup";

  const orderLabel = isLoggedIn ? "Xem Lịch Sử Đơn Hàng" : "Xem Chi Tiết Đơn Hàng";
  const OrderIcon = isLoggedIn ? List : Package;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle size={48} className="text-red-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter uppercase text-black mb-3">
          Thanh Toán<br />Thất Bại
        </h1>
        <p className="font-body text-stone-500 text-sm mt-4">
          Giao dịch của bạn đã bị hủy hoặc gặp sự cố trong quá trình thanh toán.
          Đơn hàng đã được <span className="font-semibold text-red-600">tự động hủy</span> và tồn kho đã được hoàn trả.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col gap-3">
          <Link
            href={orderUrl}
            className="w-full bg-black text-white px-8 py-4 font-headline font-bold uppercase tracking-widest text-sm hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
          >
            <OrderIcon size={16} /> {orderLabel}
          </Link>
          <Link
            href="/"
            className="w-full bg-stone-100 text-stone-600 px-8 py-4 font-headline font-bold uppercase tracking-widest text-sm hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Về Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <FailedContent />
    </Suspense>
  );
}
