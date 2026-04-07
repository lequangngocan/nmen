"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus, X, CheckCircle2, Package } from "lucide-react";
import Link from "next/link";

// 1. Dữ liệu cứng (Hardcoded) giả lập giỏ hàng có sẵn 2 món
const MOCK_CART_DATA = [
  {
    id: "c1",
    name: "Structural Wool Overcoat",
    articleNo: "88392-102",
    color: "Anthracite",
    size: "50 (M)",
    price: 1250.00,
    quantity: 1,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIgWSo99t60vzmiIar2kgc035z7WZOvVDPmfhiUZvde2MEBO8VEYHU9sX-_iezlqwHZd_Ku_BW3BoWzKLQqcWwIOpFtja3jF0-2szYG8n7EvYvtiko4-A9xLqDaSU9egjbCnUvH10b0ucG0liWDnaToE6fotP9gY47UNwsJoTKHJdE0n429OhFQQArTfuE2Cv5-dAJXuukRfbDkx9nIV0Kl22b9CWNq6bvMKNthsnmnlfUWgkMIcDcK7LZ2eHG7-n1C5NoGoigIw"
  },
  {
    id: "c2",
    name: "Poplin Monolith Shirt",
    articleNo: "22019-99",
    color: "Obsidian",
    size: "48 (S)",
    price: 420.00,
    quantity: 1,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC70MzAq_M1-VG5sceEaC9bPFVBGGw76uyKxflCsYxK7SX2LG8O5aNJr9254EmRXEe_OOZ_Xb2jGS7Rds6e7zwr0IgPCAokNYZZBzJyhCPEkhhzhpuGnKpiTRih0IEmNMMbgATnxbiw4tM6J-P2EhZOcHEM5YNkLRCuK9ZSjiPyiVRzD8Ova8plVOcjmGWaN_MJi2LeaLhw9g4pcCnnhbNNnTPpxlAgobDLRLCIVGm_Wg_aF4_SefBQWM2pHzYc5WxkdhrOhBGWHw"
  }
];

