"use client";

import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/lib/data";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getGameSearchSuggestions,
  normalizeSearchText,
  type GameSearchItem,
} from "@/lib/gameSearch";

type SortOption = "popular" | "cheap" | "expensive" | "rating";

export default function CatalogPage() {
  const searchParams = useSearchParams();

  const searchFromUrl =
    searchParams.get("search") ?? searchParams.get("q") ?? "";

  const gameFromUrl = searchParams.get("game") ?? "";

  const categoryFromUrl = searchParams.get("category") ?? "";

  const [search, setSearch] = useState(searchFromUrl);

  const [selectedGame, setSelectedGame] =
    useState<GameSearchItem | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState(categoryFromUrl);

  const [sort, setSort] = useState<SortOption>("popular");

  useEffect(() => {
    setSearch(searchFromUrl);
    setSelectedCategory(categoryFromUrl);

    if (!gameFromUrl) {
      setSelectedGame(null);
      return;
    }

    const game = getGameSearchSuggestions(gameFromUrl, 20).find(
      (item) => item.slug === gameFromUrl
    );

    setSelectedGame(game ?? null);
  }, [searchFromUrl, gameFromUrl, categoryFromUrl]);

  const detectedGame = useMemo(() => {
    if (selectedGame) {
      return selectedGame;
    }

    if (!search.trim()) {
      return null;
    }

    const results = getGameSearchSuggestions(search, 1);

    return results.length > 0 ? results[0] : null;
  }, [search, selectedGame]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeSearchText(search);

    const result = products.filter((product) => {
      const matchesGame =
        !detectedGame ||
        normalizeSearchText(product.game) ===
          normalizeSearchText(detectedGame.name);

      const matchesSearch =
        !normalizedSearch ||
        detectedGame !== null ||
        product.title.toLowerCase().includes(search.trim().toLowerCase()) ||
        product.game.toLowerCase().includes(search.trim().toLowerCase()) ||
        product.category.toLowerCase().includes(search.trim().toLowerCase()) ||
        product.seller.name
          .toLowerCase()
          .includes(search.trim().toLowerCase()) ||
        product.tags.some((tag) =>
          tag.toLowerCase().includes(search.trim().toLowerCase())
        );

      const matchesCategory =
        !selectedCategory ||
        product.category === selectedCategory;

      return matchesGame && matchesSearch && matchesCategory;
    });

    return [...result].sort((a, b) => {
      switch (sort) {
        case "cheap":
          return a.price - b.price;

        case "expensive":
          return b.price - a.price;

        case "rating":
          return b.seller.rating - a.seller.rating;

        case "popular":
        default:
          return b.sales - a.sales;
      }
    });
  }, [
    search,
    detectedGame,
    selectedCategory,
    sort,
  ]);

  function getCatalogHref(category?: string) {
    const params = new URLSearchParams();

    if (selectedGame) {
      params.set("game", selectedGame.slug);
    } else if (gameFromUrl) {
      params.set("game", gameFromUrl);
    } else if (search.trim()) {
      params.set("search", search.trim());
    }

    if (category) {
      params.set("category", category);
    }

    const query = params.toString();

    return query ? `/catalog?${query}` : "/catalog";
  }

  function handleSearchChange(value: string) {
    setSearch(value);

    if (!value.trim()) {
      setSelectedGame(null);
      return;
    }

    const results = getGameSearchSuggestions(value, 1);

    if (results.length > 0) {
      setSelectedGame(results[0]);
    } else {
      setSelectedGame(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold">
          Каталог
        </h1>

        <p className="text-sm text-text-secondary">
          Все предложения по игровым аккаунтам, бусту и услугам
        </p>
      </div>

      {/* Поиск внутри каталога */}
      <div className="mb-5">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) =>
              handleSearchChange(e.target.value)
            }
            placeholder="Поиск по названию, игре, категории..."
            className="h-11 w-full rounded-xl border border-border bg-card py-2 pl-12 pr-10 text-sm text-foreground placeholder:text-text-secondary transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />

          {/* Исправленная иконка поиска */}
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 shrink-0 -translate-y-1/2 overflow-visible text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              strokeWidth="1.8"
            />

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M20 20l-4.5-4.5"
            />
          </svg>

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedGame(null);
              }}
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary transition hover:bg-white/5 hover:text-white"
              title="Очистить поиск"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 6l12 12M18 6L6 18"
                />
              </svg>
            </button>
          )}
        </div>

        {detectedGame && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-text-secondary">
              Игра:
            </span>

            <span className="inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              🎮 {detectedGame.name}

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedGame(null);
                }}
                className="ml-1 text-primary/70 transition hover:text-white"
                title="Убрать игру"
              >
                ×
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Категории */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href={getCatalogHref()}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            !selectedCategory
              ? "bg-primary text-white"
              : "border border-border bg-card text-text-secondary hover:border-primary/50 hover:text-foreground"
          }`}
        >
          Все
        </Link>

        {categories.map((cat) => {
          const isActive = selectedCategory === cat.slug;

          return (
            <Link
              key={cat.id}
              href={getCatalogHref(cat.slug)}
              className={`rounded-xl px-4 py-2 text-sm transition ${
                isActive
                  ? "bg-primary text-white"
                  : "border border-border bg-card text-text-secondary hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {cat.icon} {cat.name}
            </Link>
          );
        })}
      </div>

      {/* Результаты и сортировка */}
      <div className="mb-4 flex flex-col gap-3 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span>
            Найдено:{" "}
            <span className="font-medium text-foreground">
              {filteredProducts.length}
            </span>{" "}
            {filteredProducts.length === 1
              ? "предложение"
              : filteredProducts.length >= 2 &&
                  filteredProducts.length <= 4
                ? "предложения"
                : "предложений"}
          </span>

          {detectedGame ? (
            <span className="ml-2">
              по игре{" "}
              <span className="font-medium text-primary">
                «{detectedGame.name}»
              </span>
            </span>
          ) : search.trim() ? (
            <span className="ml-2">
              по запросу{" "}
              <span className="font-medium text-primary">
                «{search.trim()}»
              </span>
            </span>
          ) : null}
        </div>

        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as SortOption)
          }
          className="rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none"
        >
          <option value="popular">
            Сначала популярные
          </option>

          <option value="cheap">
            Сначала дешёвые
          </option>

          <option value="expensive">
            Сначала дорогие
          </option>

          <option value="rating">
            По рейтингу
          </option>
        </select>
      </div>

      {/* Товары */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 text-center">
          <div className="mb-4 text-5xl">
            🔍
          </div>

          <h2 className="text-lg font-semibold text-foreground">
            Ничего не найдено
          </h2>

          <p className="mt-2 max-w-md text-sm text-text-secondary">
            Попробуйте изменить поисковый запрос или выбрать
            другую категорию.
          </p>

          <Link
            href="/catalog"
            className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            Сбросить фильтры
          </Link>
        </div>
      )}
    </div>
  );
}