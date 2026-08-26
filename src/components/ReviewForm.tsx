"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ReviewFormProps = {
  orderId: string;
  sellerId: string;
  onSuccess?: () => void;
};

export default function ReviewForm({
  orderId,
  sellerId,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [message, setMessage] = useState("");

  const displayedRating = hoverRating || rating;

  useEffect(() => {
    async function checkExistingReview() {
      setChecking(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log("ТЕКУЩИЙ USER ID:", user?.id);
      console.log("ORDER ID:", orderId);

      if (userError) {
        console.error(
          "Ошибка получения пользователя:",
          userError
        );
      }

      if (!user) {
        console.log("Пользователь не авторизован");
        setChecking(false);
        return;
      }

      const { data, error } = await supabase
        .from("reviews")
        .select("id, order_id, reviewer_id, rating")
        .eq("order_id", orderId)
        .eq("reviewer_id", user.id)
        .maybeSingle();

      console.log("Найденный отзыв:", data);
      console.log("Ошибка проверки:", error);

      if (error) {
        console.error(
          "Ошибка проверки отзыва:",
          error
        );
      }

      setAlreadyReviewed(!!data);
      setChecking(false);
    }

    checkExistingReview();
  }, [orderId]);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setMessage("");

    if (rating < 1 || rating > 5) {
      setMessage(
        "Пожалуйста, поставьте оценку от 1 до 5."
      );
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log(
      "Пользователь при отправке:",
      user?.id
    );

    if (userError || !user) {
      setMessage("Необходимо войти в аккаунт.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("reviews")
      .insert({
        order_id: orderId,
        reviewer_id: user.id,
        seller_id: sellerId,
        rating,
        comment: comment.trim() || null,
      });

    if (error) {
      console.error(
        "Ошибка создания отзыва:",
        error
      );

      if (error.code === "23505") {
        setAlreadyReviewed(true);
        setMessage(
          "Вы уже оставляли отзыв по этой сделке."
        );
      } else {
        setMessage(`Ошибка: ${error.message}`);
      }

      setLoading(false);
      return;
    }

    setAlreadyReviewed(true);
    setMessage("Отзыв успешно добавлен!");
    setRating(0);
    setHoverRating(0);
    setComment("");
    setLoading(false);

    onSuccess?.();
  }

  if (checking) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-sm text-text-secondary">
        Проверяем отзыв...
      </div>
    );
  }

  if (alreadyReviewed) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-lg font-semibold">
          Отзыв уже оставлен
        </h3>

        <p className="mt-2 text-sm text-text-secondary">
          Вы уже оставляли отзыв по этой сделке.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <h3 className="mb-4 text-lg font-semibold">
        Оценить продавца
      </h3>

      <div className="mb-4">
        <p className="mb-2 text-sm text-text-secondary">
          Ваша оценка
        </p>

        <div
          className="flex gap-1"
          onMouseLeave={() => setHoverRating(0)}
        >
          {Array.from({ length: 5 }).map(
            (_, index) => {
              const star = index + 1;
              const active =
                star <= displayedRating;

              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() =>
                    setHoverRating(star)
                  }
                  onClick={() =>
                    setRating(star)
                  }
                  className={`text-3xl transition ${
                    active
                      ? "text-yellow-400"
                      : "text-text-secondary/30"
                  } hover:scale-110`}
                  aria-label={`Оценка ${star} из 5`}
                >
                  ★
                </button>
              );
            }
          )}
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="review-comment"
          className="mb-2 block text-sm text-text-secondary"
        >
          Комментарий
        </label>

        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) =>
            setComment(e.target.value)
          }
          placeholder="Расскажите о вашем опыте сделки..."
          rows={4}
          maxLength={1000}
          className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="rounded-xl bg-gradient-to-r from-primary to-primary-hover px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Отправляем..."
          : "Оставить отзыв"}
      </button>

      {message && (
        <p className="mt-3 text-sm text-text-secondary">
          {message}
        </p>
      )}
    </form>
  );
}