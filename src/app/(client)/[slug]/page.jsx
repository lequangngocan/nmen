import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import MobileFilterDrawer from "@/components/MobileFilterDrawer";
import SortDropdown from "@/components/SortDropdown";
import { normalizeProduct } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function fetchProducts(paramsObj) {
  try {
    const params = new URLSearchParams();
    if (paramsObj.category) params.set('category', paramsObj.category);
    if (paramsObj.search)   params.set('search', paramsObj.search);
    if (paramsObj.size)     params.set('size', paramsObj.size);
    if (paramsObj.color)    params.set('color', paramsObj.color);
    if (paramsObj.maxPrice) params.set('maxPrice', paramsObj.maxPrice);
    if (paramsObj.sort)     params.set('sort', paramsObj.sort);

    const res = await fetch(`${API}/api/products?${params}`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return Array.isArray(data) ? data.map(normalizeProduct) : [];
  } catch {
    return [];
  }
}

async function fetchCategoryName(slug) {
  if (!slug) return null;
  try {
    const res = await fetch(`${API}/api/categories`);
    const data = await res.json();
    const findName = (nodes) => {
       if (!Array.isArray(nodes)) return null;
       for (const n of nodes) {
          if (n.slug === slug) return n.name;
          if (n.children) {
             const childName = findName(n.children);
             if (childName) return childName;
          }
       }
       return null;
    }
    return findName(data) || slug.replace(/-/g, " ");
  } catch {
    return slug.replace(/-/g, " ");
  }
}

export default async function CategoryPage({ params, searchParams }) {
  // Await params and searchParams in Next 15+
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const searchP = await searchParams;
  
  const isAll = slug === 'all' || slug === 'clothing';
  const categoryParam = isAll ? undefined : slug;
  
  const fetchParams = { ...searchP };
  if (categoryParam) fetchParams.category = categoryParam;

  const products = await fetchProducts(fetchParams);
  const categoryName = isAll ? null : await fetchCategoryName(slug);

  const sortOptions = [
    { label: "Nổi bật", value: "latest" },
    { label: "Giá: Thấp đến Cao", value: "price_asc" },
    { label: "Giá: Cao đến Thấp", value: "price_desc" }
  ];

  return (
    <main className="min-h-screen px-6 md:px-12 max-w-screen-2xl mx-auto">
      <header className="mb-10">
        <Breadcrumbs categoryName={categoryName} />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-2">
          <div>
            <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter uppercase leading-none text-black">
              {categoryName ? `Danh mục: ${categoryName}` : 'Tất cả sản phẩm'}
            </h1>
            <p className="mt-4 text-stone-500 max-w-xl font-body text-sm leading-relaxed uppercase tracking-wide">
              {products.length} sản phẩm
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-12 pb-24">
        <FilterSidebar />
        <div className="flex-1">
          <div className="flex flex-row items-end justify-between mb-6 w-full gap-4">
            <div className="flex-1 lg:hidden">
              <MobileFilterDrawer />
            </div>
            <div className="hidden lg:block flex-1"></div>
            
            <div className="shrink-0">
              <SortDropdown 
                sortOptions={sortOptions} 
                defaultSortValue="latest" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-x-4 md:gap-y-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {products.length === 0 && (
            <p className="text-center py-20 text-stone-400 uppercase tracking-widest text-sm">
              Không tìm thấy sản phẩm
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
