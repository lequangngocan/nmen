"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@nmen.vn");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Nếu đã đăng nhập admin → redirect về /admin
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("nmen_admin_user") || "null");
      if (user?.role === "admin") router.replace("/admin");
    } catch {}
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiPost("/api/auth/admin-login", { email, password });
      if (data.token && data.user?.role === "admin") {
        // Lưu vào key riêng cho admin — tách biệt hoàn toàn với client session
        localStorage.setItem("nmen_admin_token", data.token);
        localStorage.setItem("nmen_admin_user", JSON.stringify(data.user));
        router.push("/admin");
      } else {
        setError("Tài khoản không có quyền admin.");
      }
    } catch (err) {
      setError(err.message || "Tên đăng nhập hoặc mật khẩu không đúng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-headline text-4xl font-black tracking-tighter uppercase text-black">NMen</h1>
          <p className="text-stone-500 text-sm mt-2 uppercase tracking-widest font-label">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 shadow-sm border border-stone-200">
          <h2 className="font-headline text-xl font-bold uppercase tracking-tight text-black mb-8">Đăng nhập</h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block font-label text-[10px] uppercase tracking-widest text-stone-500 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nmen.vn"
                required
                className="w-full border-b border-stone-300 focus:border-black bg-transparent px-0 py-2 outline-none text-black transition-colors"
              />
            </div>

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
                className="w-full border-b border-stone-300 focus:border-black bg-transparent px-0 py-2 outline-none text-black transition-colors"
              />
            </div>

            {error && <p className="text-red-600 text-sm font-label">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 font-headline font-bold uppercase tracking-widest text-sm hover:bg-stone-800 transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-6 p-4 bg-stone-50 border border-stone-200">
            <p className="font-label text-[10px] text-stone-500 uppercase tracking-widest mb-1">Tài khoản demo</p>
            <p className="text-sm text-stone-600">
              Email: <strong>admin@nmen.vn</strong> / Password: <strong>admin123</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
