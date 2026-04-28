"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistButton({ product }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product);
  };

  return (
    <div
      onClick={handleClick}
      className={`absolute top-2 right-2 p-2 z-10 cursor-pointer transition-all duration-300 ${
        inWishlist
          ? "text-black opacity-100"
          : "text-black opacity-0 group-hover:opacity-100"
      }`}
    >
      <Heart
        size={20}
        strokeWidth={1.5}
        fill={inWishlist ? "black" : "none"}
        className="transition-colors"
      />
    </div>
  );
}
