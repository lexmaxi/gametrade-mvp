"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        setMessage(
          "Регистрация выполнена. Проверьте почту для подтверждения аккаунта."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        setMessage("Вы успешно вошли в аккаунт.");
      }
    } catch {
      setMessage("Произошла непредвиденная ошибка.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <div className="w-full rounded-3xl border border-border bg-card p-8">
        <h1 className="mb-2 text-2xl font-bold">
          {isRegister ? "Регистрация" : "Вход"}
        </h1>

        <p className="mb-6 text-sm text-text-secondary">
          {isRegister
            ? "Создайте аккаунт GameTrade"
            : "Войдите в свой аккаунт GameTrade"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Пароль
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              placeholder="Минимум 6 символов"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-hover px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? "Подождите..."
              : isRegister
              ? "Зарегистрироваться"
              : "Войти"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-secondary">
          {isRegister ? "Уже есть аккаунт?" : "Нет аккаунта?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
            }}
            className="font-medium text-primary hover:underline"
          >
            {isRegister ? "Войти" : "Зарегистрироваться"}
          </button>
        </div>

        {message && (
          <div className="mt-4 rounded-xl border border-border p-3 text-sm">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}