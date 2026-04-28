import Link from "next/link";
import { Package, ShoppingBag, Users, TrendingUp, Clock } from "lucide-react";
import StatCard from "@/components/admin/StatCard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getAdminToken() {
  // Dashboard là server component — dùng admin hardcode để fetch stats
  const res = await fetch(`${API}/api/auth/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@nmen.vn", password: "admin123" }),
    cache: "no-store",
  });
  const data = await res.json();
  return data.token;
}

async function fetchStats(token) {
  const headers = { Authorization: `Bearer ${token}` };
  const [products, orders, users] = await Promise.all([
    fetch(`${API}/api/products`, { next: { revalidate: 30 } }).then((r) => r.json()),
    fetch(`${API}/api/orders`, { headers, cache: "no-store" }).then((r) => r.json()),
    fetch(`${API}/api/users`, { headers, cache: "no-store" }).then((r) => r.json()),
  ]);
  return { products, orders, users };
}

const STATUS_LABELS = {
  pending:    "Chờ xác nhận",
  confirmed:  "Đã xác nhận",
  processing: "Đang xử lý",
  shipping:   "Đang giao",
  delivered:  "Đã giao",
  cancelled:  "Đã hủy",
  returned:   "Trả hàng",
};

function StatusBadge({ status }) {
  const map = {
    pending:    "bg-yellow-100 text-yellow-700",
    confirmed:  "bg-sky-100 text-sky-700",
    processing: "bg-blue-100 text-blue-700",
    shipping:   "bg-indigo-100 text-indigo-700",
    delivered:  "bg-green-100 text-green-700",
    cancelled:  "bg-red-100 text-red-700",
    returned:   "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${map[status] || "bg-stone-100 text-stone-600"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default async function AdminDashboard() {
  const token = await getAdminToken();
  const { products, orders, users } = await fetchStats(token);

  const productList = Array.isArray(products) ? products : [];
  const orderList   = Array.isArray(orders)   ? orders   : [];
  const userList    = Array.isArray(users)     ? users    : [];

  const dangGiao    = orderList.filter((o) => o.status === "shipping").length;
  const tongDoanhThu = orderList
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.total_amount), 0);
  const recent5     = orderList.slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-black tracking-tight uppercase text-black">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">Xin chào, Admin! Đây là tổng quan hệ thống.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        <StatCard title="Tổng sản phẩm" value={productList.length} sub="Đang bán" icon={Package} color="bg-blue-50 text-blue-600" />
        <StatCard title="Tổng đơn hàng" value={orderList.length}   sub="Tất cả thời gian" icon={ShoppingBag} color="bg-green-50 text-green-600" />
        <StatCard title="Đang giao"     value={dangGiao}            sub="Cần xử lý" icon={Clock} color="bg-yellow-50 text-yellow-600" />
        <StatCard title="Người dùng"    value={userList.length}     sub="Đã đăng ký" icon={Users} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Bảng đơn gần đây */}
      <div className="bg-white border border-stone-100 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="font-headline text-lg font-bold uppercase tracking-tight text-black">Đơn hàng gần đây</h2>
          <Link href="/admin/orders" className="text-xs font-label text-stone-500 uppercase tracking-widest hover:text-black transition-colors underline underline-offset-4">
            Xem tất cả
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {["Mã đơn","Khách hàng","Ngày đặt","Trạng thái","Tổng tiền",""].map((h) => (
                  <th key={h} className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {recent5.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-label font-bold text-black">{order.order_number}</td>
                  <td className="px-6 py-4 text-stone-700">{order.customer_name}</td>
                  <td className="px-6 py-4 text-stone-500">
                    {new Date(order.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                  <td className="px-6 py-4 font-label font-bold text-black">
                    {Number(order.total_amount).toLocaleString("vi-VN")} đ
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="text-[10px] font-label uppercase tracking-widest text-stone-500 hover:text-black transition-colors underline underline-offset-4">
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Banner doanh thu */}
      <div className="mt-6 bg-black text-white p-6 flex items-center justify-between">
        <div>
          <p className="font-label text-xs uppercase tracking-widest text-stone-400 mb-1">Tổng doanh thu (đơn đã giao)</p>
          <p className="font-headline text-3xl font-black">{tongDoanhThu.toLocaleString("vi-VN")} đ</p>
        </div>
        <TrendingUp size={48} className="text-stone-600" />
      </div>
    </div>
  );
}
