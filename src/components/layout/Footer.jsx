import Link from "next/link";

const shopLinks = [
  { label: "Hàng mới về", href: "/all" },
  { label: "Tất cả sản phẩm", href: "/all" },
  { label: "Phụ kiện", href: "/phu-kien" },
];

const assistanceLinks = [
  { label: "Hỏi đáp (FAQs)", href: "/pages/faq" },
  { label: "Vận chuyển", href: "/pages/van-chuyen" },
  { label: "Điều khoản", href: "/pages/dieu-khoan-dich-vu" },
];

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* Design spec from NMen Master Layout Base:
   bg: bg-stone-100
   padding: pt-24 pb-12
   columns: grid grid-cols-4 gap-12 px-12
   Typography: font-body = Work Sans, xs, uppercase, tracking-widest, leading-loose
   Bottom bar: border-t border-stone-200 pt-8, flex justify-between
*/
export default function Footer({ settings = {} }) {
  const connectLinks = [];
  if (settings.instagram_url) connectLinks.push({ label: "Instagram", href: settings.instagram_url });
  if (settings.facebook_url) connectLinks.push({ label: "Facebook", href: settings.facebook_url });

  return (
    <footer className="w-full pt-16 md:pt-24 pb-12 bg-stone-100">
      {/* Main grid: 4 columns on desktop, stacked on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 px-6 md:px-12 max-w-screen-2xl mx-auto">

        {/* Col 1: Brand + Tagline */}
        <div className="col-span-2 md:col-span-1">
          {settings.logo_url ? (
            <div className="mb-5">
              <img 
                src={settings.logo_url.startsWith("/uploads") ? `${BASE}${settings.logo_url}` : settings.logo_url} 
                alt={settings.site_name || "NMen"} 
                className="h-8 object-contain" 
              />
            </div>
          ) : (
            <div className="text-xl font-black text-black mb-5 font-headline tracking-tighter uppercase">
              {settings.site_name || "NMen"}
            </div>
          )}
          <p className="font-body text-xs uppercase tracking-widest leading-loose text-stone-500 max-w-[200px]">
            {settings.description || "Định hình phong cách hiện đại từ 2024."}
          </p>
        </div>

        {/* Col 2: Shop */}
        <div className="col-span-1 flex flex-col space-y-4">
          <span className="font-body text-xs uppercase tracking-widest font-bold text-black">
            Cửa hàng
          </span>
          {shopLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-body text-xs uppercase tracking-widest leading-loose text-stone-500 hover:text-black underline decoration-1 underline-offset-4 transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Col 3: Assistance */}
        <div className="col-span-1 flex flex-col space-y-4">
          <span className="font-body text-xs uppercase tracking-widest font-bold text-black">
            Hỗ trợ
          </span>
          {assistanceLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-body text-xs uppercase tracking-widest leading-loose text-stone-500 hover:text-black underline decoration-1 underline-offset-4 transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Col 4: Connect / Social */}
        <div className="col-span-2 md:col-span-1 flex flex-col space-y-4">
          <span className="font-body text-xs uppercase tracking-widest font-bold text-black">
            Kết nối
          </span>
          <div className="flex space-x-6">
            {connectLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs uppercase tracking-widest leading-loose text-stone-500 hover:text-black underline decoration-1 underline-offset-4 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar: border-t, flex justify-between
          Design spec: mt-24 px-12, copyright left / locale right */}
      <div className="mt-16 md:mt-24 px-6 md:px-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-stone-200 pt-8 max-w-screen-2xl mx-auto">
        <p className="font-body text-xs uppercase tracking-widest leading-loose text-stone-400">
          © {new Date().getFullYear()} {settings.site_name || "NMen"}. Bản quyền thuộc về {settings.site_name || "NMen"}.
        </p>
        <div className="flex space-x-8">
          <span className="font-label text-[10px] uppercase tracking-widest text-stone-400">
            Phiên Bản Toàn Cầu
          </span>
          <span className="font-label text-[10px] uppercase tracking-widest text-stone-400">
            VN / VND
          </span>
        </div>
      </div>
    </footer>
  );
}
