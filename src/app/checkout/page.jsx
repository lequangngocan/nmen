"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";

// 1. Dữ liệu cứng - giả lập đơn hàng đang checkout (sinh viên dùng cách này cho nhanh)
const ORDER_ITEMS = [
  {
    id: "o1",
    name: "Áo khoác dài Obsidian",
    size: "48",
    qty: 1,
    price: 21250000,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiEX7hOXIP5ehb_f66k_cMtMhopr14KSPsOUBKNCvN0kOe5D6WgQe0RvoVvZVg6DB4lvHsxHVyfSEGkxjA6k-Oxf4Klf2aPeMAZdzJWKjiHK8xw8oacy3iR_LUgjHqLIK4izbNaiguFJRB3rjoOl4bNJFsTksC4IQm6Vf-hQSh4mWsqN0v5rM9KBkAepQ_mz-EVoonODM1ZcKmqmEyO2n-tCvmPt_WKVjPgHciuj-EsbALjGz6C5oQ17O-XQ0MqSYWL8QhlYE4tg"
  },
  {
    id: "o2",
    name: "Áo len Anthracite",
    size: "M",
    qty: 1,
    price: 7375000,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvMfzGXSv2MoPKdK1yXYX4Vg5fIVVU86ghyvCEyUdthclDO_cx3MnfzMMjA46bDgQQTnUr0yBTDIr4ICWV2W4VxILczrKZzHG3J2pUDVwEmFKasT_t6YO_yqWo2V0hG_eprPd0ejhbENYqhgjrXAUOPwmdmp0_9G1GCLr9xIY7X8oPjaNE9Lvq4RX_7Iez3z8dfvpOGKLrknF_g35Kr57btf-yCcsO-VLdZSCKyZVBax7ffu-CRM5D7rT6Wp7SXONK6lZ36Hfd3w"
  }
];

// 2. Các phương thức thanh toán
const PAYMENT_METHODS = ["COD", "Sepay"];

