"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert("Vui lòng điền đầy đủ Email và Mật khẩu!");
      return;
    }
    console.log("Đăng nhập:", formData);
    alert(`Chào mừng "${formData.email}" trở lại hệ thống NMen! \nNhấn OK để đóng Pop-up.`);
  };

  return (
    <div className="bg-stone-50 min-h-screen relative flex items-center justify-center p-6 text-black overflow-hidden z-0">
      
      {/* Decorative Image Layer (Hiệu ứng ánh sáng Blur phông nền mờ mờ y hệt bản thiết kế) */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-40">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-stone-300 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-stone-400 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md z-10 relative">
        
        {/* Brand Header */}
        <div className="mb-12 text-center">
          <Link href="/" className="font-headline text-4xl font-black tracking-tighter uppercase text-black hover:opacity-80 transition-opacity">NMen</Link>
          <p className="font-label text-xs uppercase tracking-[0.2em] text-stone-500 mt-2">Nền tảng thời trang số</p>
        </div>

        {/* Auth Card Box */}
        <div className="bg-white p-10 md:p-12 shadow-xl ring-1 ring-black/5 rounded-sm">
          <div className="mb-10">
            <h2 className="font-headline text-2xl font-bold tracking-tight text-black">Đăng Nhập</h2>
            <p className="font-body text-sm text-stone-500 mt-1">Nhập thông tin xác thực để truy cập hồ sơ của bạn.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            
            {/* Input Email */}
            <div className="group relative">
              <label htmlFor="email" className="font-label text-[10px] uppercase tracking-widest text-stone-500 block mb-2 transition-colors group-focus-within:text-black">
                Địa chỉ Email
              </label>
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

            {/* Input Password */}
            <div className="group relative">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="font-label text-[10px] uppercase tracking-widest text-stone-500 transition-colors group-focus-within:text-black">
                  Mật Khẩu
                </label>
                <Link href="#" className="font-label text-[10px] uppercase tracking-widest text-stone-400 hover:text-black transition-colors underline-offset-4 hover:underline shrink-0">
                  Quên mật khẩu?
                </Link>
              </div>
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
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-3">
              <input 
                id="remember" 
                name="remember" 
                type="checkbox" 
                className="w-4 h-4 border-stone-300 rounded-none text-black focus:ring-offset-0 focus:ring-0 cursor-pointer accent-black bg-white"
              />
              <label htmlFor="remember" className="font-label text-xs text-stone-500 cursor-pointer hover:text-black transition-colors">
                Ghi nhớ đăng nhập
              </label>
            </div>

            {/* Nút Đăng nhập Nhám Đen */}
            <div className="pt-4">
              <button 
                type="submit"
                className="w-full bg-black text-white py-5 font-headline font-bold uppercase text-xs tracking-widest hover:bg-stone-800 transition-all active:scale-[0.98]"
              >
                Đăng Nhập Ngay
              </button>
            </div>
          </form>

          {/* Social Divider */}
          <div className="relative my-10 flex items-center">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-4 font-label text-[10px] uppercase tracking-widest text-stone-400">HOẶC TIẾP TỤC VỚI</span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>

          {/* Nút giả lập Đăng nhập MXH */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => alert("Chức năng đang bảo trì!")}
              className="flex items-center justify-center space-x-2 py-4 border border-stone-300 hover:bg-stone-100 transition-colors font-label text-[10px] uppercase tracking-widest text-black"
            >
              <span>Google</span>
            </button>
            <button 
              onClick={() => alert("Chức năng đang bảo trì!")}
              className="flex items-center justify-center space-x-2 py-4 border border-stone-300 hover:bg-stone-100 transition-colors font-label text-[10px] uppercase tracking-widest text-black"
            >
              <span>Facebook</span>
            </button>
          </div>

        </div>

        {/* Footer Text Link Create Account */}
        <div className="mt-8 text-center relative z-20">
          <p className="font-body text-sm text-stone-500">
            Bạn là người dùng mới? 
            <Link href="/register" className="font-bold text-black underline underline-offset-4 decoration-1 hover:decoration-2 transition-all ml-1">
              Tạo tài khoản
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
