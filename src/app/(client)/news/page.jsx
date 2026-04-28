import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function fetchNews(page = 1) {
  try {
    const res = await fetch(`${BASE}/api/news?page=${page}&limit=12`, { cache: "no-store" });
    return res.json();
  } catch {
    return { data: [], total: 0 };
  }
}

export const metadata = {
  title: "Tin tức — NMen",
  description: "Cập nhật xu hướng thời trang nam mới nhất từ NMen.",
};

export default async function NewsPage() {
  const { data: articles, total } = await fetchNews();

  return (
    <div className="min-h-screen bg-stone-50 pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Title */}
        <div className="mb-12">
          <h1 className="font-headline text-5xl font-black tracking-tighter uppercase text-black">Tin tức</h1>
          <p className="text-stone-500 mt-2">{total} bài viết</p>
        </div>

        {articles.length === 0 ? (
          <p className="text-stone-400 text-center py-20">Chưa có bài viết nào.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link key={article.id} href={`/news/${article.slug}`}
                className="group bg-white border border-stone-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Thumbnail */}
                <div className="aspect-video overflow-hidden bg-stone-100">
                  {article.image ? (
                    <img
                      src={article.image.startsWith("/uploads") ? `${BASE}${article.image}` : article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs uppercase tracking-widest">
                      Không có ảnh
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="text-[10px] text-stone-400 font-label uppercase tracking-widest mb-2">
                    {article.author && <span>{article.author} · </span>}
                    {new Date(article.created_at).toLocaleDateString("vi-VN")}
                  </p>
                  <h2 className="font-headline font-bold text-black leading-snug mb-2 line-clamp-2 group-hover:underline underline-offset-2">
                    {article.title}
                  </h2>
                  {article.short_description && (
                    <p className="text-stone-500 text-sm line-clamp-2">{article.short_description}</p>
                  )}
                  <p className="mt-3 text-xs font-bold uppercase tracking-widest text-black group-hover:gap-2 transition-all">
                    Đọc tiếp →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
