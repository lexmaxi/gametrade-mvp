"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/data";

const FAVORITES_KEY = "gametrade-favorites";

export default function ProductCard({ product }: { product: Product }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);

      if (!storedFavorites) {
        return;
      }

      const favoriteIds: string[] = JSON.parse(storedFavorites);

      setIsFavorite(favoriteIds.includes(String(product.id)));
    } catch {
      localStorage.removeItem(FAVORITES_KEY);
    }
  }, [product.id]);

  function toggleFavorite() {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);

      const favoriteIds: string[] = storedFavorites
        ? JSON.parse(storedFavorites)
        : [];

      const productId = String(product.id);

      const updatedFavorites = favoriteIds.includes(productId)
        ? favoriteIds.filter((id) => id !== productId)
        : [...favoriteIds, productId];

      setIsAnimating(false);

      requestAnimationFrame(() => {
        setIsFavorite(updatedFavorites.includes(productId));
        setIsAnimating(true);
      });

      localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(updatedFavorites)
      );

      window.dispatchEvent(
        new CustomEvent("favorites-updated")
      );

      setTimeout(() => {
        setIsAnimating(false);
      }, 550);
    } catch (error) {
      console.error("Ошибка избранного:", error);
    }
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:bg-card-hover glow-card">
      <Link
        href={`/product/${product.id}`}
        className="flex h-full flex-col"
      >
        {/* Изображение */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#1e0b36] to-[#2e1065]">
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-40 transition-transform duration-500 group-hover:scale-110">
            {product.category === "accounts" && "👤"}
            {product.category === "boost" && "🚀"}
            {product.category === "currency" && "💰"}
            {product.category === "services" && "🛠️"}
            {product.category === "items" && "🎒"}
            {product.category === "keys" && "🔑"}
          </div>

          {/* Значки */}
          <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1">
            {product.delivery === "auto" && (
              <span className="rounded-md bg-success/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                АВТО
              </span>
            )}

            {product.oldPrice && (
              <span className="rounded-md bg-danger/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                СКИДКА
              </span>
            )}
          </div>
        </div>

        {/* Контент */}
        <div className="flex flex-1 flex-col p-3.5">
          <div className="mb-1 text-xs text-text-secondary">
            {product.game}
          </div>

          <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
            {product.title}
          </h3>

          {/* Теги */}
          <div className="mb-3 flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-accent/20 px-1.5 py-0.5 text-[10px] text-muted"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Цена и продавец */}
          <div className="mt-auto flex items-end justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-foreground">
                  {product.price.toLocaleString("ru-RU")} ₽
                </span>

                {product.oldPrice && (
                  <span className="text-xs text-text-secondary line-through">
                    {product.oldPrice.toLocaleString("ru-RU")} ₽
                  </span>
                )}
              </div>

              <div className="mt-0.5 text-[11px] text-text-secondary">
                {product.sales} продаж
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-warning">★</span>

                <span className="font-medium">
                  {product.seller.rating}
                </span>
              </div>

              <div className="max-w-[90px] truncate text-[11px] text-text-secondary">
                {product.seller.name}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Кнопка избранного */}
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleFavorite();
        }}
        className="absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-[#080d18]/85 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-white/30"
        title={
          isFavorite
            ? "Удалить из избранного"
            : "Добавить в избранное"
        }
      >
        {/* Свечение появляется только во время включения */}
        {isFavorite && isAnimating && (
          <span className="pointer-events-none absolute inset-[-8px] rounded-full bg-red-500/30 blur-xl animate-ping" />
        )}

        <svg
          className={`relative z-10 h-6 w-6 transition-all duration-300 ${
            isFavorite
              ? "fill-red-500 stroke-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]"
              : "fill-transparent stroke-gray-400"
          } ${
            isAnimating && isFavorite
              ? "scale-[1.22]"
              : isAnimating && !isFavorite
                ? "scale-90"
                : "scale-100"
          }`}
          viewBox="0 0 24 24"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
  );
}