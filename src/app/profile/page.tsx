"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth");
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
        setUsername(data.username ?? "");
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleSave() {
    if (!user) return;

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setMessage("Введите имя пользователя.");
      return;
    }

    if (trimmedUsername.length < 3) {
      setMessage("Имя пользователя должно содержать минимум 3 символа.");
      return;
    }

    if (trimmedUsername.length > 30) {
      setMessage("Имя пользователя не должно быть длиннее 30 символов.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("profiles")
      .update({
        username: trimmedUsername,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
  console.error("Ошибка сохранения профиля:", error);
  setMessage(`Ошибка Supabase: ${error.message}`);
  setSaving(false);
  return;
}

    setProfile(data);
    setUsername(data.username ?? "");
    setMessage("Имя пользователя сохранено.");
    setSaving(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/auth");
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4">
        <p className="text-text-secondary">Загрузка профиля...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Мой профиль</h1>

        <p className="mt-2 text-text-secondary">
          Управление аккаунтом GameTrade
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">

        {/* Avatar */}
        <section className="rounded-3xl border border-border bg-card p-6">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-4xl font-bold text-white">
            {username
              ? username.charAt(0).toUpperCase()
              : user.email?.charAt(0).toUpperCase() ?? "U"}
          </div>

          <div className="mt-5 text-center">
            <h2 className="font-semibold">
              {profile?.username || "Новый пользователь"}
            </h2>

            <p className="mt-1 break-all text-sm text-text-secondary">
              {user.email}
            </p>
          </div>
        </section>

        {/* Profile information */}
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="mb-6 text-xl font-bold">
            Информация аккаунта
          </h2>

          <div className="space-y-6">

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm text-text-secondary">
                Email
              </label>

              <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm">
                {user.email}
              </div>
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm text-text-secondary"
              >
                Имя пользователя
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setMessage("");
                }}
                placeholder="Например: MaxPlayer"
                maxLength={30}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />

              <p className="mt-2 text-xs text-text-secondary">
                От 3 до 30 символов.
              </p>
            </div>

            {/* Registration date */}
            <div>
              <p className="mb-2 text-sm text-text-secondary">
                Дата регистрации
              </p>

              <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm">
                {new Date(
                  profile?.created_at || user.created_at
                ).toLocaleDateString("ru-RU")}
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className="mt-5 rounded-xl border border-border bg-background p-3 text-sm">
              {message}
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-primary to-primary-hover px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium transition hover:border-primary/50"
            >
              Выйти из аккаунта
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}