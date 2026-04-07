"use client";

import Image from "next/image";
import Link from "next/link";

export default function OrderHistoryPage() {
  
  // Dữ liệu giả lập 4 Đơn hàng (Mock Data)
  const orders = [
    { id: "NM-49201", date: "October 24, 2024", status: "In Transit", total: "$1,240.00" },
    { id: "NM-48592", date: "September 12, 2024", status: "Delivered", total: "$450.00" },
    { id: "NM-47110", date: "August 05, 2024", status: "Delivered", total: "$2,890.00" },
    { id: "NM-46029", date: "June 18, 2024", status: "Cancelled", total: "$125.00" },
  ];

  // Hàm render cái nhãn trạng thái (Status Badge) dựa vào tên
  const renderStatusBadge = (status) => {
    switch (status) {
      case "In Transit":
        return <span className="inline-flex items-center px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest">In Transit</span>;
      case "Delivered":
        return <span className="inline-flex items-center px-3 py-1 bg-stone-200 text-black text-[10px] font-bold uppercase tracking-widest">Delivered</span>;
      case "Cancelled":
        return <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-widest">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <section>
      
      {/* Tiêu đề Box Order History */}
      <header className="mb-10 lg:mb-16">
        <h1 className="font-headline text-4xl mt-3 lg:text-5xl font-black tracking-tighter uppercase mb-4 text-black">Order History</h1>
        <p className="font-body text-stone-500 max-w-xl text-sm lg:text-base leading-relaxed">
          Track your recent purchases, download invoices, and manage returns from your digital closet vault.
        </p>
      </header>

      {/* DANH SÁCH BẢNG GRID ĐƠN HÀNG */}
      <div className="space-y-4 lg:space-y-6">
        
        {/* Table Header (Ẩn trên Mobile, chỉ hiện từ PC/Ipad) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 pb-4 border-b border-stone-300">
          <div className="col-span-2 font-headline text-[10px] font-black uppercase tracking-widest text-stone-400">Order ID</div>
          <div className="col-span-3 font-headline text-[10px] font-black uppercase tracking-widest text-stone-400">Date</div>
          <div className="col-span-3 font-headline text-[10px] font-black uppercase tracking-widest text-stone-400">Status</div>
          <div className="col-span-2 font-headline text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">Total</div>
          <div className="col-span-2"></div>
        </div>

        {/* Lặp Render từng Đơn hàng */}
        {orders.map((order) => (
          <div 
            key={order.id} 
            className="grid grid-cols-2 md:grid-cols-12 items-center gap-y-6 gap-x-4 p-6 bg-white shadow-sm ring-1 ring-stone-100 hover:bg-stone-50 transition-colors group cursor-default"
          >
            {/* ID */}
            <div className="col-span-2 md:col-span-2 font-label text-sm font-bold text-black order-1">
              #{order.id}
            </div>
            
            {/* Giá (Đưa lên trên cùng hàng 1 ở Mobile cho mượt) */}
            <div className="col-span-2 md:col-span-2 font-label text-sm font-bold md:text-right text-black order-2 md:order-4 text-right">
              {order.total}
            </div>

            {/* Date */}
            <div className="col-span-2 md:col-span-3 font-body text-sm text-stone-500 order-3 md:order-2">
              {order.date}
            </div>
            
            {/* Status Nhãn */}
            <div className="col-span-1 md:col-span-3 order-4 md:order-3">
              {renderStatusBadge(order.status)}
            </div>

            {/* Nút mồi "Details" giả lập đi tới trang order/:id */}
            <div className="col-span-1 md:col-span-2 flex justify-end gap-4 order-5">
              <Link 
                href={`/order/${order.id.replace('NM-', '')}`}
                className="font-headline text-[10px] font-bold uppercase tracking-widest text-black border-b border-transparent hover:border-black transition-all"
              >
                Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* BENTO LAYOUT MAKRTING BOARDS (Chuẩn xịn V2) */}
      <div className="mt-16 lg:mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Banner Vault Hình Ảnh */}
        <div className="relative aspect-[16/10] md:aspect-[16/7] overflow-hidden group cursor-pointer bg-stone-200">
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-10"></div>
          <Image 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBS1lOvueWl-A7U3Hp-bL5iDTcVT5qQlM7QYopNKDEaJlPRWHEAzFIkFebXm3usxkhcB5UcpWhYFrWJKYTjGInSKYcOfI-DR20shT3Qah-p7RaHP9Sz9kfJ-NO8GQuC2doJl1OTNoIUWVs3KbAh5BLVCOq87cvXMxR7RXUXBYPcXy1mQt0QkG51fTjejf92Znvw6to-B9TW0I4f44c26xBSmnM6j3fR7YI97pR2Rqa0IuQ37PUFH6bL-MBU0-nWlrlGR9Q0h1Hl8A" 
            alt="The Winter Vault"
            fill
            className="absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end text-white">
            <p className="font-headline text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-stone-300">Exclusive Release</p>
            <h3 className="font-headline text-2xl font-black uppercase tracking-tight">The Winter Vault</h3>
          </div>
        </div>

        {/* Khối Đen Text (Concierge Service) */}
        <div className="p-10 lg:p-12 bg-black text-white flex flex-col justify-center shadow-lg">
          <h3 className="font-headline text-3xl font-black uppercase tracking-tight mb-4">Concierge Service</h3>
          <p className="font-body text-sm text-stone-400 mb-8 max-w-xs leading-relaxed">
            Need to return a garment? Our white-glove concierge is at your service for effortless exchanges.
          </p>
          <button className="w-fit font-headline text-xs font-bold uppercase tracking-widest border-b-[1px] border-white pb-1 hover:text-stone-300 hover:border-stone-300 transition-all">
            Request Pickup
          </button>
        </div>

      </div>

    </section>
  );
}
