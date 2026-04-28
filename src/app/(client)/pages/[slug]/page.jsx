import { notFound } from "next/navigation";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getPage(slug) {
  try {
    const res = await fetch(`${BASE}/api/pages/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const page = await getPage(resolvedParams.slug);
  if (!page) return { title: "Không tìm thấy trang" };
  return { title: page.title };
}

export default async function StaticPage({ params }) {
  const resolvedParams = await params;
  const page = await getPage(resolvedParams.slug);
  if (!page) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-headline text-4xl font-black tracking-tight uppercase text-black mb-8">
        {page.title}
      </h1>
      <div 
        className="prose max-w-none text-stone-600 leading-relaxed text-sm"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
