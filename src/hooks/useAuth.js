'use client';

// Re-export từ AuthContext để các trang không cần đổi import
export { useAuth } from '@/context/AuthContext';

// Giữ lại getStoredUser cho các trường hợp dùng ngoài component
export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('nmen_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
