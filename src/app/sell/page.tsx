"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SellPage() {
  const router = useRouter();

  const [game, setGame] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Чтобы опубликовать объявление, необходимо войти в аккаунт.");
      setLoading(false);
      return;
    }

    const numericPrice = Number(price);

    if (!game.trim() || !category.trim() || !title.trim()) {
      setMessage("Заполните все обязательные поля.");
      setLoading(false);
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setMessage("Укажите корректную цену.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("listings").insert({
      seller_id: user.id,
      game: game.trim(),
      category: category.trim(),
      title: title.trim(),
      description: description.trim() || null,
      price: numericPrice,
    });

    if (error) {
      console.error("Ошибка публикации объявления:", error);
      setMessage(`Ошибка: ${error.message}`);
      setLoading(false);
      return;
    }

    setMessage("Объявление успешно опубликовано!");

    setGame("");
    setCategory("");
    setTitle("");
    setDescription("");
    setPrice("");
    setLoading(false);

    setTimeout(() => {
      router.push("/");
    }, 1200);
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Продать товар
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          Заполните информацию об объявлении. После публикации оно будет
          сохранено в GameTrade.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Игра <span className="text-primary">*</span>
            </label>

            <input
              type="text"
              value={game}
              onChange={(event) => setGame(event.target.value)}
              placeholder="Например: Counter-Strike 2"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Категория <span className="text-primary">*</span>
            </label>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Выберите категорию</option>
              <option value="Аккаунт">Аккаунт</option>
              <option value="Валюта">Игровая валюта</option>
              <option value="Предмет">Игровой предмет</option>
              <option value="Услуга">Услуга</option>
              <option value="Другое">Другое</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Название объявления <span className="text-primary">*</span>
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Например: Аккаунт CS2 с редкими скинами"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Описание
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Расскажите подробнее о товаре..."
              rows={6}
              className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Цена <span className="text-primary">*</span>
            </label>

            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="Например: 1500"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-16 text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                ₽
              </span>
            </div>
          </div>

          {message && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                message.startsWith("Ошибка") ||
                message.startsWith("Чтобы") ||
                message.startsWith("Заполните") ||
                message.startsWith("Укажите")
                  ? "border-red-500/40 bg-red-500/10 text-red-300"
                  : "border-green-500/40 bg-green-500/10 text-green-300"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary-hover px-5 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Публикуем..." : "Опубликовать объявление"}
          </button>
        </form>
      </div>
    </main>
  );
}