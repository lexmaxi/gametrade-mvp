"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ReviewForm from "@/components/ReviewForm";

type Listing = {
  id: string;
  title: string;
  game: string;
};

type Order = {
  id: string;
  listing_id: string;
  seller_id: string;
  amount: number;
  status: string;
  created_at: string;
  listing: Listing | null;
};

type DatabaseOrder = {
  id: string;
  listing_id: string;
  seller_id: string;
  amount: number;
  status: string;
  created_at: string;
};

async function loadOrdersForUser(
  userId: string,
  role: "buyer_id" | "seller_id"
): Promise<Order[]> {
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select(
      "id, listing_id, seller_id, amount, status, created_at"
    )
    .eq(role, userId)
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Ошибка загрузки заказов:", ordersError);
    return [];
  }

  const orders = (ordersData ?? []) as DatabaseOrder[];

  if (orders.length === 0) {
    return [];
  }

  const listingIds = [
    ...new Set(orders.map((order) => order.listing_id)),
  ];

  const { data: listingsData, error: listingsError } = await supabase
    .from("listings")
    .select("id, title, game")
    .in("id", listingIds);

  if (listingsError) {
    console.error(
      "Ошибка загрузки объявлений:",
      listingsError
    );
  }

  const listings = (listingsData ?? []) as Listing[];

  const listingsMap = new Map(
    listings.map((listing) => [listing.id, listing])
  );

  return orders.map((order) => ({
    ...order,
    listing: listingsMap.get(order.listing_id) ?? null,
  }));
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<
    "buying" | "selling"
  >("buying");

  const [buyingOrders, setBuyingOrders] = useState<Order[]>([]);
  const [sellingOrders, setSellingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const [buying, selling] = await Promise.all([
        loadOrdersForUser(user.id, "buyer_id"),
        loadOrdersForUser(user.id, "seller_id"),
      ]);

      setBuyingOrders(buying);
      setSellingOrders(selling);
      setLoading(false);
    }

    loadOrders();
  }, []);

  const orders =
    activeTab === "buying"
      ? buyingOrders
      : sellingOrders;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Link
          href="/"
          className="mb-4 inline-flex text-sm text-primary hover:underline"
        >
          ← Вернуться на главную
        </Link>

        <h1 className="text-3xl font-bold">
          Мои сделки
        </h1>

        <p className="mt-2 text-text-secondary">
          Здесь отображаются ваши покупки и продажи.
        </p>
      </div>

      <div className="mb-6 flex gap-3 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("buying")}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === "buying"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-foreground"
          }`}
        >
          Покупаю ({buyingOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("selling")}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === "selling"
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-foreground"
          }`}
        >
          Продаю ({sellingOrders.length})
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-text-secondary">
          Загрузка сделок...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mb-3 text-4xl">
            📦
          </div>

          <h2 className="mb-2 text-lg font-semibold">
            Пока здесь ничего нет
          </h2>

          <p className="text-sm text-text-secondary">
            Здесь появятся ваши сделки.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="mb-1 text-xs text-text-secondary">
                    {order.listing?.game ??
                      "Игра не указана"}
                  </p>

                  <h2 className="font-semibold">
                    {order.listing?.title ??
                      "Объявление удалено"}
                  </h2>

                  <p className="mt-2 text-sm text-text-secondary">
                    Статус: {order.status}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xl font-bold">
                    {Number(
                      order.amount
                    ).toLocaleString("ru-RU")}{" "}
                    ₽
                  </p>

                  <p className="mt-1 text-xs text-text-secondary">
                    {new Date(
                      order.created_at
                    ).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </div>

              {activeTab === "buying" &&
                order.status === "completed" && (
                  <div className="mt-5 border-t border-border pt-5">
                    <ReviewForm
                      orderId={order.id}
                      sellerId={order.seller_id}
                    />
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}