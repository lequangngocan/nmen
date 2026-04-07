import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import MobileFilterDrawer from "@/components/MobileFilterDrawer";
import { MOCK_NEW_ARRIVALS } from "@/constants/products";
import { ChevronDown } from "lucide-react";

export default function ClothingPage() {
  // Duplicate mock products to simulate catalog content
  const catalogProducts = [...MOCK_NEW_ARRIVALS, ...MOCK_NEW_ARRIVALS, ...MOCK_NEW_ARRIVALS];

  return (
    <main className="min-h-screen px-6 md:px-12 max-w-screen-2xl mx-auto">
      <header className="mb-10">
        <Breadcrumbs />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-2">
          <div>
            <h1 className="text-6xl font-headline font-black tracking-tighter uppercase leading-none text-black">
              Áo Khoác Nam
            </h1>
            <p className="mt-4 text-stone-500 max-w-xl font-body text-sm leading-relaxed uppercase tracking-wide">
              Tuyển tập những thiết kế áo khoác tinh xảo dành riêng cho phong cách sống hiện đại.
            </p>
          </div>
          
          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
            {/* Mobile Filter Button & Drawer Modal */}
            <MobileFilterDrawer />

            {/* Sort Dropdown */}
            <div className="flex-1 md:flex-none flex items-center space-x-4 border-b border-black pb-2 min-w-[140px] md:min-w-[200px] justify-between cursor-pointer group relative">
              <span className="font-headline font-bold text-xs uppercase tracking-tighter text-black">Sắp xếp: Nổi bật</span>
              <ChevronDown size={14} className="text-black" />
              
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-10">
                {["Nổi bật", "Giá: Thấp đến Cao", "Giá: Cao đến Thấp", "Hàng mới nhất"].map((v) => (
                  <div key={v} className="px-4 py-3 text-[10px] font-label text-stone-500 hover:bg-stone-50 hover:text-black uppercase tracking-widest transition-colors">
                    {v}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-12 pb-24">
        <FilterSidebar />

        {/* Main Content */}
        <div className="flex-1">

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-x-4 md:gap-y-12">
            {catalogProducts.map((product, idx) => (
              <ProductCard key={`${product.id}-${idx}`} product={product} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
