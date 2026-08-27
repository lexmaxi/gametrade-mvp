"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const FAVORITES_KEY = "gametrade-favorites";

type Listing = {
  id: string;
  game: string;
  category: string;
  title: string;
  description: string | null;
  price: number;
  created_at: string;
};

export default function ListingsFeed() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [animatingId, setAnimatingId] = useState<string | null>(
    null
  );

  useEffect(() => {
    try {
      const storedFavorites =
        localStorage.getItem(FAVORITES_KEY);

      if (storedFavorites) {
        setFavoriteIds(JSON.parse(storedFavorites));
      }
    } catch {
      localStorage.removeItem(FAVORITES_KEY);
    }
  }, []);

  useEffect(() => {
    async function loadListings() {
      const { data, error } = await supabase
        .from("listings")
        .select(
          "id, game, category, title, description, price, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "Ошибка загрузки объявлений:",
          error
        );

        setListings([]);
      } else {
        setListings(data ?? []);
      }

      setLoading(false);
    }

    loadListings();
  }, []);

  function toggleFavorite(listingId: string) {
    try {
      const isCurrentlyFavorite =
        favoriteIds.includes(listingId);

      const updatedFavorites = isCurrentlyFavorite
        ? favoriteIds.filter((id) => id !== listingId)
        : [...favoriteIds, listingId];

      setFavoriteIds(updatedFavorites);

      localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(updatedFavorites)
      );

      setAnimatingId(listingId);

      window.dispatchEvent(
        new CustomEvent("favorites-updated")
      );

      setTimeout(() => {
        setAnimatingId(null);
      }, 550);
    } catch (error) {
      console.error(
        "Ошибка избранного:",
        error
      );
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-52 animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mb-3 text-4xl">
          🎮
        </div>

        <h3 className="mb-2 text-lg font-semibold">
          Пока нет объявлений
        </h3>

        <p className="mb-5 text-sm text-text-secondary">
          Станьте первым продавцом на GameTrade.
        </p>

        <Link
          href="/sell"
          className="inline-flex rounded-xl bg-gradient-to-r from-primary to-primary-hover px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Разместить объявление
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => {
        const isFavorite = favoriteIds.includes(
          listing.id
        );

        const isAnimating =
          animatingId === listing.id;

        return (
          <div
            key={listing.id}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary/50 hover:bg-card-hover"
          >
            <Link
              href={`/listing/${listing.id}`}
              className="block"
            >
              <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-primary/20 via-accent/10 to-card text-5xl">
                🎮
              </div>

              <div className="p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {listing.category}
                  </span>

                  <span className="text-xs text-text-secondary">
                    {listing.game}
                  </span>
                </div>

                <h3 className="mb-2 line-clamp-2 font-semibold text-foreground transition group-hover:text-primary">
                  {listing.title}
                </h3>

                {listing.description && (
                  <p className="mb-4 line-clamp-2 text-sm text-text-secondary">
                    {listing.description}
                  </p>
                )}

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-lg font-bold text-foreground">
                    {Number(
                      listing.price
                    ).toLocaleString("ru-RU")}{" "}
                    ₽
                  </span>

                  <span className="text-xs text-primary">
                    Подробнее →
                  </span>
                </div>
              </div>
            </Link>

            {/* Кнопка избранного */}
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                toggleFavorite(listing.id);
              }}
              className="absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-[#080d18]/85 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-white/30"
              title={
                isFavorite
                  ? "Удалить из избранного"
                  : "Добавить в избранное"
              }
            >
              {/* Свечение только во время включения */}
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
      })}
    </div>
  );
}