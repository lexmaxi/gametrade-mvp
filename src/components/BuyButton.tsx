"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type BuyButtonProps = {
  listingId: string;
  sellerId: string;
  amount: number;
};

export default function BuyButton({
  listingId,
  sellerId,
  amount,
}: BuyButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleBuy() {
    setMessage("");
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push(`/auth?redirect=/listing/${listingId}`);
      return;
    }

    if (user.id === sellerId) {
      setMessage("Нельзя купить собственное объявление.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("orders").insert({
      listing_id: listingId,
      buyer_id: user.id,
      seller_id: sellerId,
      amount,
    });

    if (error) {
      console.error("Ошибка создания заказа:", error);
      setMessage(`Ошибка: ${error.message}`);
      setLoading(false);
      return;
    }

    setMessage("Заявка на покупку создана!");
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-stretch gap-3 sm:items-end">
      <button
        type="button"
        onClick={handleBuy}
        disabled={loading}
        className="rounded-xl bg-gradient-to-r from-primary to-primary-hover px-8 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Создаём заказ..." : "Купить"}
      </button>

      {message && (
        <p className="text-sm text-text-secondary">
          {message}
        </p>
      )}
    </div>
  );
}