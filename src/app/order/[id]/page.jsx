"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Truck, Box, PackageCheck, Headset } from "lucide-react";

// Dữ liệu tĩnh MOCK cho 1 Đơn hàng
const MOCK_ORDER = {
  placedOn: "24/10/2023",
  status: "Đang giao",
  subtotal: 28000000,
  shipping: 0.00,
  tax: 2240000,
  total: 30240000,
  shippingMethod: "Chuyển phát nhanh (2-3 KBNN)",
  trackingNo: "NM_9921_1102",
  address: "Nguyễn Văn A\nKhu vực Sảnh A, Tòa ICT\nQuận Cầu Giấy, Hà Nội\nViệt Nam\n+84 987 654 321",
  items: [
    {
      id: "oi1",
      name: "Áo khoác dạ Ý",
      color: "Xám Than",
      size: "50 (L)",
      price: 22375000,
      qty: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcD_eVGBdLG76kKEHAabOsmt40rk4HHtNHZS9KiawXrUEH__sBRdTgsoxmPtMG82pNnGxdKYVXGv57BYtUGgwNB276BXHV52WPYdhtfRLlp6CoqNpRmx1I9jGxrhnmaPfHee-zxILa_-0g3IIYdmkEoASt56kSy1dwPddQ_iq2HpSP7By1uF3Xzex7w0mu7laxnUJvuGDnhF1Ep67hUEGGulT84YM9n9CwAZ2NlMFaRaYWeKQcz52gmfBRkdzDEOVirYv4L80-4A"
    },
    {
      id: "oi2",
      name: "Áo sơ mi Cotton",
      color: "Trắng",
      size: "40 (M)",
      price: 5625000,
      qty: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4nAO_HNyaf4-slmYZShJS1srht5TU_nLl0Px27ugrS7OjUXTsRuxIVdtT7dkg8lNZej5BCTbPTzWR8S28qGt5bs7Io5wC2oWFcJIVrljqsbC8xhd8b_FEX5gwOmytsCqjhg2FNonB-xEHAfEcSspRjKpolEK698DSde4NiWxQ_JqQNjt4xb86MeT8WmodfzcZY3cSB73g0oB5jT8DmHYliA6YhHhUCgUmxj46Xh1YmMuPJhdHD8s4KFKDp9PuSO1oti740DVmVg"
    }
  ]
};

