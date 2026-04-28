"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Search, X, ShoppingBag } from "lucide-react";

const ALL_STATUSES = ["pending", "confirmed", "processing", "shipping", "delivered", "cancelled", "returned"];
const PAYMENT_METHODS = ["COD", "Sepay"];

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
    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${map[status] || "bg-stone-100 text-stone-600"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  // các bộ lọc
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo]     = useState("");
  const [filterMinTotal, setFilterMinTotal] = useState("");
  const [filterMaxTotal, setFilterMaxTotal] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | total_asc | total_desc

  useEffect(() => {
    setLoading(true);
    apiGet("/api/orders")
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const hasFilter = search || filterStatus || filterPayment || filterDateFrom || filterDateTo || filterMinTotal || filterMaxTotal;

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("");
    setFilterPayment("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterMinTotal("");
    setFilterMaxTotal("");
  };

  // lọc + sắp xếp hoàn toàn ở client
  const filtered = useMemo(() => {
    let result = orders.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch = !q
        || o.order_number?.toLowerCase().includes(q)
        || o.customer_name?.toLowerCase().includes(q)
        || o.email?.toLowerCase().includes(q)
        || o.phone?.includes(q);

      const matchStatus  = !filterStatus  || o.status === filterStatus;
      const matchPayment = !filterPayment || o.payment_method === filterPayment;

      const orderDate = new Date(o.created_at);
      const matchFrom = !filterDateFrom || orderDate >= new Date(filterDateFrom);
      const matchTo   = !filterDateTo   || orderDate <= new Date(filterDateTo + "T23:59:59");

      const total = Number(o.total_amount);
      const matchMin = !filterMinTotal || total >= Number(filterMinTotal);
      const matchMax = !filterMaxTotal || total <= Number(filterMaxTotal);

      return matchSearch && matchStatus && matchPayment && matchFrom && matchTo && matchMin && matchMax;
    });

    // sắp xếp
    if (sortBy === "oldest")     result = [...result].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (sortBy === "total_asc")  result = [...result].sort((a, b) => Number(a.total_amount) - Number(b.total_amount));
    if (sortBy === "total_desc") result = [...result].sort((a, b) => Number(b.total_amount) - Number(a.total_amount));
    // newest = mặc định từ API (DESC)
    return result;
  }, [orders, search, filterStatus, filterPayment, filterDateFrom, filterDateTo, filterMinTotal, filterMaxTotal, sortBy]);

  // thống kê nhanh theo trạng thái
  const statusCounts = useMemo(() =>
    ALL_STATUSES.reduce((acc, s) => {
      acc[s] = orders.filter((o) => o.status === s).length; return acc;
    }, {}),
    [orders]
  );

  const totalRevenue = useMemo(
    () => orders.filter((o) => o.status === "delivered").reduce((s, o) => s + Number(o.total_amount), 0),
    [orders]
  );

  const inputClass = "border border-stone-300 focus:border-black bg-white px-3 py-2 outline-none text-sm text-stone-700 transition-colors";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <ShoppingBag size={22} className="text-stone-600" />
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Đơn hàng</h1>
          <p className="text-sm text-stone-500 mt-0.5">{orders.length} đơn hàng</p>
        </div>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-3 md:grid-cols-8 gap-3 mb-8">
        {ALL_STATUSES.map((s) => {
          const colorMap = {
            pending:    "border-yellow-200 bg-yellow-50 text-yellow-700",
            confirmed:  "border-sky-200 bg-sky-50 text-sky-700",
            processing: "border-blue-200 bg-blue-50 text-blue-700",
            shipping:   "border-indigo-200 bg-indigo-50 text-indigo-700",
            delivered:  "border-green-200 bg-green-50 text-green-700",
            cancelled:  "border-red-200 bg-red-50 text-red-700",
            returned:   "border-orange-200 bg-orange-50 text-orange-700",
          };
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
              className={`border rounded-lg p-3 text-left transition-all ${filterStatus === s ? colorMap[s] + " ring-2 ring-offset-1 ring-current" : "border-stone-200 bg-white hover:border-stone-300"}`}
            >
              <p className="text-2xl font-bold text-stone-900">{statusCounts[s] || 0}</p>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-0.5">{STATUS_LABELS[s]}</p>
            </button>
          );
        })}
        <div className="border border-stone-200 bg-white rounded-lg p-3">
          <p className="text-lg font-bold text-stone-900">{totalRevenue.toLocaleString("vi-VN")} đ</p>
          <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-0.5">Doanh thu</p>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 mb-5 space-y-3">
        <div className="flex flex-wrap gap-3">
          {/* Tìm kiếm */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Mã đơn, tên, email, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`pl-9 pr-3 py-2 w-full ${inputClass}`}
            />
          </div>

          {/* Trạng thái */}
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputClass}>
            <option value="">Tất cả trạng thái</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>

          {/* Phương thức TT */}
          <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className={inputClass}>
            <option value="">Tất cả phương thức</option>
            {PAYMENT_METHODS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* Sắp xếp */}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={inputClass}>
            <option value="newest">Mới nhất trước</option>
            <option value="oldest">Cũ nhất trước</option>
            <option value="total_desc">Tổng tiền: cao → thấp</option>
            <option value="total_asc">Tổng tiền: thấp → cao</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Khoảng ngày */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Từ</span>
            <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className={inputClass} />
            <span className="text-xs text-stone-500">đến</span>
            <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className={inputClass} />
          </div>

          {/* Khoảng tiền */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Tiền</span>
            <input
              type="number"
              placeholder="Tối thiểu"
              value={filterMinTotal}
              onChange={(e) => setFilterMinTotal(e.target.value)}
              className={`${inputClass} w-32`}
            />
            <span className="text-xs text-stone-500">—</span>
            <input
              type="number"
              placeholder="Tối đa"
              value={filterMaxTotal}
              onChange={(e) => setFilterMaxTotal(e.target.value)}
              className={`${inputClass} w-32`}
            />
          </div>

          <button
              onClick={clearFilters}
              disabled={!hasFilter}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-stone-300 text-stone-600 hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-stone-300 disabled:hover:text-stone-600 disabled:hover:bg-transparent"
            >
              <X size={12} /> Xóa bộ lọc
            </button>
          <span className="ml-auto text-sm text-stone-500 self-center">
            {filtered.length} / {orders.length} đơn
          </span>
        </div>
      </div>

      {/* Bảng */}
      <div className="bg-white border border-stone-200 shadow-sm overflow-x-auto rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              {["Mã đơn", "Khách hàng", "Ngày đặt", "Phương thức", "Trạng thái", "Tổng tiền", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-stone-400 text-sm">Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-stone-400 text-sm">Không có đơn hàng nào phù hợp.</td></tr>
            ) : filtered.map((order) => (
              <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-5 py-3.5">
                  <span className="font-mono font-bold text-stone-800 text-xs">{order.order_number}</span>
                </td>
                <td className="px-5 py-3.5">
                  <p className="font-medium text-stone-900">{order.customer_name}</p>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <a href={`mailto:${order.email}`} className="text-xs text-stone-400 hover:text-black transition-colors">{order.email}</a>
                    {order.phone && <a href={`tel:${order.phone}`} className="text-xs text-stone-400 hover:text-black transition-colors">{order.phone}</a>}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-stone-500 text-xs whitespace-nowrap">
                  {new Date(order.created_at).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs text-stone-600 font-medium">{order.payment_method}</span>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-5 py-3.5 font-bold text-stone-800 whitespace-nowrap">
                  {Number(order.total_amount).toLocaleString("vi-VN")} đ
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-[10px] font-label uppercase tracking-widest text-stone-500 hover:text-black transition-colors underline underline-offset-4 whitespace-nowrap"
                  >
                    Chi tiết →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
