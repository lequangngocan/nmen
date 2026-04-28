"use client";

import { useRouter } from "next/navigation";
import NewsForm from "@/components/admin/NewsForm";
import { apiPost } from "@/lib/api";

export default function AdminNewsCreatePage() {
  const router = useRouter();

  const handleSubmit = async (form) => {
    const res = await apiPost("/api/news", form);
    if (res.id) {
      router.push(`/admin/news/${res.id}`);
    } else {
      throw new Error(res.message || "Lỗi khi tạo bài viết");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-black tracking-tight uppercase text-black">Viết bài mới</h1>
      </div>
      <NewsForm onSubmit={handleSubmit} submitLabel="Xuất bản" />
    </div>
  );
}