export default function OrderDetailsPage() {
  const params = useParams();
  // Lấy tên [id] từ thanh địa chỉ. Nếu không có thì fallback ra 1 mã tuỳ ý
  const orderId = params?.id ? `#${params.id}` : "#NM-882941-ZX";

  return (
    <main className="pt-24 lg:pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-12 text-black bg-stone-50 min-h-screen">
      
      {/* Nút Quay lại */}
      <Link href="/account" className="flex items-center gap-2 mb-12 hover:opacity-60 transition-all w-max group">
        <ArrowLeft size={16} />
        <span className="font-label text-xs uppercase tracking-widest font-medium">Trở về Tài Khoản</span>
      </Link>

      {/* Dàn đầu: Tên Order và Nút In */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 border-b border-stone-200 pb-8">
        <div>
          <h1 className="font-headline text-4xl md:text-7xl font-extrabold tracking-tighter uppercase mb-6 md:mb-4">Chi Tiết Đơn Hàng</h1>
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            
            <div className="flex flex-col">
              <span className="font-label text-[10px] text-stone-500 uppercase tracking-[0.2em] mb-1">Mã Đơn hàng</span>
              <span className="font-headline font-bold text-lg uppercase text-black">{orderId}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="font-label text-[10px] text-stone-500 uppercase tracking-[0.2em] mb-1">Ngày đặt</span>
              <span className="font-headline font-bold text-lg text-black">{MOCK_ORDER.placedOn}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="font-label text-[10px] text-stone-500 uppercase tracking-[0.2em] mb-1">Trạng thái</span>
              <span className="font-headline font-bold text-lg text-black uppercase">{MOCK_ORDER.status}</span>
            </div>
          </div>
        </div>
        
        <div>
          <button 
            onClick={() => alert("Chức năng tải PDF Hóa Đơn đang được bảo trì!")}
            className="bg-black text-white px-10 py-4 font-headline font-bold text-sm uppercase tracking-widest hover:bg-stone-800 transition-colors active:scale-95"
          >
            Tải Hóa Đơn
          </button>
        </div>
      </header>

      {/* TRACKER (Thanh tiến trình) ghép bởi CSS tĩnh */}
      <section className="mb-24 bg-stone-200 p-8 md:p-16">
        <div className="relative flex justify-between items-center max-w-5xl mx-auto">
          {/* Đường Line xám (Nền) */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-stone-300 -translate-y-1/2 z-0"></div>
          {/* Đường Line đen thể hiện hiện tại (VD 40%) */}
          <div className="absolute top-1/2 left-0 w-[40%] h-[2px] bg-black -translate-y-1/2 z-0"></div>
          
          {/* Node 1: Processing */}
          <div className="relative z-10 flex flex-col items-center gap-4 bg-stone-200 px-2 md:px-4">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black text-white border-2 border-black">
              <Check size={20} />
            </div>
            <span className="font-label text-[10px] font-bold uppercase tracking-widest text-black text-center">Đang xử lý</span>
          </div>
          
          {/* Node 2: Shipped */}
          <div className="relative z-10 flex flex-col items-center gap-4 bg-stone-200 px-2 md:px-4">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black text-white border-2 border-black">
              <Truck size={20} />
            </div>
            <span className="font-label text-[10px] font-bold uppercase tracking-widest text-black text-center">Đang vận chuyển</span>
          </div>

          {/* Node 3: Out for Delivery */}
          <div className="relative z-10 flex flex-col items-center gap-4 bg-stone-200 px-2 md:px-4">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-stone-50 text-stone-400 border border-stone-300">
              <Box size={20} />
            </div>
            <span className="font-label text-[10px] font-bold uppercase tracking-widest text-stone-400 text-center">Đang giao<br className="md:hidden"/> hàng</span>
          </div>
          
          {/* Node 4: Delivered */}
          <div className="relative z-10 flex flex-col items-center gap-4 bg-stone-200 px-2 md:px-4">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-stone-50 text-stone-400 border border-stone-300">
              <PackageCheck size={20} />
            </div>
            <span className="font-label text-[10px] font-bold uppercase tracking-widest text-stone-400 text-center">Đã giao</span>
          </div>
        </div>
      </section>

      {/* KHU VỰC CỘT CHÍNH (Chi Tiết Hàng & Bill) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* LƯỚI TRÁI: ROW SẢN PHẨM */}
        <div className="lg:col-span-8">
          <h3 className="font-headline font-extrabold text-2xl uppercase tracking-tighter mb-8 text-black">Đơn hàng gồm ({MOCK_ORDER.items.length})</h3>
          
          <div className="space-y-12">
            {MOCK_ORDER.items.map((item) => (
              <div key={item.id} className="flex gap-6 sm:gap-8 group">
                {/* Ảnh */}
                <div className="w-24 sm:w-32 md:w-48 aspect-3/4 bg-stone-200 overflow-hidden shrink-0 relative">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 grayscale contrast-125" 
                  />
                </div>
                
                {/* Thông tin chữ */}
                <div className="flex-1 flex flex-col justify-between py-1 sm:py-2">
                  <div className="flex flex-col xl:flex-row justify-between items-start gap-4">
                    <div>
                      <h4 className="font-headline font-bold text-lg sm:text-xl uppercase tracking-tight mb-2 text-black">{item.name}</h4>
                      <p className="font-label text-[10px] sm:text-xs text-stone-500 uppercase tracking-widest mb-1">Màu: {item.color}</p>
                      <p className="font-label text-[10px] sm:text-xs text-stone-500 uppercase tracking-widest">Size: {item.size}</p>
                    </div>
                    <span className="font-headline font-bold text-lg sm:text-xl text-black">
                      {item.price.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  
                  {/* Trả hàng / Quantity */}
                  <div className="flex flex-wrap items-center gap-4 mt-6">
                    <span className="font-label text-[10px] uppercase tracking-widest text-stone-500">Số lượng: {item.qty}</span>
                    <button className="text-[10px] text-black uppercase tracking-widest font-bold underline underline-offset-4 hover:text-stone-400 transition-colors">
                      Hoàn trả hàng
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LƯỚI PHẢI: BILL SUMMARY & ADDRESS */}
        <div className="lg:col-span-4 space-y-12">
          
          {/* Địa chỉ Giao Hàng (Khung Trắng) */}
          <div className="bg-white ring-1 ring-black/5 shadow-sm p-8 lg:p-10">
            <h3 className="font-headline font-extrabold text-lg uppercase tracking-tighter mb-6 text-black">Địa chỉ nhận hàng</h3>
            <p className="font-body text-sm leading-relaxed text-stone-600 whitespace-pre-line">
              {MOCK_ORDER.address}
            </p>
            
            <div className="mt-10 pt-8 border-t border-stone-200">
              <h3 className="font-headline font-extrabold text-lg uppercase tracking-tighter mb-4 text-black">Phương thức vận chuyển</h3>
              <p className="font-body text-sm text-black">{MOCK_ORDER.shippingMethod}</p>
              <p className="font-label text-[10px] text-stone-500 uppercase tracking-widest mt-1">Mã vận đơn: {MOCK_ORDER.trackingNo}</p>
            </div>
          </div>

          {/* Khung Total Data (Khung Đen sang trọng) */}
          <div className="bg-black text-white p-8 lg:p-10 shadow-lg">
            <h3 className="font-headline font-extrabold text-lg uppercase tracking-tighter mb-8">Hóa đơn</h3>
            <div className="space-y-5 mb-8">
              <div className="flex justify-between font-label text-[10px] uppercase tracking-widest text-stone-300">
                <span>Cộng gộp</span>
                <span>{MOCK_ORDER.subtotal.toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between font-label text-[10px] uppercase tracking-widest text-stone-300">
                <span>Phí giao hàng</span>
                <span>{MOCK_ORDER.shipping === 0 ? "Miễn phí" : `${MOCK_ORDER.shipping.toLocaleString("vi-VN")} đ`}</span>
              </div>
              <div className="flex justify-between font-label text-[10px] uppercase tracking-widest text-stone-300">
                <span>Thuế</span>
                <span>{MOCK_ORDER.tax.toLocaleString("vi-VN")} đ</span>
              </div>
            </div>
            <div className="pt-6 border-t border-white/20 flex justify-between items-end">
              <span className="font-headline font-extrabold text-lg uppercase tracking-widest">Tổng tiền</span>
              <span className="font-headline font-extrabold text-3xl md:text-2xl xl:text-3xl">{MOCK_ORDER.total.toLocaleString("vi-VN")} đ</span>
            </div>
          </div>

          {/* Need Assistance (Box Support Nhỏ) */}
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