export default function CheckoutPage() {
  // state lưu phương thức thanh toán đang chọn
  const [selectedPayment, setSelectedPayment] = useState("COD");

  // state lưu các ô input form địa chỉ
  const [shippingForm, setShippingForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: ""
  });



  // state lưu mã giảm giá
  const [promoCode, setPromoCode] = useState("");

  // Tính tiền tổng đơn hàng
  const subtotal = ORDER_ITEMS.reduce((total, item) => total + item.price * item.qty, 0);
  const total = subtotal; // ship free

  // hàm cập nhật form địa chỉ khi gõ
  const handleShippingChange = (e) => {
    // lấy tên field và giá trị vừa gõ để đưa vào State
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    setShippingForm({ ...shippingForm, [fieldName]: fieldValue });
  };

  // hàm xử lý khi bấm Confirm Purchase
  const handleConfirm = (e) => {
    e.preventDefault(); // chặn reload trang - kinh điển
    alert("Đặt hàng thành công! Cảm ơn bạn đã mua hàng tại NMen. (Chức năng đang demo)");
  };

  return (
    <div className="pt-4 lg:pt-8 pb-24 px-6 md:px-12 max-w-7xl mx-auto">

      {/* Tiêu đề trang Checkout */}
      <div className="mb-12 lg:mb-20">
        <h1 className="font-headline text-4xl md:text-7xl font-extrabold tracking-tighter uppercase text-black">Thanh Toán</h1>
        <p className="font-body text-stone-500 mt-4 uppercase tracking-widest text-xs flex items-center gap-2">
          <Lock size={12} /> Cổng Giao Dịch An Toàn
        </p>
      </div>

      {/* Bố cục 2 cột: trái là form, phải là tóm tắt đơn hàng */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

        {/* CỘT TRÁI: CÁC FORM NHẬP LIỆU */}
        <div className="lg:col-span-7 space-y-16 lg:space-y-24">

          {/* BỘ PHẬN 01: Form Địa chỉ giao hàng */}
          <section>
            <div className="flex items-center space-x-4 mb-10">
              <span className="font-headline text-2xl font-black text-black">01</span>
              <h2 className="font-headline text-xl lg:text-2xl font-bold uppercase tracking-tight text-black">Địa Chỉ Nhận Hàng</h2>
            </div>

            {/* form nhập địa chỉ 2 cột */}
            <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-1">
                <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Tên</label>
                <input
                  type="text"
                  name="firstName"
                  value={shippingForm.firstName}
                  onChange={handleShippingChange}
                  placeholder="VD: Tuấn"
                  className="w-full bg-transparent border-b border-stone-300 focus:border-black border-t-0 border-l-0 border-r-0 px-0 py-3 transition-colors focus:ring-0 outline-none placeholder:text-stone-300 text-black"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Họ</label>
                <input
                  type="text"
                  name="lastName"
                  value={shippingForm.lastName}
                  onChange={handleShippingChange}
                  placeholder="VD: Nguyễn"
                  className="w-full bg-transparent border-b border-stone-300 focus:border-black border-t-0 border-l-0 border-r-0 px-0 py-3 transition-colors focus:ring-0 outline-none placeholder:text-stone-300 text-black"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={shippingForm.address}
                  onChange={handleShippingChange}
                  placeholder="Số nhà, tên đường"
                  className="w-full bg-transparent border-b border-stone-300 focus:border-black border-t-0 border-l-0 border-r-0 px-0 py-3 transition-colors focus:ring-0 outline-none placeholder:text-stone-300 text-black"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Thành phố</label>
                <input
                  type="text"
                  name="city"
                  value={shippingForm.city}
                  onChange={handleShippingChange}
                  className="w-full bg-transparent border-b border-stone-300 focus:border-black border-t-0 border-l-0 border-r-0 px-0 py-3 transition-colors focus:ring-0 outline-none placeholder:text-stone-300 text-black"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">Mã bưu điện</label>
                <input
                  type="text"
                  name="postalCode"
                  value={shippingForm.postalCode}
                  onChange={handleShippingChange}
                  className="w-full bg-transparent border-b border-stone-300 focus:border-black border-t-0 border-l-0 border-r-0 px-0 py-3 transition-colors focus:ring-0 outline-none placeholder:text-stone-300 text-black"
                />
              </div>
            </form>
          </section>

          {/* BỘ PHẬN 02: Form Thông tin thanh toán */}
          <section>
            <div className="flex items-center space-x-4 mb-10">
              <span className="font-headline text-2xl font-black text-black">02</span>
              <h2 className="font-headline text-xl lg:text-2xl font-bold uppercase tracking-tight text-black">Thông Tin Thanh Toán</h2>
            </div>

            {/* 3 nút chọn phương thức thanh toán */}
            <div className="flex flex-wrap gap-3 mb-10">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method}
                  onClick={() => setSelectedPayment(method)}
                  className={`px-6 py-3 text-[10px] uppercase tracking-widest font-bold border transition-all ${
                    selectedPayment === method
                      ? "border-black text-black"
                      : "border-stone-300 text-stone-400 hover:border-black hover:text-black"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {/* Hiển thị thông báo tương ứng cho COD hoặc Sepay */}
            {selectedPayment === "COD" && (
              <div className="py-8 px-4 text-center border border-stone-200 bg-stone-50">
                <p className="font-body text-sm text-black">
                  Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng tận nơi (Cash on Delivery).
                </p>
              </div>
            )}

            {selectedPayment === "Sepay" && (
              <div className="py-8 px-4 text-center border border-dashed border-stone-300">
                <p className="font-body text-sm text-stone-500">
                  Tích hợp mã QR Sepay — Ra mắt sớm. (Chức năng này đang bảo trì)
                </p>
              </div>
            )}
          </section>

          {/* Nút lớn bấm Xác nhận đặt hàng */}
          <div className="pt-4">
            <button
              onClick={handleConfirm}
              className="w-full md:w-auto bg-black text-white px-16 py-6 font-headline font-bold uppercase tracking-[0.2em] text-sm hover:bg-stone-800 transition-all active:scale-95"
            >
              Xác Nhận Đặt Hàng
            </button>
            <p className="text-stone-500 text-[10px] mt-4 font-body">
              Bằng cách đặt hàng, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của NMen.
            </p>
          </div>
        </div>

        {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (STICKY) */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 bg-stone-100 p-6 lg:p-10">
            <h2 className="font-headline text-xl font-bold uppercase tracking-tight mb-10 text-black">Tóm Tắt Đơn Hàng</h2>

            {/* Danh sách hàng hóa */}
            <div className="space-y-8 mb-12">
              {ORDER_ITEMS.map((item) => (
                <div key={item.id} className="flex gap-6">
                  <div className="w-24 h-32 bg-stone-200 overflow-hidden relative shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-headline font-bold text-sm uppercase text-black">{item.name}</h3>
                      <p className="font-label text-[10px] text-stone-500 mt-1 uppercase tracking-widest">
                        Size: {item.size} | Qty: {item.qty}
                      </p>
                    </div>
                    <span className="font-headline font-bold text-sm text-black">
                      {item.price.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Ô nhập mã giảm giá */}
            <div className="mb-8">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Mã Giảm Giá"
                  className="flex-1 bg-transparent border-b border-stone-400 focus:border-black px-0 py-2 transition-colors focus:ring-0 outline-none font-label text-xs uppercase placeholder:text-stone-400 text-black"
                />
                <button className="font-label text-[10px] uppercase font-bold hover:text-stone-500 transition-colors text-black">
                  Áp Dụng
                </button>
              </div>
            </div>

            {/* Bảng tính tiền */}
            <div className="space-y-4 pt-8 border-t border-stone-300">
              <div className="flex justify-between font-label text-[10px] uppercase tracking-widest text-stone-500">
                <span>Cộng gộp</span>
                <span className="text-black">{subtotal.toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between font-label text-[10px] uppercase tracking-widest text-stone-500">
                <span>Giao hàng</span>
                <span className="font-bold text-black">Miễn phí</span>
              </div>
              <div className="flex justify-between font-headline text-xl font-black uppercase pt-4 border-t border-stone-300 text-black">
                <span>Tổng Cộng</span>
                <span>{total.toLocaleString("vi-VN")} đ</span>
              </div>
            </div>

            {/* Link quay lại giỏ hàng */}
            <div className="mt-8 text-center">
              <Link href="/cart" className="font-label text-[10px] uppercase tracking-widest text-stone-500 hover:text-black underline underline-offset-4 transition-colors">
                ← Chỉnh sửa giỏ hàng
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
