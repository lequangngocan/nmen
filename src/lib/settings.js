const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// lấy cấu hình website từ API, dùng cho layout
export async function fetchSiteSettings() {
  try {
    const res = await fetch(`${BASE}/api/settings`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Không lấy được cấu hình website:', err);
    return null;
  }
}
