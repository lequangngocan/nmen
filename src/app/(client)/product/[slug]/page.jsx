"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { Heart, Star, ChevronDown, Loader2, ImageOff } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { apiGet, normalizeProduct, getFullUrl } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function ProductDetailPage(props) {
  const params = use(props.params);
  const { slug } = params;

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected state
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await apiGet(`/api/products/slug/${slug}`);
        if (!data.id) throw new Error("Sản phẩm không tồn tại");

        const normalized = {
          ...normalizeProduct(data),
          variants: data.variants || [],
        };
        setProduct(normalized);

        // Pre-select first color and size if available
        const colors = [...new Set(normalized.variants.map((v) => v.color_hex))];
        if (colors.length > 0) setSelectedColor(colors[0]);

        const sizes = [...new Set(normalized.variants.map((v) => v.size))];
        if (sizes.length > 0) setSelectedSize(sizes[0]);

        // Fetch related products (same category)
        const relatedData = await apiGet(`/api/products?category=${normalized.category_slug}`);
        if (Array.isArray(relatedData)) {
          setRelated(
            relatedData
              .filter((p) => p.id !== normalized.id)
              .slice(0, 3)
              .map(normalizeProduct)
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert("Vui lòng chọn Màu sắc và Kích thước!");
      return;
    }
    const variant = product.variants.find(
      (v) => v.color_hex === selectedColor && v.size === selectedSize
    );
    const colorName = product.variants.find((v) => v.color_hex === selectedColor)?.color_name || '';
    addToCart(
      { ...product, selectedColorName: colorName },
      1,
      selectedSize,
      selectedColor,
      variant?.id || null
    );
    alert("Đã thêm vào giỏ hàng!");
  };

  const handleAddToWishlist = async () => {
    await toggleWishlist(product);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface font-headline uppercase tracking-widest text-stone-500">
        Sản phẩm không tồn tại
      </div>
    );
  }

  // Unique colors and sizes
  const uniqueColors = Array.from(new Set(product.variants.map((v) => v.color_hex)));
  const uniqueSizes = Array.from(new Set(product.variants.map((v) => v.size)));

  // Tìm variant đang chọn để xem còn hàng không
  const currentVariant = product.variants.find(
    (v) => v.color_hex === selectedColor && v.size === selectedSize
  );
  const inStock = currentVariant ? currentVariant.stock > 0 : false;
  const inWishlist = product ? isInWishlist(product.id) : false;

  return (
    <div className="min-h-screen px-0 mx-auto w-full">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        <div className="lg:col-span-7 bg-stone-200 flex flex-col gap-0">
          <div className="aspect-4/5 w-full overflow-hidden relative">
            {product.images && product.images.length > 0 ? (
              <Image
                src={getFullUrl(product.images[0].image_url)}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-300">
                <ImageOff size={48} strokeWidth={1} />
                <span className="mt-3 text-xs font-label uppercase tracking-widest">Chưa có ảnh</span>
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className={`grid ${product.images.length === 2 ? 'grid-cols-1' : 'grid-cols-2'} gap-0 border-t border-stone-300`}>
              {product.images.slice(1).map((img, idx) => (
                <div key={idx} className="aspect-square relative bg-stone-100 border-r border-b border-stone-200">
                                    <Image
                    src={getFullUrl(img.image_url)}
                    alt={`${product.name} - ảnh ${idx + 2}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 px-8 lg:px-20 pt-8 pb-12 lg:pt-8 lg:pb-24 lg:sticky lg:top-24 self-start bg-surface">
          <div className="flex flex-col gap-12">
            <div className="space-y-4 text-left">
              <Breadcrumbs product={product} />
              <p className="font-label text-xs uppercase tracking-[0.2em] text-stone-500 mt-4">
                {product.category_name || "Sản phẩm"}
              </p>
              <h1 className="font-headline text-5xl font-extrabold tracking-tighter leading-none">
                {product.name}
              </h1>
              <p className="font-label text-sm uppercase tracking-widest text-stone-500">
                SKU: {product.sku || (currentVariant && currentVariant.sku) || "N/A"}
              </p>
              <div className="flex items-center gap-4">
                {product.sale_price ? (
                  <>
                    <p className="font-headline text-3xl font-bold text-red-600">
                      {new Intl.NumberFormat("vi-VN").format(product.sale_price)} đ
                    </p>
                    <p className="font-headline text-xl font-light text-stone-400 line-through">
                      {new Intl.NumberFormat("vi-VN").format(product.price)} đ
                    </p>
                  </>
                ) : (
                  <p className="font-headline text-3xl font-light text-black">
                    {new Intl.NumberFormat("vi-VN").format(product.price)} đ
                  </p>
                )}
              </div>
            </div>

            <div className="w-full h-px bg-stone-200"></div>

            <div className="space-y-8">
              {uniqueColors.length > 0 && (
                <div className="space-y-4">
                  <span className="font-label text-[10px] uppercase tracking-widest text-stone-500">
                    Chọn màu
                  </span>
                  <div className="flex gap-4">
                    {uniqueColors.map((color) => {
                      const colorName = product.variants.find((v) => v.color_hex === color)?.color_name || color;
                      return (
                        <button
                          key={color}
                          title={colorName}
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 rounded-full border border-stone-300 cursor-pointer ${
                            selectedColor === color ? "ring-2 ring-offset-2 ring-black opacity-100" : "opacity-50 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: color }}
                        ></button>
                      );
                    })}
                  </div>
                </div>
              )}

              {uniqueSizes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="font-label text-[10px] uppercase tracking-widest text-stone-500">
                      Chọn Size
                    </span>
                    <button className="font-label text-[10px] uppercase tracking-widest underline underline-offset-4 text-stone-700 hover:text-black cursor-pointer">
                      Hướng dẫn chọn Size
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {uniqueSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-4 font-label text-sm transition-all cursor-pointer ${
                          selectedSize === size
                            ? "border border-black font-bold"
                            : "border border-stone-200 hover:border-black"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="w-full py-6 bg-black text-white font-headline font-bold uppercase tracking-widest hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {inStock ? "Thêm vào Giỏ Hàng" : "Tạm hết hàng"}
              </button>
              <button 
                onClick={handleAddToWishlist}
                className="w-full py-4 border border-stone-200 font-label text-[10px] uppercase tracking-widest hover:bg-stone-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Heart size={14} className={inWishlist ? "fill-black" : ""} />
                {inWishlist ? "Xóa khỏi Yêu Thích" : "Thêm vào Yêu Thích"}
              </button>
            </div>

            <div className="space-y-6">
              <details className="group border-b border-stone-200 pb-4" open>
                <summary className="list-none flex justify-between items-center cursor-pointer font-headline font-bold uppercase text-xs tracking-widest">
                  Mô Tả
                  <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
                </summary>
                <div 
                  className="pt-4 text-sm leading-relaxed text-stone-600 font-body prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: product.description || "Không có mô tả." }}
                />
              </details>

              <details className="group border-b border-stone-200 pb-4">
                <summary className="list-none flex justify-between items-center cursor-pointer font-headline font-bold uppercase text-xs tracking-widest">
                  Chất Liệu & Bảo Quản
                  <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
                </summary>
                <p className="pt-4 text-sm leading-relaxed text-stone-600 font-body">
                  100% Cotton / Da lộn cao cấp. Giặt hấp chuyên nghiệp. Xử lý nhẹ nhàng.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Gợi Ý Sản Phẩm dưới đáy */}
      {related.length > 0 && (
        <section className="py-32 px-12 bg-stone-100">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-4">
            <h2 className="font-headline text-4xl font-black tracking-tighter uppercase text-black">
              Gợi ý phối đồ
            </h2>
            <div className="h-px grow mx-12 hidden md:block bg-stone-300"></div>
            <a className="font-label text-xs uppercase tracking-widest border-b border-black text-black" href="/clothing">
              Xem tất cả
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* Review bằng tay */}
      <section className="py-32 px-12 bg-surface">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="font-headline text-3xl font-black uppercase tracking-tighter text-black">Đánh Giá Nổi Bật</h2>
            <div className="flex justify-center items-center gap-1 text-black">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={14} className="fill-black" />
              ))}
              <span className="font-label text-xs ml-2">5.0 / 5.0</span>
            </div>
          </div>

          <div className="mt-20 flex justify-center text-black">
            <button className="px-12 py-4 border border-black font-headline font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all">
              Viết Đánh Giá
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
