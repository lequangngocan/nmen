"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { mounted, user } = useAuth();

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      setLoading(false);
      return;
    }

    apiGet("/api/orders/my")
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [mounted, user]);

  const renderStatusBadge = (status) => {
    switch (status) {
      case "Chờ xác nhận":
      case "Đang xử lý":
        return <span className="inline-flex items-center px-3 py-1 bg-stone-200 text-black text-[10px] font-bold uppercase tracking-widest">{status}</span>;
      case "Đang giao":
        return <span className="inline-flex items-center px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest">{status}</span>;
      case "Hoàn thành":
      case "Đã giao":
        return <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest">{status}</span>;
      case "Đã hủy":
        return <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-widest">{status}</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-widest">{status}</span>;
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 font-headline uppercase tracking-widest text-stone-500">
        Vui lòng đăng nhập để xem lịch sử đơn hàng.
      </div>
    );
  }

  return (
    <section>
      <header className="mb-10 lg:mb-16">
        <h1 className="font-headline text-4xl mt-3 lg:text-5xl font-black tracking-tighter uppercase mb-4 text-black">Lịch sử Đơn hàng</h1>
        <p className="font-body text-stone-500 max-w-xl text-sm lg:text-base leading-relaxed">
          Theo dõi các giao dịch mua gần đây, tải xuống hóa đơn và quản lý các yêu cầu đổi trả.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 border border-stone-200">
          <p className="font-body text-stone-500 uppercase tracking-widest text-xs">Bạn chưa có đơn hàng nào.</p>
          <Link href="/clothing" className="inline-block mt-6 px-6 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="space-y-4 lg:space-y-6">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 pb-4 border-b border-stone-300">
            <div className="col-span-2 font-headline text-[10px] font-black uppercase tracking-widest text-stone-400">Mã Đơn hàng</div>
            <div className="col-span-3 font-headline text-[10px] font-black uppercase tracking-widest text-stone-400">Ngày đặt</div>
            <div className="col-span-3 font-headline text-[10px] font-black uppercase tracking-widest text-stone-400">Trạng thái</div>
            <div className="col-span-2 font-headline text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">Tổng tiền</div>
            <div className="col-span-2"></div>
          </div>

          {orders.map((order) => {
            const dateStr = new Date(order.created_at).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit"
            });
            return (
              <div 
                key={order.id} 
                className="grid grid-cols-2 md:grid-cols-12 items-center gap-y-6 gap-x-4 p-6 bg-white shadow-sm ring-1 ring-stone-100 hover:bg-stone-50 transition-colors group cursor-default"
              >
                <div className="col-span-2 md:col-span-2 font-label text-sm font-bold text-black order-1">
                  #{order.order_number}
                </div>
                
                <div className="col-span-2 md:col-span-2 font-label text-sm font-bold md:text-right text-black order-2 md:order-4 text-right">
                  {Number(order.total_amount).toLocaleString("vi-VN")} đ
                </div>

                <div className="col-span-2 md:col-span-3 font-body text-sm text-stone-500 order-3 md:order-2">
                  {dateStr}
                </div>
                
                <div className="col-span-1 md:col-span-3 order-4 md:order-3">
                  {renderStatusBadge(order.status)}
                </div>

                <div className="col-span-1 md:col-span-2 flex justify-end gap-4 order-5">
                  <Link 
                    href={`/order/${order.id}`}
                    className="font-headline text-[10px] font-bold uppercase tracking-widest text-black border-b border-transparent hover:border-black transition-all"
                  >
                    Chi tiết
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-16 lg:mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-[16/10] md:aspect-[16/7] overflow-hidden group cursor-pointer bg-stone-200">
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-10"></div>
          <Image 
            src="/images/img_1e7d26f8.jpg" 
            alt="The Winter Vault"
            fill
            className="absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end text-white">
            <p className="font-headline text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-stone-300">Phiên Bản Giới Hạn</p>
            <h3 className="font-headline text-2xl font-black uppercase tracking-tight">Bộ Sưu Tập Mùa Đông</h3>
          </div>
        </div>

        <div className="p-10 lg:p-12 bg-black text-white flex flex-col justify-center shadow-lg">
          <h3 className="font-headline text-3xl font-black uppercase tracking-tight mb-4">Dịch vụ chăm sóc</h3>
          <p className="font-body text-sm text-stone-400 mb-8 max-w-xs leading-relaxed">
            Bạn cần trả lại sản phẩm? Dịch vụ chăm sóc tận tình của chúng tôi sẽ hỗ trợ đổi trả một cách dễ dàng.
          </p>
          <button className="w-fit font-headline text-xs font-bold uppercase tracking-widest border-b-[1px] border-white pb-1 hover:text-stone-300 hover:border-stone-300 transition-all">
            Yêu cầu hỗ trợ
          </button>
        </div>
      </div>
    </section>
  );
}
