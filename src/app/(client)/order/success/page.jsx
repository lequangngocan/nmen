"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle, Package, ArrowRight, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

function SuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order") || "";
  const total = params.get("total") ? Number(params.get("total")) : null;
  const phone = params.get("phone") || "";
  const { user, mounted: authMounted } = useAuth();
  const isLoggedIn = authMounted && !!user;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle size={48} className="text-emerald-500" strokeWidth={1.5} />
            </div>
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 animate-ping opacity-40" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter uppercase text-black mb-3">
          Đặt Hàng<br />Thành Công!
        </h1>
        <p className="font-body text-stone-500 text-sm mt-2">
          Cảm ơn bạn đã mua sắm tại <span className="font-semibold text-black">NMen</span>.
          Chúng tôi sẽ xử lý đơn hàng ngay.
        </p>

        {/* Order info */}
        {orderNumber && (
          <div className="mt-10 border border-stone-200 bg-stone-50 px-8 py-6 text-left space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-label text-[10px] uppercase tracking-widest text-stone-400">Mã đơn hàng</span>
              <span className="font-headline font-bold text-black tracking-tight">{orderNumber}</span>
            </div>
            {total !== null && (
              <div className="flex justify-between items-center">
                <span className="font-label text-[10px] uppercase tracking-widest text-stone-400">Tổng thanh toán</span>
                <span className="font-headline font-bold text-black">{total.toLocaleString("vi-VN")} đ</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-label text-[10px] uppercase tracking-widest text-stone-400">Trạng thái</span>
              <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-yellow-100 text-yellow-700">
                Chờ xác nhận
              </span>
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="mt-10 flex justify-center gap-6 text-center">
          {[
            { icon: "📦", label: "Xác nhận" },
            { icon: "🏭", label: "Đóng gói" },
            { icon: "🚚", label: "Giao hàng" },
            { icon: "✅", label: "Hoàn thành" },
          ].map((step, i, arr) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <span className="text-xl">{step.icon}</span>
                <span className="text-[9px] font-label uppercase tracking-widest text-stone-400 mt-1">{step.label}</span>
              </div>
              {i < arr.length - 1 && (
                <ArrowRight size={12} className="text-stone-300 -mt-3" />
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <Link
            href="/all"
            className="bg-black text-white px-8 py-4 font-headline font-bold uppercase tracking-[0.15em] text-sm hover:bg-stone-800 transition-all"
          >
            Tiếp tục mua sắm
          </Link>
          {isLoggedIn && (
            <Link
              href="/account/history"
              className="border border-black text-black px-8 py-4 font-headline font-bold uppercase tracking-[0.15em] text-sm hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
            >
              <Package size={14} />
              Lịch sử đơn hàng
            </Link>
          )}
          {orderNumber && (
            <Link
              href={`/order/lookup?order_number=${encodeURIComponent(orderNumber)}${phone ? `&phone=${encodeURIComponent(phone)}` : ``}`}
              className="border border-stone-300 text-stone-600 px-8 py-4 font-headline font-bold uppercase tracking-[0.15em] text-sm hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
            >
              <Search size={14} />
              Tra cứu đơn hàng
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <SuccessContent />
    </Suspense>
  );
}
