"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  // State form lưu trữ giá trị nhập vào
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // State cấu hình Ẩn Hiện Mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false); // Modal báo thành công

  const router = useRouter();
  const { register } = useAuth();

  // Xử lý ghi nhận chuỗi gõ vào bàn phím
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Nộp Form thực tế gọi API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    setSubmitting(true);
    const data = await register(formData.fullName, formData.email, formData.password);
    setSubmitting(false);

    if (data.token) {
      // Bật modal báo thành công
      setSuccessModal(true);
    } else {
      setError(data.message || "Đăng ký thất bại");
    }
  };

  return (
    <>
      {/* Modal báo đăng ký thành công */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-10 max-w-sm w-full mx-4 text-center shadow-2xl">
            <h3 className="font-headline text-2xl font-black uppercase tracking-tight text-black mb-4">
              Tuyệt vời!
            </h3>
            <p className="font-body text-sm text-stone-500 mb-8 leading-relaxed">
              Tài khoản <strong>{formData.fullName}</strong> đã được tạo thành công. Bạn đã sẵn sàng để mua sắm cùng NMen.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-black text-white font-headline font-bold text-xs uppercase tracking-[0.2em] py-4 hover:bg-stone-800 transition-colors"
            >
              Tới Trang Đăng Nhập
            </button>
          </div>
        </div>
      )}

      <div className="bg-stone-50 text-black flex min-h-screen">
      
      {/* 🚀 LƯỚI BÊN TRÁI: KHU VỰC HIỂN THỊ HÌNH ẢNH (Chỉ hiện trên PC: lg:flex) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-stone-200 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/img_da65ebc2.jpg"
            alt="Brand Aesthetic"
            fill
            className="object-cover grayscale brightness-90"
            priority
          />
        </div>
        <div className="relative z-10 p-16 flex flex-col justify-between h-full w-full bg-linear-to-t from-black/80 to-transparent">
          <div>
            <Link href="/" className="font-headline font-black text-6xl tracking-tighter text-white uppercase leading-none hover:opacity-80 transition-opacity">
              NMen
            </Link>
          </div>
          <div className="max-w-md">
            <p className="font-headline text-white text-3xl font-light tracking-tight leading-snug">
              Sự chính xác trong cấu trúc dành cho tủ đồ hiện đại của phái mạnh.
            </p>
            <div className="mt-8 w-12 h-1 bg-white"></div>
          </div>
        </div>
      </div>

      {/* 🚀 LƯỚI BÊN PHẢI: FORM ĐIỀN THÔNG TIN */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 md:px-12 py-20 bg-stone-50">
        <div className="w-full max-w-md">
          
          {/* Logo Mobile */}
          <div className="lg:hidden mb-12 flex justify-center">
             <Link href="/" className="font-headline font-black text-4xl tracking-tighter text-black uppercase">
              NMen
            </Link>
          </div>

          <div className="mb-12">
            <h2 className="font-headline font-extrabold text-4xl tracking-tighter text-black uppercase mb-2">Tạo Tài Khoản</h2>
            <p className="font-body text-stone-500 text-sm tracking-wide">Nhập thông tin của bạn để gia nhập NMen.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Input Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="full_name" className="font-label text-xs font-semibold uppercase tracking-widest text-stone-600">Họ và Tên</label>
              <input 
                id="full_name" 
                name="fullName" 
                type="text" 
                required
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-stone-300 py-3 px-0 font-body text-black placeholder-stone-300 focus:border-black focus:ring-0 transition-all outline-none" 
              />
            </div>

            {/* Input Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-label text-xs font-semibold uppercase tracking-widest text-stone-600">Địa chỉ Email</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-stone-300 py-3 px-0 font-body text-black placeholder-stone-300 focus:border-black focus:ring-0 transition-all outline-none" 
              />
            </div>

            {/* Input Password 1 */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="font-label text-xs font-semibold uppercase tracking-widest text-stone-600">Mật Khẩu</label>
              <div className="relative">
                <input 
                  id="password" 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-t-0 border-x-0 border-b border-stone-300 py-3 px-0 font-body text-black placeholder-stone-300 focus:border-black focus:ring-0 transition-all outline-none pr-10" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Input Password 2 (Confirm) */}
            <div className="flex flex-col gap-2">
              <label htmlFor="confirm_password" className="font-label text-xs font-semibold uppercase tracking-widest text-stone-600">Xác Nhận Mật Khẩu</label>
              <div className="relative">
                <input 
                  id="confirm_password" 
                  name="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"} 
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-t-0 border-x-0 border-b border-stone-300 py-3 px-0 font-body text-black placeholder-stone-300 focus:border-black focus:ring-0 transition-all outline-none pr-10" 
                />
                 <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Thông báo lỗi */}
            {error && (
              <p className="text-red-600 text-xs font-label tracking-wide text-center -mt-2">
                {error}
              </p>
            )}

            {/* Action Buttons & Links */}
            <div className="pt-6 space-y-6">
              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-5 bg-black text-white font-headline font-bold text-sm uppercase tracking-[0.2em] hover:bg-stone-800 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
              >
                {submitting ? "Đang xử lý..." : "Đăng Ký Ngay"}
              </button>
              
              <div className="flex items-center gap-4 text-stone-300">
                <div className="grow h-px bg-current"></div>
                <span className="font-label text-[10px] uppercase tracking-widest text-stone-400">hoặc</span>
                <div className="grow h-px bg-current"></div>
              </div>
              
              <div className="flex justify-center">
                <p className="font-body text-sm text-stone-500">
                  Đã có tài khoản? 
                  <Link href="/login" className="text-black font-bold ml-1 hover:underline underline-offset-4 transition-all">Đăng nhập</Link>
                </p>
              </div>
            </div>
          </form>

          {/* Legal Footer Bottom */}
          <div className="mt-20">
            <p className="font-body text-[10px] text-stone-400 leading-relaxed uppercase tracking-widest text-center lg:text-left">
              Bằng việc tạo tài khoản, bạn đồng ý với <span className="text-stone-600 cursor-pointer hover:text-black underline">Điều khoản dịch vụ</span> và <span className="text-stone-600 cursor-pointer hover:text-black underline">Chính sách bảo mật</span> của NMen.
            </p>
          </div>
          
        </div>
      </div>

    </div>
    </>
  );
}
