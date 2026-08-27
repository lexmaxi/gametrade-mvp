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

type AvatarFrame =
  | "none"
  | "circle"
  | "square"
  | "hexagon"
  | "diamond"
  | "star";

const hexagonClip =
  "polygon(50% 0%, 92% 23%, 92% 77%, 50% 100%, 8% 77%, 8% 23%)";

const diamondClip =
  "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";

const starClip =
  "polygon(50% 0%, 58.2% 25%, 79.4% 9.5%, 76.6% 35.6%, 97.6% 34.5%, 76.2% 50%, 97.6% 65.5%, 76.6% 64.4%, 79.4% 90.5%, 58.2% 75%, 50% 100%, 41.8% 75%, 20.6% 90.5%, 23.4% 64.4%, 2.4% 65.5%, 23.8% 50%, 2.4% 34.5%, 23.4% 35.6%, 20.6% 9.5%, 41.8% 25%)";

function getFrameClip(frame: AvatarFrame) {
  switch (frame) {
    case "hexagon":
      return hexagonClip;

    case "diamond":
      return diamondClip;

    case "star":
      return starClip;

    default:
      return undefined;
  }
}

function getFrameRadius(frame: AvatarFrame) {
  switch (frame) {
    case "circle":
      return "50%";

    case "square":
      return "18px";

    default:
      return undefined;
  }
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const [avatarFrame, setAvatarFrame] =
    useState<AvatarFrame>("hexagon");

  const [avatarColor, setAvatarColor] =
    useState("#a855f7");

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

      const savedFrame = localStorage.getItem(
        "gametrade_avatar_frame"
      );

      const savedColor = localStorage.getItem(
        "gametrade_avatar_color"
      );

      const allowedFrames: AvatarFrame[] = [
        "none",
        "circle",
        "square",
        "hexagon",
        "diamond",
        "star",
      ];

      if (
        savedFrame &&
        allowedFrames.includes(savedFrame as AvatarFrame)
      ) {
        setAvatarFrame(savedFrame as AvatarFrame);
      }

      if (savedColor) {
        setAvatarColor(savedColor);
      }

      setLoading(false);
    }

    loadProfile();

    function handleStorage(event: StorageEvent) {
      if (
        event.key === "gametrade_avatar_frame" &&
        event.newValue
      ) {
        const allowedFrames: AvatarFrame[] = [
          "none",
          "circle",
          "square",
          "hexagon",
          "diamond",
          "star",
        ];

        if (
          allowedFrames.includes(
            event.newValue as AvatarFrame
          )
        ) {
          setAvatarFrame(
            event.newValue as AvatarFrame
          );
        }
      }

      if (
        event.key === "gametrade_avatar_color" &&
        event.newValue
      ) {
        setAvatarColor(event.newValue);
      }
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [router]);

  async function handleAvatarUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Можно загрузить только изображение.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage(
        "Размер изображения не должен превышать 5 МБ."
      );
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const fileExtension =
        file.name.split(".").pop() || "jpg";

      const filePath =
        `${user.id}/avatar.${fileExtension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(filePath, file, {
            upsert: true,
            contentType: file.type,
          });

      if (uploadError) {
        setMessage(
          `Ошибка загрузки: ${uploadError.message}`
        );
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl =
        `${publicUrl}?v=${Date.now()}`;

      const { data, error: profileError } =
        await supabase
          .from("profiles")
          .update({
            avatar_url: avatarUrl,
          })
          .eq("id", user.id)
          .select("*")
          .single();

      if (profileError) {
        setMessage(
          `Аватар загружен, но профиль не обновлён: ${profileError.message}`
        );
        return;
      }

      setProfile(data);
      setMessage("Аватар успешно обновлён.");
    } catch {
      setMessage(
        "Произошла ошибка при загрузке аватара."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4">
        <p className="text-text-secondary">
          Загрузка профиля...
        </p>
      </div>
    );
  }

  if (!user) return null;

  const hasFrame = avatarFrame !== "none";

  const frameClip = getFrameClip(avatarFrame);

  const frameRadius =
    getFrameRadius(avatarFrame);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Мой профиль
        </h1>

        <p className="mt-2 text-text-secondary">
          Управление аккаунтом GameTrade
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <section className="rounded-3xl border border-border bg-card p-6">
          {/* Большой аватар с выбранной рамкой */}
          <div className="mx-auto flex h-32 w-32 items-center justify-center">
            {hasFrame ? (
              <div className="relative flex h-32 w-32 items-center justify-center">
                {/* Свечение */}
                <div
                  className="absolute inset-2 scale-110 blur-xl"
                  style={{
                    backgroundColor: avatarColor,
                    opacity: 0.45,
                    clipPath: frameClip,
                    borderRadius: frameRadius,
                  }}
                />

                {/* Внешняя цветная рамка */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: avatarColor,
                    clipPath: frameClip,
                    borderRadius: frameRadius,
                    filter: `drop-shadow(0 0 10px ${avatarColor}) drop-shadow(0 0 22px ${avatarColor})`,
                  }}
                />

                {/* Внутренняя часть */}
                <div
                  className="relative flex h-[112px] w-[112px] items-center justify-center overflow-hidden bg-[#07101d] text-4xl font-bold text-white"
                  style={{
                    clipPath: frameClip,
                    borderRadius: frameRadius,
                  }}
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Аватар пользователя"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-accent">
                      {profile?.username
                        ?.charAt(0)
                        .toUpperCase() ??
                        user.email
                          ?.charAt(0)
                          .toUpperCase() ??
                        "U"}
                    </span>
                  )}
                </div>

                {/* Внутренняя световая линия */}
                <div
                  className="pointer-events-none absolute inset-[6px]"
                  style={{
                    clipPath: frameClip,
                    borderRadius: frameRadius,
                    boxShadow: `inset 0 0 8px rgba(255,255,255,0.25), inset 0 0 16px ${avatarColor}`,
                  }}
                />
              </div>
            ) : (
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent text-4xl font-bold text-white">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Аватар пользователя"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile?.username
                    ?.charAt(0)
                    .toUpperCase() ??
                  user.email
                    ?.charAt(0)
                    .toUpperCase() ??
                  "U"
                )}
              </div>
            )}
          </div>

          <div className="mt-5 text-center">
            <label className="inline-flex cursor-pointer items-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary/50">
              {uploading
                ? "Загрузка..."
                : "Изменить аватар"}

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
            <h2 className="font-semibold">
              {profile?.username ||
                "Новый пользователь"}
            </h2>

            {profile?.profile_id && (
              <p className="mt-1 text-xs text-text-secondary">
                ID: {profile.profile_id}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="mb-6 text-xl font-bold">
            Информация аккаунта
          </h2>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm text-text-secondary">
                Имя пользователя
              </label>

              <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm">
                {profile?.username ||
                  "Не указано"}
              </div>

              <p className="mt-2 text-xs text-text-secondary">
                Никнейм выбирается при регистрации и
                не может быть изменён.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-text-secondary">
                ID профиля
              </label>

              <div className="rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm">
                {profile?.profile_id ||
                  "Загрузка..."}
              </div>

              <p className="mt-2 text-xs text-text-secondary">
                Уникальный идентификатор вашего
                профиля GameTrade.
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
                {new Date(
                  profile?.created_at ||
                    user.created_at
                ).toLocaleDateString("ru-RU")}
              </div>
            </div>
          </div>

          {message && (
            <div className="mt-5 rounded-xl border border-border bg-background p-3 text-sm">
              {message}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}