"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { useRouter } from "next/navigation";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const { user, mounted } = useAuth();
  const router = useRouter();

  // Load danh sách wishlist khi user đăng nhập
  useEffect(() => {
    if (!mounted) return;

    if (!user) {
      setItems([]);
      return;
    }

    apiGet("/api/wishlist")
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch((err) => console.error("Lỗi tải wishlist", err));
  }, [mounted, user]);

  // Kiểm tra sản phẩm có trong wishlist không
  const isInWishlist = (productId) => {
    return items.some((item) => String(item.product_id) === String(productId));
  };

  // Thêm hoặc xóa sản phẩm khỏi wishlist
  const toggleWishlist = async (product) => {
    if (!user) {
      alert("Vui lòng đăng nhập để sử dụng tính năng yêu thích!");
      router.push("/login");
      return;
    }

    const productId = String(product.id || product.product_id);

    if (isInWishlist(productId)) {
      // Xóa khỏi wishlist
      try {
        await apiDelete(`/api/wishlist/${productId}`);
        // Xóa thành công → cập nhật items ngay, không cần GET lại
        setItems((prev) =>
          prev.filter((i) => String(i.product_id) !== productId)
        );
      } catch (e) {
        console.error(e);
        alert("Lỗi khi xóa khỏi danh sách yêu thích");
      }
    } else {
      // Thêm vào wishlist
      try {
        await apiPost("/api/wishlist", { product_id: productId });
        // Thêm thành công → cập nhật items ngay, không cần GET lại
        setItems((prev) => [...prev, { product_id: productId }]);
      } catch (e) {
        console.error(e);
        alert("Có lỗi xảy ra khi thêm vào yêu thích.");
      }
    }
  };

  // Xóa theo productId (dùng cho trang wishlist)
  const removeFromWishlist = async (productId) => {
    try {
      await apiDelete(`/api/wishlist/${productId}`);
      setItems((prev) =>
        prev.filter((i) => String(i.product_id) !== String(productId))
      );
    } catch (e) {
      console.error(e);
      alert("Lỗi khi xóa sản phẩm khỏi yêu thích");
    }
  };

  return (
    <WishlistContext.Provider
      value={{ items, isInWishlist, toggleWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist phải dùng trong WishlistProvider");
  return ctx;
}
