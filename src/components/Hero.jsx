import Image from "next/image";
import Link from "next/link";

/**
 * Hero component — extracted from Stitch design: "NMen Homepage (Short Hero)"
 *
 * Design spec:
 *   Container:  h-[70vh], relative, overflow-hidden, flex items-center
 *   Image:      object-cover, object-[center_25%], grayscale → hover:grayscale-0
 *   Overlay:    bg-black/5 (keeps image light, editorial feel)
 *   Content:    px-12 md:px-24, left-aligned, max-w-4xl
 *   Tagline:    font-label text-xs tracking-[0.3em] uppercase opacity-70
 *   H1:         text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.85]
 *   Button:     bg-primary text-on-primary, hover → bg-tertiary (invert-like shift)
 *   Side tag:   bottom-8 right-12, vertical-rl rotate-180, hidden on mobile
 *
 * Mobile adaptations:
 *   - Image focal point shifts to object-[center_top] on mobile so face isn't cropped
 *   - Text size scales down (text-5xl → responsive)
 *   - Content baseline shifts to bottom-third via pt-[45%] sm:pt-0 on small screens
 */
export default function Hero() {
  return (
    <header
      className={[
        "relative w-full overflow-hidden",
        // Height: Fix chiều cao ở 60vh-65vh để tạo dáng "Short Hero" đúng nghĩa, không bị cao quá.
        "h-[60vh] md:h-[65vh] min-h-[500px]",
        // Để text nằm dưới đáy trên mobile (tránh đè lên áo tối màu) và căn giữa trên desktop
        "flex items-end pb-16 sm:pb-0 sm:items-center sm:pt-20",
      ].join(" ")}
    >
      {/* ── Background image ───────────────────────────────────────────────
          next/image fill = CSS position:absolute, fills parent container.
          priority: above-the-fold → no lazy loading.
          Grayscale by default, color on hover (editorial surprise effect). */}
      <div className="absolute inset-0 bg-surface-container-low">
        <Image
          src="/images/img_11d163a2.jpg"
          alt="Editorial portrait of a male model in a black tailored suit"
          fill
          priority
          sizes="100vw"
          className={[
            "object-cover",
            // Đặt object-position ở center 20% giúp lộ cằm người mẫu và không bị crop quá cận
            "object-[center_20%]",
            // Grayscale → color reveal on hover (editorial feel)
            "grayscale hover:grayscale-0 transition-all duration-1000",
          ].join(" ")}
        />

        {/* Subtle dark overlay — keeps text readable, matches design `bg-black/5` */}
        <div className="absolute inset-0 bg-black/5" />

        {/* Desktop gradient: left-to-right fade out over the dark jacket so black text pops */}
        <div className="absolute inset-y-0 left-0 w-[50%] bg-linear-to-r from-[#f9f9f9]/80 via-[#f9f9f9]/40 to-transparent hidden sm:block pointer-events-none" />

        {/* Mobile gradient: Heavy fade from bottom matching the surface background so black text is legible */}
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-linear-to-t from-[#f9f9f9] via-[#f9f9f9]/90 to-transparent sm:hidden pointer-events-none" />
      </div>

      {/* ── Content overlay ────────────────────────────────────────────────
          Sau khi pt-20 ở container, nội dung sẽ nằm gọn gàng ở gữa nửa dưới màn hình. */}
      <div className="relative z-10 w-full px-6 sm:px-12 md:px-24">
        <div className="max-w-4xl">

          {/* Tagline */}
          <p className="font-label text-xs tracking-[0.3em] uppercase mb-4 opacity-70 text-black">
            Khơi nguồn cảm hứng mới
          </p>

          {/* H1 — design: leading-[0.85], tracking-tighter, UPPERCASE */}
          <h1 className="font-headline font-extrabold tracking-tighter text-black uppercase leading-[0.85] mb-8 text-5xl sm:text-6xl md:text-7xl">
            TÁI ĐỊNH NGHĨA
            <br />
            PHONG CÁCH
          </h1>

          {/* CTA Button
              Design token: bg-primary (#000) text-on-primary (#e2e2e2)
              Hover state from design: hover:bg-tertiary (#3b3b3b)
              Added border variant hover for stronger "Invert" feel:
              hover:bg-white hover:text-black hover:border-black          */}
          <Link
            href="/all"
            className={[
              "inline-block",
              // Base — filled black button
              "bg-primary text-on-primary",
              // Spacing from design spec
              "px-10 md:px-12 py-4",
              // Typography
              "font-headline font-bold uppercase text-xs tracking-widest",
              // Hover: invert to white with black border (stronger than bg-tertiary)
              "border border-primary",
              "hover:bg-white hover:text-black",
              "transition-all duration-200 active:scale-95",
            ].join(" ")}
          >
            Trải nghiệm ngay
          </Link>
        </div>
      </div>

      {/* ── Side editorial tag — hidden on mobile ─────────────────────────
          Design: bottom-8 right-12, vertical text rotated 180deg, opacity-40 */}
      <div className="absolute bottom-8 right-6 md:right-12 hidden sm:block">
        <p
          className="font-label text-[10px] uppercase tracking-widest opacity-40 text-black"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          NMEN - KHẲNG ĐỊNH BẢN LĨNH PHÁI MẠNH
        </p>
      </div>
    </header>
  );
}
