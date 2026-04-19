"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Phone, Mail, MapPin, Package, CreditCard, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import { ADMIN_ORDERS } from "@/constants/admin-data";

// Cấu hình các bước tiến trình đơn hàng
const STATUS_STEPS = [
  { key: "Chờ xác nhận", icon: Clock, label: "Chờ xác nhận" },
  { key: "Đang giao", icon: Truck, label: "Đang giao" },
  { key: "Đã giao", icon: CheckCircle, label: "Đã giao" },
];

// Các trạng thái có thể cập nhật
const STATUS_OPTIONS = ["Chờ xác nhận", "Đang giao", "Đã giao", "Đã hủy"];

function StatusBadge({ status }) {
  const map = {
    "Chờ xác nhận": "bg-yellow-100 text-yellow-700 border border-yellow-200",
    "Đang giao":    "bg-blue-100 text-blue-700 border border-blue-200",
    "Đã giao":      "bg-green-100 text-green-700 border border-green-200",
    "Đã hủy":       "bg-red-100 text-red-700 border border-red-200",
  };
  return (
    <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm ${map[status] || "bg-stone-100 text-stone-600"}`}>
      {status}
    </span>
  );
}

// Timeline tiến trình đơn hàng
function OrderTimeline({ status }) {
  if (status === "Đã hủy") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-sm">
        <XCircle size={20} className="text-red-500 shrink-0" />
        <span className="text-sm text-red-700 font-medium">Đơn hàng này đã bị hủy</span>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-start gap-0">
      {STATUS_STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isDone = idx <= currentIdx;
        const isLast = idx === STATUS_STEPS.length - 1;

        return (
          <div key={step.key} className="flex items-center flex-1">
            {/* Bước */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isDone
                    ? "bg-black border-black text-white"
                    : "bg-white border-stone-300 text-stone-400"
                }`}
              >
                <Icon size={16} />
              </div>
              <span className={`text-[10px] font-label uppercase tracking-widest whitespace-nowrap ${isDone ? "text-black font-bold" : "text-stone-400"}`}>
                {step.label}
              </span>
            </div>
            {/* Đường kẻ nối */}
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 ${idx < currentIdx ? "bg-black" : "bg-stone-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.id;
  const order = ADMIN_ORDERS.find((o) => o.id === orderId);

  const [currentStatus, setCurrentStatus] = useState(order?.status || "");
  const [note, setNote] = useState("");

  const handleUpdateStatus = () => {
    alert(`Đã cập nhật trạng thái: "${currentStatus}" (Demo)`);
  };

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500 text-lg mb-4">Không tìm thấy đơn hàng #{orderId}.</p>
        <Link href="/admin/orders" className="text-black underline underline-offset-4 text-sm font-label uppercase tracking-widest">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-8">
        <Link
          href="/admin/orders"
          className="flex items-center gap-2 text-stone-500 hover:text-black transition-colors text-sm font-label uppercase tracking-widest mb-4"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-stone-500 mb-1">Mã đơn hàng</p>
            <h1 className="font-headline text-3xl font-black tracking-tight uppercase text-black">
              #{order.id}
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={currentStatus} />
            <p className="text-stone-400 text-xs">Đặt ngày {order.date}</p>
          </div>
        </div>
      </div>

      {/* ── Timeline trạng thái ── */}
      <div className="bg-white border border-stone-100 shadow-sm p-6 mb-6">
        <OrderTimeline status={currentStatus} />
      </div>

      {/* ── Nội dung chính ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Cột trái (2/3): Sản phẩm + Tóm tắt thanh toán */}
        <div className="lg:col-span-2 space-y-6">

          {/* Danh sách sản phẩm */}
          <div className="bg-white border border-stone-100 shadow-sm">
            <div className="flex items-center gap-2 p-5 border-b border-stone-100">
              <Package size={16} className="text-stone-500" />
              <h2 className="font-headline text-base font-bold uppercase tracking-tight text-black">
                Sản phẩm ({order.items.length})
              </h2>
            </div>

            <div className="divide-y divide-stone-50">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 px-5 py-4">
                  {/* Icon sản phẩm */}
                  <div className="w-12 h-16 bg-stone-100 flex items-center justify-center shrink-0">
                    <Package size={20} className="text-stone-400" />
                  </div>

                  {/* Thông tin */}
                  <div className="flex-1 min-w-0">
                    <p className="font-label font-bold text-black text-sm truncate">{item.name}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="font-label text-[10px] uppercase tracking-widest text-stone-500 border border-stone-200 px-2 py-0.5">
                        Size: {item.size}
                      </span>
                      <span className="font-label text-[10px] uppercase tracking-widest text-stone-500">
                        SL: {item.qty}
                      </span>
                    </div>
                  </div>

                  {/* Giá */}
                  <p className="font-label font-bold text-black shrink-0">
                    {item.price.toLocaleString("vi-VN")} đ
                  </p>
                </div>
              ))}
            </div>

            {/* Tổng cộng */}
            <div className="bg-stone-50 px-5 py-4 border-t border-stone-100">
              <div className="flex justify-between items-center text-sm text-stone-500 mb-2">
                <span>Tạm tính</span>
                <span>{order.total.toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between items-center text-sm text-stone-500 mb-3">
                <span>Phí vận chuyển</span>
                <span className="text-green-600 font-medium">Miễn phí</span>
              </div>
              <div className="flex justify-between items-center font-headline font-black text-black text-lg border-t border-stone-200 pt-3">
                <span className="uppercase tracking-tight">Tổng cộng</span>
                <span>{order.total.toLocaleString("vi-VN")} đ</span>
              </div>
            </div>
          </div>

          {/* Thông tin thanh toán */}
          <div className="bg-white border border-stone-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-3">
              <CreditCard size={16} className="text-stone-500" />
              <h2 className="font-headline text-base font-bold uppercase tracking-tight text-black">
                Thanh toán
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-stone-500 mb-1">Phương thức</p>
                <p className="font-label font-bold text-black">{order.payment}</p>
              </div>
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-stone-500 mb-1">Trạng thái</p>
                <p className="font-label font-bold text-green-600">Đã thanh toán</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải (1/3): Khách hàng + Cập nhật */}
        <div className="space-y-6">

          {/* Thông tin khách hàng */}
          <div className="bg-white border border-stone-100 shadow-sm p-5">
            <h2 className="font-headline text-base font-bold uppercase tracking-tight text-black border-b border-stone-100 pb-3 mb-4">
              Khách hàng
            </h2>

            <div className="space-y-4">
              {/* Tên */}
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-stone-400 mb-1">Họ tên</p>
                <p className="font-label font-bold text-black">{order.customer}</p>
              </div>

              {/* Liên hệ */}
              <div className="space-y-2">
                <a
                  href={`mailto:${order.email}`}
                  className="flex items-center gap-2 text-sm text-stone-600 hover:text-black transition-colors"
                >
                  <Mail size={14} className="text-stone-400 shrink-0" />
                  {order.email}
                </a>
                <a
                  href={`tel:${order.phone}`}
                  className="flex items-center gap-2 text-sm text-stone-600 hover:text-black transition-colors"
                >
                  <Phone size={14} className="text-stone-400 shrink-0" />
                  {order.phone}
                </a>
              </div>

              {/* Địa chỉ */}
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-stone-400 mb-1">Địa chỉ giao hàng</p>
                <div className="flex gap-2">
                  <MapPin size={14} className="text-stone-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-stone-600 leading-relaxed">{order.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cập nhật trạng thái */}
          <div className="bg-white border border-stone-100 shadow-sm p-5">
            <h2 className="font-headline text-base font-bold uppercase tracking-tight text-black border-b border-stone-100 pb-3 mb-4">
              Cập nhật trạng thái
            </h2>

            <div className="space-y-2 mb-4">
              {STATUS_OPTIONS.map((status) => (
                <label
                  key={status}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer border transition-colors rounded-sm ${
                    currentStatus === status
                      ? "border-black bg-stone-50"
                      : "border-transparent hover:border-stone-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={currentStatus === status}
                    onChange={(e) => setCurrentStatus(e.target.value)}
                    className="accent-black"
                  />
                  <span className="text-sm text-black">{status}</span>
                </label>
              ))}
            </div>

            {/* Ghi chú nội bộ */}
            <div className="mb-4">
              <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">
                Ghi chú nội bộ
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Ghi chú cho nội bộ (khách không thấy)..."
                className="w-full border border-stone-200 focus:border-black bg-white px-3 py-2 outline-none text-black text-sm resize-none transition-colors"
              />
            </div>

            <button
              onClick={handleUpdateStatus}
              className="w-full bg-black text-white py-3 font-bold uppercase tracking-widest text-sm hover:bg-stone-800 transition-all active:scale-95"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
