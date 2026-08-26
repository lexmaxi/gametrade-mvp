"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  username: string | null;
  profile_id: string;
  avatar_url: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Можно загрузить только изображение.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Размер изображения не должен превышать 5 МБ.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const fileExtension = file.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/avatar.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        setMessage(`Ошибка загрузки: ${uploadError.message}`);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = `${publicUrl}?v=${Date.now()}`;

      const { data, error: profileError } = await supabase
        .from("profiles")
        .update({
          avatar_url: avatarUrl,
        })
        .eq("id", user.id)
        .select("*")
        .single();

      if (profileError) {
        setMessage(`Аватар загружен, но профиль не обновлён: ${profileError.message}`);
        return;
      }

      setProfile(data);
      setMessage("Аватар успешно обновлён.");
    } catch {
      setMessage("Произошла ошибка при загрузке аватара.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
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

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Мой профиль</h1>
        <p className="mt-2 text-text-secondary">Управление аккаунтом GameTrade</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <section className="rounded-3xl border border-border bg-card p-6">
          <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent text-4xl font-bold text-white">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Аватар пользователя"
                className="h-full w-full object-cover"
              />
            ) : (
              profile?.username?.charAt(0).toUpperCase() ??
              user.email?.charAt(0).toUpperCase() ??
              "U"
            )}
          </div>

          <div className="mt-4 text-center">
            <label className="inline-flex cursor-pointer items-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary/50">
              {uploading ? "Загрузка..." : "Изменить аватар"}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          <div className="mt-5 text-center">
            <h2 className="font-semibold">{profile?.username || "Новый пользователь"}</h2>

            {profile?.profile_id && (
              <p className="mt-1 text-xs text-text-secondary">
                ID: {profile.profile_id}
              </p>
            )}

            <p className="mt-3 break-all text-sm text-text-secondary">
              {user.email}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="mb-6 text-xl font-bold">Информация аккаунта</h2>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm text-text-secondary">
                Имя пользователя
              </label>

              <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm">
                {profile?.username || "Не указано"}
              </div>

              <p className="mt-2 text-xs text-text-secondary">
                Никнейм выбирается при регистрации и не может быть изменён.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-text-secondary">
                ID профиля
              </label>

              <div className="rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm">
                {profile?.profile_id || "Загрузка..."}
              </div>

              <p className="mt-2 text-xs text-text-secondary">
                Уникальный идентификатор вашего профиля GameTrade.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-text-secondary">
                Email
              </label>

              <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm">
                {user.email}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-text-secondary">
                Дата регистрации
              </p>

              <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm">
                {new Date(profile?.created_at || user.created_at).toLocaleDateString("ru-RU")}
              </div>
            </div>
          </div>

          {message && (
            <div className="mt-5 rounded-xl border border-border bg-background p-3 text-sm">
              {message}
            </div>
          )}

          <div className="mt-6">
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