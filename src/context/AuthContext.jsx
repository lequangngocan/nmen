'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';

const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const raw = localStorage.getItem('nmen_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // khởi tạo null để server và client render giống nhau → tránh hydration error
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // sau khi mount xong (client only) mới đọc localStorage
  useEffect(() => {
    setUser(getStoredUser());
    setMounted(true);
  }, []);

  const login = async (email, password) => {
    const data = await apiPost('/api/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('nmen_token', data.token);
      localStorage.setItem('nmen_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const register = async (fullName, email, password) => {
    // Chỉ gọi API và trả về kết quả, KHÔNG auto-login
    const data = await apiPost('/api/auth/register', { full_name: fullName, email, password });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('nmen_token');
    localStorage.removeItem('nmen_user');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, mounted }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth phải dùng trong AuthProvider');
  }
  return ctx;
}
