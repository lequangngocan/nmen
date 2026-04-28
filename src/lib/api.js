const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// hàm gọi API chung, tự thêm token nếu đang đăng nhập
export async function apiFetch(path, options = {}) {
  // Ưu tiên admin token (nếu có) → fallback sang client token
  const adminToken  = typeof window !== 'undefined' ? localStorage.getItem('nmen_admin_token') : null;
  const clientToken = typeof window !== 'undefined' ? localStorage.getItem('nmen_token') : null;
  const token = adminToken || clientToken;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    console.error(`[apiFetch] lỗi ${res.status} cho ${path}:`, text.slice(0, 200));
    throw new Error(`Lỗi server (${res.status})`);
  }

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || `Lỗi ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const apiGet = (path) => apiFetch(path);

export const apiPost = (path, body) =>
  apiFetch(path, { method: 'POST', body: JSON.stringify(body) });

export const apiPatch = (path, body) =>
  apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) });

export const apiPut = (path, body) =>
  apiFetch(path, { method: 'PUT', body: JSON.stringify(body) });

export const apiDelete = (path) =>
  apiFetch(path, { method: 'DELETE' });

export const getFullUrl = (url) => {
  if (!url) return '/placeholder.svg';
  if (url.startsWith('/uploads')) return `${BASE}${url}`;
  return url;
};

// chuẩn hóa dữ liệu sản phẩm từ API
export function normalizeProduct(p) {
  return {
    ...p,
    price: Number(p.price),
    sale_price: p.sale_price ? Number(p.sale_price) : null,
    category: p.category_name || p.category || '',
    primary_image: getFullUrl(p.primary_image),
    hover_image: getFullUrl(p.hover_image || p.primary_image),
    image1: getFullUrl(p.primary_image || p.image1),
    image2: getFullUrl(p.hover_image || p.image2 || p.image1),
  };
}
