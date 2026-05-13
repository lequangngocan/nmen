'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost, apiGet } from '@/lib/api';

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
    const checkSession = async () => {
      const stored = getStoredUser();
      if (!stored) {
        setMounted(true);
        return;
      }

      // Tạm set user từ localStorage để UI không giật
      setUser(stored);
      setMounted(true);

      // Verify token qua server
      try {
        const data = await apiGet('/api/auth/me');
        // Nếu thành công thì update user mới nhất
        if (data.id) {
          setUser(data);
          localStorage.setItem('nmen_user', JSON.stringify(data));
        }
      } catch {
        console.log('Phiên đăng nhập hết hạn hoặc bị khoá');
        localStorage.removeItem('nmen_token');
        localStorage.removeItem('nmen_user');
        setUser(null);
      }
    };
    checkSession();
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
    const data = await apiPost('/api/auth/register', { full_name: fullName, email, password });
    if (data.token) {
      localStorage.setItem('nmen_token', data.token);
      localStorage.setItem('nmen_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('nmen_token');
    localStorage.removeItem('nmen_user');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, mounted, login, register, logout }}>
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
