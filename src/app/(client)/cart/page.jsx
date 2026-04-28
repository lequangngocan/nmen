"use client";

import Image from "next/image";
import { Plus, Minus, X, CheckCircle2, Package } from "lucide-react";
import Link from "next/link";

import { useCart } from "@/context/CartContext";
import { getFullUrl } from "@/lib/api";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal, mounted } = useCart();

  const total = subtotal;

  if (!mounted) {
    return <div className="min-h-screen bg-surface"></div>;
  }

  return (
    <div className="pt-4 lg:pt-8 pb-24 px-6 lg:px-12 max-w-[1440px] mx-auto min-h-screen">
      
      {/* Khung tiêu đề đầu trang */}
      <header className="mb-12 lg:mb-20">
        <h1 className="font-headline text-3xl lg:text-5xl font-extrabold tracking-tighter uppercase mb-4">Giỏ hàng của bạn</h1>
        <p className="font-body text-sm text-stone-500 uppercase tracking-widest text-black">
          {items.length} sản phẩm trong giỏ
        </p>
      </header>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-stone-100">
          <p className="font-body text-lg mb-6 text-black">Giỏ hàng của bạn đang trống.</p>
          <Link href="/clothing" className="inline-block px-8 py-4 bg-black text-white font-bold uppercase text-sm tracking-widest hover:bg-stone-800 transition">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* CỘT TRÁI: DANH SÁCH MÓN HÀNG */}
          <section className="col-span-1 lg:col-span-8">
            {items.map((item, idx) => (
              <article key={item.id} className="flex flex-col sm:flex-row gap-8 mb-12 sm:mb-16 pb-12 sm:pb-16 relative border-b border-stone-200 last:border-b-0">
                
                {/* Khu vực ảnh */}
                <div className="w-full sm:w-48 aspect-3/4 bg-stone-100 overflow-hidden shrink-0 relative">
                  <Image 
                    src={getFullUrl(item.image)} 
                    alt={item.product_name} 
                    fill 
                    className="object-cover grayscale" 
                    unoptimized
                    priority={idx === 0}
                  />
                </div>
                
                {/* Khu vực chữ nghĩa */}
                <div className="flex flex-col justify-between w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                    <div>
                      <h2 className="font-headline text-xl font-bold tracking-tight uppercase mb-1 text-black">{item.product_name}</h2>
                      <p className="font-label text-xs text-stone-500 uppercase tracking-wider mb-6">Mã SP: {item.product_id}</p>
                      
                      <div className="space-y-2">
                        {item.color && (
                          <div className="flex gap-4">
                            <span className="font-label text-[10px] text-stone-500 uppercase tracking-widest w-12">Màu:</span>
                            <div className="w-4 h-4 rounded-full border border-stone-300" style={{ backgroundColor: item.color }}></div>
                          </div>
                        )}
                        {item.size && (
                          <div className="flex gap-4">
                            <span className="font-label text-[10px] text-stone-500 uppercase tracking-widest w-12">Size:</span>
                            <span className="font-body text-sm uppercase text-black">{item.size}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="font-headline text-xl font-bold text-black">{item.price.toLocaleString("vi-VN")} đ</span>
                    </div>
                  </div>
                  
                  {/* Cụm Tăng/Giảm/Xóa phía dưới */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-end mt-8 gap-6 sm:gap-0">
                    <div className="flex items-center gap-6 border-b border-stone-300 pb-1 w-max">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="hover:opacity-50 transition-opacity text-black disabled:opacity-30 disabled:cursor-not-allowed">
                        <Minus size={16} />
                      </button>
                      <span className="font-label text-sm font-medium w-4 text-center text-black">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="hover:opacity-50 transition-opacity text-black">
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <button onClick={() => removeFromCart(item.id)} className="font-label text-[10px] uppercase tracking-widest text-stone-500 hover:text-red-600 transition-colors flex items-center gap-2">
                      <X size={16} /> Xóa
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* CỘT PHẢI: HÓA ĐƠN VÀ NÚT CHECKOUT */}
          <aside className="col-span-1 lg:col-span-4 lg:sticky lg:top-32">
            <div className="bg-white p-6 lg:p-10 ring-1 ring-black/5 shadow-sm">
              <h3 className="font-headline text-xl lg:text-2xl font-black tracking-tighter uppercase mb-8 text-black">Tạm tính</h3>
              
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center text-black">
                  <span className="font-body text-xs uppercase tracking-widest text-stone-500">Cộng gộp</span>
                  <span className="font-label text-sm font-semibold">{subtotal.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body text-xs uppercase tracking-widest text-stone-500">Giao hàng</span>
                  <span className="font-label text-xs uppercase tracking-widest text-black font-bold">Miễn phí</span>
                </div>

              </div>
              
              <div className="border-t border-stone-200 pt-8 mb-12">
                <div className="flex justify-between items-end text-black">
                  <span className="font-headline text-sm font-extrabold uppercase tracking-widest">Tổng Cộng</span>
                  <span className="font-headline text-2xl lg:text-3xl font-black tracking-tighter">{total.toLocaleString("vi-VN")} đ</span>
                </div>
              </div>
              
              {/* Dùng Link thay vì button để chuyển trang sang /checkout */}
              <Link
                href="/checkout"
                className="w-full bg-black text-white py-6 font-headline font-bold uppercase tracking-widest text-sm transition-all hover:bg-stone-800 active:scale-[0.98] mb-6 block text-center"
              >
                Tiến hành thanh toán
              </Link>
              
              <p className="font-body text-[10px] text-stone-500 text-center leading-relaxed">
                Phí giao hàng sẽ được tính toán dựa trên địa chỉ của bạn ở bước kế tiếp.
              </p>
            </div>
            
            {/* Cam kết thương hiệu nhỏ lẻ bên dưới */}
            <div className="mt-8 px-2 space-y-4">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="text-black" size={20} />
                <div>
                  <p className="font-label text-[11px] font-bold uppercase mb-1 text-black">Đảm bảo chính hãng</p>
                  <p className="font-body text-[11px] text-stone-500">Mỗi sản phẩm đều được kiểm định bởi thợ may bậc thầy.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Package className="text-black" size={20} />
                <div>
                  <p className="font-label text-[11px] font-bold uppercase mb-1 text-black">Đóng gói độc quyền</p>
                  <p className="font-body text-[11px] text-stone-500">Sản phẩm được đóng gói trong hộp lưu trữ trung tính đặc trưng.</p>
                </div>
              </div>
            </div>
          </aside>

        </div>
      )}
    </div>
  );
}
