import Link from "next/link";
import { notFound } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function fetchArticle(slug) {
  try {
    const res = await fetch(`${BASE}/api/news/slug/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  if (!article) return { title: "Không tìm thấy — NMen" };
  return {
    title: `${article.title} — NMen`,
    description: article.short_description || "",
  };
}

export default async function NewsDetailPage({ params }) {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  if (!article) notFound();

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      {/* Thumbnail */}
      {article.image && (
        <div className="w-full max-h-[480px] overflow-hidden bg-stone-100">
          <img
            src={article.image.startsWith("/uploads") ? `${BASE}${article.image}` : article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 md:px-12 mt-12">
        {/* Breadcrumb */}
        <nav className="text-xs text-stone-400 font-label uppercase tracking-widest mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-black transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/news" className="hover:text-black transition-colors">Tin tức</Link>
          <span>/</span>
          <span className="text-black">{article.title}</span>
        </nav>

        {/* Meta */}
        <div className="mb-6">
          <p className="text-[10px] text-stone-400 font-label uppercase tracking-widest mb-3">
            {article.author && <span>{article.author} · </span>}
            {new Date(article.created_at).toLocaleDateString("vi-VN", {
              year: "numeric", month: "long", day: "numeric"
            })}
          </p>
          <h1 className="font-headline text-4xl font-black tracking-tight text-black leading-tight">
            {article.title}
          </h1>
          {article.short_description && (
            <p className="text-stone-500 mt-4 text-lg leading-relaxed">{article.short_description}</p>
          )}
        </div>

        <hr className="border-stone-100 mb-8" />

        {/* Nội dung */}
        {article.description ? (
          <div
            className="news-content prose prose-stone max-w-none text-stone-700 text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.description }}
          />
        ) : (
          <p className="text-stone-300 italic">Chưa có nội dung.</p>
        )}

        {/* Back */}
        <div className="mt-16">
          <Link href="/news"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-black transition-colors">
            ← Quay lại tin tức
          </Link>
        </div>
      </div>
    </div>
  );
}
