"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ADMIN_PRODUCTS } from "@/constants/admin-data";

export default function AdminProductsPage() {
  // Dùng state để giả lập xóa sản phẩm
  const [products, setProducts] = useState(ADMIN_PRODUCTS);
  const [search, setSearch] = useState("");

  // Hàm xóa sản phẩm (chỉ xóa trên state, không có backend)
  const handleDelete = (id) => {
    const ok = confirm("Bạn có chắc muốn xóa sản phẩm này không?");
    if (ok) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  // Lọc sản phẩm theo tên tìm kiếm
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Tiêu đề + nút thêm mới */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline text-3xl font-black tracking-tight uppercase text-black">
            Sản phẩm
          </h1>
          <p className="text-stone-500 text-sm mt-1">{products.length} sản phẩm trong hệ thống</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-stone-800 transition-all active:scale-95"
        >
          <Plus size={16} />
          Thêm sản phẩm
        </Link>
      </div>

      {/* Ô tìm kiếm */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-stone-300 focus:border-black bg-white px-4 py-3 outline-none focus:ring-0 text-sm text-black transition-colors"
        />
      </div>

      {/* Bảng danh sách sản phẩm */}
      <div className="bg-white border border-stone-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Sản phẩm</th>
              <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Danh mục</th>
              <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Biến thể</th>
              <th className="text-left px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Tồn kho</th>
              <th className="text-right px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500">Giá</th>
              <th className="px-6 py-3 font-label text-[10px] uppercase tracking-widest text-stone-500 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                {/* Ảnh + Tên */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-16 bg-stone-100 relative overflow-hidden shrink-0">
                      <Image
                        src={product.image1}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-label font-bold text-black">{product.name}</p>
                      <p className="text-stone-400 text-xs font-label">ID: {product.id}</p>
                    </div>
                  </div>
                </td>
                {/* Danh mục */}
                <td className="px-6 py-4 text-stone-600">{product.category}</td>
                {/* Biến thể: màu sắc + số size */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 mb-1">
                    {(product.colors || []).map((c) => (
                      <span
                        key={c.hex}
                        title={c.name}
                        className="w-4 h-4 rounded-full border border-stone-200 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                  <p className="text-stone-400 text-xs">
                    {(product.colors || []).length} màu &times; {(product.sizes || []).length} size
                  </p>
                </td>
                {/* Tồn kho tổng */}
                <td className="px-6 py-4">
                  {(() => {
                    const total = (product.variants || []).reduce((s, v) => s + (v.stock || 0), 0);
                    return (
                      <span className={`font-label text-xs font-bold ${total < 10 ? "text-red-600" : "text-green-600"}`}>
                        {total} cái
                      </span>
                    );
                  })()}
                </td>
                {/* Giá */}
                <td className="px-6 py-4 text-right font-label font-bold text-black">
                  {product.price.toLocaleString("vi-VN")} đ
                </td>
                {/* Nút thao tác */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="p-2 text-stone-500 hover:text-black hover:bg-stone-100 rounded transition-colors"
                      title="Sửa"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Không có sản phẩm nào */}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-stone-400 text-sm">
                  Không tìm thấy sản phẩm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
