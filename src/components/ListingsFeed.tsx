"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

  useEffect(() => {
    async function loadListings() {
      const { data, error } = await supabase
        .from("listings")
        .select("id, game, category, title, description, price, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Ошибка загрузки объявлений:", error);
        setListings([]);
      } else {
        setListings(data ?? []);
      }

      setLoading(false);
    }

    loadListings();
  }, []);

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
        <div className="mb-3 text-4xl">🎮</div>
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
      {listings.map((listing) => (
        <Link
          key={listing.id}
          href={`/listing/${listing.id}`}
          className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary/50 hover:bg-card-hover"
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

            <h3 className="mb-2 line-clamp-2 font-semibold text-foreground group-hover:text-primary transition">
              {listing.title}
            </h3>

            {listing.description && (
              <p className="mb-4 line-clamp-2 text-sm text-text-secondary">
                {listing.description}
              </p>
            )}

            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-lg font-bold text-foreground">
                {Number(listing.price).toLocaleString("ru-RU")} ₽
              </span>

              <span className="text-xs text-primary">
                Подробнее →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}