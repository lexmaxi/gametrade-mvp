"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/data";
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

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isListingsLoaded, setIsListingsLoaded] = useState(false);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  function getStoredFavorites() {
    try {
      const storedFavorites =
        localStorage.getItem(FAVORITES_KEY);

      if (!storedFavorites) {
        return [];
      }

      const parsedFavorites = JSON.parse(storedFavorites);

      if (!Array.isArray(parsedFavorites)) {
        return [];
      }

      return parsedFavorites.map(String);
    } catch {
      localStorage.removeItem(FAVORITES_KEY);
      return [];
    }
  }

  function loadFavorites() {
    const storedFavorites = getStoredFavorites();

    setFavoriteIds(storedFavorites);
    setIsLoaded(true);
  }

  useEffect(() => {
    loadFavorites();

    function handleFavoritesUpdate() {
      loadFavorites();
    }

    window.addEventListener(
      "favorites-updated",
      handleFavoritesUpdate
    );

    return () => {
      window.removeEventListener(
        "favorites-updated",
        handleFavoritesUpdate
      );
    };
  }, []);

  useEffect(() => {
    async function loadFavoriteListings() {
      if (favoriteIds.length === 0) {
        setFavoriteListings([]);
        setIsListingsLoaded(true);
        return;
      }

      setIsListingsLoaded(false);

      const { data, error } = await supabase
        .from("listings")
        .select(
          "id, game, category, title, description, price, created_at"
        )
        .in("id", favoriteIds);

      if (error) {
        console.error(
          "Ошибка загрузки избранных объявлений:",
          error
        );

        setFavoriteListings([]);
      } else {
        setFavoriteListings(data ?? []);
      }

      setIsListingsLoaded(true);
    }

    loadFavoriteListings();
  }, [favoriteIds]);

  const favoriteProducts = useMemo(() => {
    return products.filter((product) =>
      favoriteIds.includes(String(product.id))
    );
  }, [favoriteIds]);

  const totalFavorites =
    favoriteProducts.length + favoriteListings.length;

  function removeFavorite(id: string) {
    try {
      const updatedFavorites =
        favoriteIds.filter(
          (favoriteId) => favoriteId !== String(id)
        );

      setFavoriteIds(updatedFavorites);

      localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(updatedFavorites)
      );

      window.dispatchEvent(
        new CustomEvent("favorites-updated")
      );
    } catch (error) {
      console.error(
        "Ошибка удаления из избранного:",
        error
      );
    }
  }

  function clearFavorites() {
    try {
      localStorage.removeItem(FAVORITES_KEY);

      setFavoriteIds([]);
      setFavoriteListings([]);

      setShowClearConfirm(false);

      window.dispatchEvent(
        new CustomEvent("favorites-updated")
      );
    } catch (error) {
      console.error(
        "Ошибка очистки избранного:",
        error
      );
    }
  }

  if (!isLoaded || !isListingsLoaded) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-card" />

          <div className="mt-3 h-4 w-72 animate-pulse rounded-lg bg-card" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-[350px] animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-2xl">
                ❤️
              </div>

              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Избранное
                </h1>

                <p className="mt-1 text-sm text-text-secondary">
                  Сохранённые товары и объявления
                </p>
              </div>
            </div>
          </div>

          {totalFavorites > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-text-secondary transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
            >
              Очистить избранное
            </button>
          )}
        </div>

        {totalFavorites > 0 ? (
          <>
            <div className="mb-5 text-sm text-text-secondary">
              В избранном:{" "}
              <span className="font-medium text-foreground">
                {totalFavorites}
              </span>{" "}
              {totalFavorites === 1
                ? "предложение"
                : totalFavorites >= 2 &&
                    totalFavorites <= 4
                  ? "предложения"
                  : "предложений"}
            </div>

            {favoriteProducts.length > 0 && (
              <div className="mb-8">
                {favoriteListings.length > 0 && (
                  <h2 className="mb-4 text-lg font-semibold text-foreground">
                    Товары
                  </h2>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {favoriteProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              </div>
            )}

            {favoriteListings.length > 0 && (
              <div>
                {favoriteProducts.length > 0 && (
                  <h2 className="mb-4 text-lg font-semibold text-foreground">
                    Объявления
                  </h2>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {favoriteListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="group relative overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary/50 hover:bg-card-hover"
                    >
                      <Link
                        href={`/listing/${listing.id}`}
                        className="block"
                      >
                        <div className="flex h-44 items-center justify-center bg-gradient-to-br from-primary/20 via-accent/10 to-card text-5xl">
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
                              ).toLocaleString("ru-RU")} ₽
                            </span>

                            <span className="text-xs text-primary">
                              Подробнее →
                            </span>
                          </div>
                        </div>
                      </Link>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          removeFavorite(listing.id);
                        }}
                        className="absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-[#080d18]/85 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-red-400/50"
                        title="Удалить из избранного"
                      >
                        <svg
                          className="h-6 w-6 fill-red-500 stroke-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]"
                          viewBox="0 0 24 24"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.03] text-4xl">
              🤍
            </div>

            <h2 className="text-xl font-semibold text-foreground">
              В избранном пока ничего нет
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary">
              Нажимайте на сердечко у понравившихся товаров и
              объявлений, чтобы сохранить их здесь.
            </p>

            <Link
              href="/catalog"
              className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Перейти в каталог
            </Link>
          </div>
        )}
      </div>

      {/* Окно подтверждения очистки избранного */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-2xl">
              ❤️‍🔥
            </div>

            <h2 className="text-xl font-bold text-foreground">
              Удалить всё избранное?
            </h2>

            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Все сохранённые товары и объявления будут удалены
              из избранного. Продолжить?
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-text-secondary transition hover:border-white/20 hover:text-white"
              >
                Отмена
              </button>

              <button
                type="button"
                onClick={clearFavorites}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}