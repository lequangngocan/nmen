"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter((path) => path);

  return (
    <nav aria-label="Breadcrumb" className="py-4">
      <ol className="flex items-center space-x-2 text-xs font-label uppercase tracking-widest text-stone-400">
        <li>
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
        </li>
        {paths.map((path, index) => {
          const href = `/${paths.slice(0, index + 1).join("/")}`;
          const isLast = index === paths.length - 1;
          const label = path.replace(/-/g, " ");

          return (
            <li key={path} className="flex items-center space-x-2">
              <ChevronRight size={12} className="text-stone-300" />
              {isLast ? (
                <span className="text-black font-semibold" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link href={href} className="hover:text-black transition-colors">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