export default function CartPage() {
  // Biến lưu trữ giỏ hàng, nếu rỗng thì mảng là []
  const [cartItems, setCartItems] = useState(MOCK_CART_DATA);

  // Hàm xoá sản phẩm
  const removeItem = (id) => {
    // sinh viên dùng filter để giữ lại các món không trùng ID xoá
    const newCart = cartItems.filter((item) => item.id !== id);
    setCartItems(newCart);
  };

  // Hàm tăng số lượng
  const increaseQty = (id) => {
    const updated = cartItems.map((item) => {
      if (item.id === id) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    setCartItems(updated);
  };

  // Hàm giảm số lượng
  const decreaseQty = (id) => {
    const updated = cartItems.map((item) => {
      // Dừng ở 1, không cho thành số 0 (nếu bằng 0 thì xoá luôn hoặc chặn ở 1 tuỳ logic)
      if (item.id === id && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    });
    setCartItems(updated);
  };

  // 2. Các hàm tính tiền
  // Tính tổng phụ (giá x số lượng cộng dồn) bằng reduce của Array (kinh điển)
  const subtotal = cartItems.reduce(
    (total, currentItem) => total + currentItem.price * currentItem.quantity,
    0
  );

  // Thuế nháp: 8% VAT
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="pt-4 lg:pt-8 pb-24 px-12 max-w-[1440px] mx-auto min-h-screen">
      
      {/* Khung tiêu đề đầu trang */}
      <header className="mb-12 lg:mb-20">
        <h1 className="font-headline text-3xl lg:text-5xl font-extrabold tracking-tighter uppercase mb-4">Your Selection</h1>
        <p className="font-body text-sm text-stone-500 uppercase tracking-widest text-black">
          {cartItems.length} Items in your cart
        </p>
      </header>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-stone-100">
          <p className="font-body text-lg mb-6 text-black">Your cart is currently empty.</p>
          <Link href="/clothing" className="inline-block px-8 py-4 bg-black text-white font-bold uppercase text-sm tracking-widest hover:bg-stone-800 transition">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* CỘT TRÁI: DANH SÁCH MÓN HÀNG */}
          <section className="col-span-1 lg:col-span-8">
            {cartItems.map((item) => (
              <article key={item.id} className="flex flex-col sm:flex-row gap-8 mb-12 sm:mb-16 pb-12 sm:pb-16 relative border-b border-stone-200 last:border-b-0">
                
                {/* Khu vực ảnh */}
                <div className="w-full sm:w-48 aspect-3/4 bg-stone-100 overflow-hidden shrink-0 relative">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill 
                    className="object-cover grayscale" 
                  />
                </div>
                
                {/* Khu vực chữ nghĩa */}
                <div className="flex flex-col justify-between w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                    <div>
                      <h2 className="font-headline text-xl font-bold tracking-tight uppercase mb-1 text-black">{item.name}</h2>
                      <p className="font-label text-xs text-stone-500 uppercase tracking-wider mb-6">Article No. {item.articleNo}</p>
                      
                      <div className="space-y-2">
                        <div className="flex gap-4">
                          <span className="font-label text-[10px] text-stone-500 uppercase tracking-widest w-12">Color:</span>
                          <span className="font-body text-sm uppercase text-black">{item.color}</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="font-label text-[10px] text-stone-500 uppercase tracking-widest w-12">Size:</span>
                          <span className="font-body text-sm uppercase text-black">{item.size}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="font-headline text-xl font-bold text-black">${item.price.toLocaleString("en-US", {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>
                  
                  {/* Cụm Tăng/Giảm/Xóa phía dưới */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-end mt-8 gap-6 sm:gap-0">
                    <div className="flex items-center gap-6 border-b border-stone-300 pb-1 w-max">
                      <button onClick={() => decreaseQty(item.id)} className="hover:opacity-50 transition-opacity text-black">
                        <Minus size={16} />
                      </button>
                      <span className="font-label text-sm font-medium w-4 text-center text-black">{item.quantity}</span>
                      <button onClick={() => increaseQty(item.id)} className="hover:opacity-50 transition-opacity text-black">
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <button onClick={() => removeItem(item.id)} className="font-label text-[10px] uppercase tracking-widest text-stone-500 hover:text-red-600 transition-colors flex items-center gap-2">
                      <X size={16} /> Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* CỘT PHẢI: HÓA ĐƠN VÀ NÚT CHECKOUT */}
          <aside className="col-span-1 lg:col-span-4 lg:sticky lg:top-32">
            <div className="bg-white p-6 lg:p-10 ring-1 ring-black/5 shadow-sm">
              <h3 className="font-headline text-xl lg:text-2xl font-black tracking-tighter uppercase mb-8 text-black">Summary</h3>
              
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center text-black">
                  <span className="font-body text-xs uppercase tracking-widest text-stone-500">Subtotal</span>
                  <span className="font-label text-sm font-semibold">${subtotal.toLocaleString("en-US", {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body text-xs uppercase tracking-widest text-stone-500">Shipping</span>
                  <span className="font-label text-xs uppercase tracking-widest text-black font-bold">Complimentary</span>
                </div>
                <div className="flex justify-between items-center text-black">
                  <span className="font-body text-xs uppercase tracking-widest text-stone-500">Estimated Tax (8%)</span>
                  <span className="font-label text-sm font-semibold">${tax.toLocaleString("en-US", {minimumFractionDigits: 2})}</span>
                </div>
              </div>
              
              <div className="border-t border-stone-200 pt-8 mb-12">
                <div className="flex justify-between items-end text-black">
                  <span className="font-headline text-sm font-extrabold uppercase tracking-widest">Total</span>
                  <span className="font-headline text-2xl lg:text-3xl font-black tracking-tighter">${total.toLocaleString("en-US", {minimumFractionDigits: 2})}</span>
                </div>
              </div>
              
              {/* Dùng Link thay vì button để chuyển trang sang /checkout */}
              <Link
                href="/checkout"
                className="w-full bg-black text-white py-6 font-headline font-bold uppercase tracking-widest text-sm transition-all hover:bg-stone-800 active:scale-[0.98] mb-6 block text-center"
              >
                Proceed to Checkout
              </Link>
              
              <p className="font-body text-[10px] text-stone-500 text-center leading-relaxed">
                Prices include VAT where applicable. Shipping costs are calculated based on your destination at the next step.
              </p>
            </div>
            
            {/* Cam kết thương hiệu nhỏ lẻ bên dưới */}
            <div className="mt-8 px-2 space-y-4">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="text-black" size={20} />
                <div>
                  <p className="font-label text-[11px] font-bold uppercase mb-1 text-black">Authenticity Guaranteed</p>
                  <p className="font-body text-[11px] text-stone-500">Each piece is verified by our master tailors.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Package className="text-black" size={20} />
                <div>
                  <p className="font-label text-[11px] font-bold uppercase mb-1 text-black">Monolith Packaging</p>
                  <p className="font-body text-[11px] text-stone-500">Delivered in our signature pH-neutral archival boxes.</p>
                </div>
              </div>
            </div>
          </aside>

        </div>
      )}
    </div>
  );
}
