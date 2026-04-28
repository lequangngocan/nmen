"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import NewsForm from "@/components/admin/NewsForm";
import { apiGet, apiPut } from "@/lib/api";

export default function AdminNewsEditPage() {
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    apiGet(`/api/news/admin/${id}`)
      .then((data) => setInitialData(data.id ? data : null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (form) => {
    const res = await apiPut(`/api/news/${id}`, form);
    if (res.message === "Cập nhật thành công") {
      setToast("✅ Đã lưu");
      setTimeout(() => setToast(""), 3000);
    } else {
      throw new Error(res.message || "Lỗi khi lưu");
    }
  };

  if (loading) return <div className="text-stone-400 py-10 text-center text-sm">Đang tải...</div>;
  if (!initialData) return <div className="text-red-500 py-10 text-center text-sm">Không tìm thấy bài viết.</div>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-headline text-2xl font-black tracking-tight uppercase text-black line-clamp-1">
          {initialData.title}
        </h1>
        {toast && <span className="text-xs text-green-600">{toast}</span>}
      </div>
      <NewsForm initialData={initialData} onSubmit={handleSubmit} submitLabel="Lưu thay đổi" />
    </div>
  );
}
