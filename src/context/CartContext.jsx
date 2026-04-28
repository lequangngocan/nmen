"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nmen_cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Lỗi khi đọc giỏ hàng", e);
    }
    setMounted(true);
  }, []);

  // Sync to localStorage when items change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("nmen_cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  const addToCart = (product, quantity = 1, size = null, color = null, variantId = null) => {
    setItems((prev) => {
      // Find if item already exists with same variant (product + size + color)
      const existingIndex = prev.findIndex(
        (item) =>
          item.product_id === product.id &&
          item.size === size &&
          item.color === color
      );

      if (existingIndex >= 0) {
        const newItems = [...prev];
        newItems[existingIndex].quantity += quantity;
        return newItems;
      }

      const effectivePrice = product.sale_price
        ? Number(product.sale_price)
        : Number(product.price);

      // Add new item
      return [
        ...prev,
        {
          id: `${product.id}-${size}-${color}`, // unique cart item id (deterministic)
          product_id: product.id,
          variant_id: variantId || null,
          product_name: product.name,
          price: effectivePrice,
          original_price: Number(product.price),
          image: product.primary_image || product.image1 || "/placeholder.svg",
          image_url: product.primary_image || product.image1 || null,
          category: product.category_name || product.category || "",
          size,
          color,
          color_name: product.selectedColorName || null,
          quantity,
        },
      ];
    });
  };

  const removeFromCart = (cartItemId) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        mounted,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart phải dùng trong CartProvider");
  }
  return ctx;
}
