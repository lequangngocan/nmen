"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Tài khoản admin cứng (demo cho đồ án)
const ADMIN_ACCOUNT = {
  username: "admin",
  password: "admin123",
};

export default function AdminLoginPage() {
  const router = useRouter();

  // State lưu giá trị ô input
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Hàm xử lý đăng nhập
  const handleLogin = (e) => {
    e.preventDefault(); // chặn form reload trang
    setError("");
    setLoading(true);

    // Giả lập delay đăng nhập
    setTimeout(() => {
      if (
        username === ADMIN_ACCOUNT.username &&
        password === ADMIN_ACCOUNT.password
      ) {
        // Lưu trạng thái đăng nhập vào localStorage
        localStorage.setItem("adminLoggedIn", "true");
        router.push("/admin");
      } else {
        setError("Tên đăng nhập hoặc mật khẩu không đúng!");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Tiêu đề */}
        <div className="text-center mb-10">
          <h1 className="font-headline text-4xl font-black tracking-tighter uppercase text-black">
            NMen
          </h1>
          <p className="text-stone-500 text-sm mt-2 uppercase tracking-widest font-label">
            Admin Panel
          </p>
        </div>

        {/* Card form đăng nhập */}
        <div className="bg-white p-8 shadow-sm border border-stone-200">
          <h2 className="font-headline text-xl font-bold uppercase tracking-tight text-black mb-8">
            Đăng nhập
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Ô tên đăng nhập */}
            <div>
              <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full border-b border-stone-300 focus:border-black bg-transparent px-0 py-2 outline-none focus:ring-0 text-black transition-colors"
              />
            </div>

            {/* Ô mật khẩu */}
            <div>
              <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border-b border-stone-300 focus:border-black bg-transparent px-0 py-2 outline-none focus:ring-0 text-black transition-colors"
              />
            </div>

            {/* Hiển thị lỗi nếu đăng nhập sai */}
            {error && (
              <p className="text-red-600 text-sm font-label">{error}</p>
            )}

            {/* Nút đăng nhập */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 font-headline font-bold uppercase tracking-widest text-sm hover:bg-stone-800 transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {/* Hint tài khoản demo */}
          <div className="mt-6 p-4 bg-stone-50 border border-stone-200">
            <p className="font-label text-[10px] text-stone-500 uppercase tracking-widest mb-1">
              Tài khoản demo
            </p>
            <p className="text-sm text-stone-600">
              Username: <strong>admin</strong> / Password: <strong>admin123</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
