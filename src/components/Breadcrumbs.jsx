"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ product, categoryName }) {
  const pathname = usePathname();
  const paths = pathname.split("/").filter((path) => path);

  if (product && pathname.startsWith("/product/")) {
    return (
      <nav aria-label="Breadcrumb" className="py-4">
        <ol className="flex flex-wrap items-center gap-2 text-xs font-label uppercase tracking-widest text-stone-400">
          <li>
            <Link href="/" className="hover:text-black transition-colors whitespace-nowrap">
              Trang chủ
            </Link>
          </li>
          <li className="flex items-center gap-2">
            <ChevronRight size={12} className="text-stone-300 shrink-0" />
            <Link href="/all" className="hover:text-black transition-colors whitespace-nowrap">
              Cửa hàng
            </Link>
          </li>
          {product.category_slug && (
            <li className="flex items-center gap-2">
              <ChevronRight size={12} className="text-stone-300 shrink-0" />
              <Link href={`/${product.category_slug}`} className="hover:text-black transition-colors whitespace-nowrap">
                {product.category_name || product.category_slug.replace(/-/g, " ")}
              </Link>
            </li>
          )}
          <li className="flex items-center gap-2">
            <ChevronRight size={12} className="text-stone-300 shrink-0" />
            <span className="text-black font-semibold whitespace-nowrap" aria-current="page">
              {product.name}
            </span>
          </li>
        </ol>
      </nav>
    );
  }

  const pathTranslations = {
    all: "Cửa hàng",
    product: "Sản phẩm",
    cart: "Giỏ hàng",
    checkout: "Thanh toán",
    account: "Tài khoản",
    history: "Đơn mua",
    wishlist: "Yêu thích",
    login: "Đăng nhập",
    register: "Đăng ký",
    news: "Tin tức",
  };

  const breadcrumbs = paths.map((path, index) => {
    return {
      href: `/${paths.slice(0, index + 1).join("/")}`,
      label: pathTranslations[path] || decodeURIComponent(path).replace(/-/g, " "),
    };
  });

  if (categoryName && paths.length === 1 && !pathTranslations[paths[0]]) {
    breadcrumbs[0].label = categoryName;
  }

  if (pathname.startsWith("/product/") && breadcrumbs.length > 1) {
    breadcrumbs[breadcrumbs.length - 1].label = "Chi tiết";
  }

  return (
    <nav aria-label="Breadcrumb" className="py-4">
      <ol className="flex flex-wrap items-center gap-2 text-xs font-label uppercase tracking-widest text-stone-400">
        <li>
          <Link href="/" className="hover:text-black transition-colors whitespace-nowrap">
            Trang chủ
          </Link>
        </li>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight size={12} className="text-stone-300 shrink-0" />
              {isLast ? (
                <span className="text-black font-semibold whitespace-nowrap" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="hover:text-black transition-colors whitespace-nowrap">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
