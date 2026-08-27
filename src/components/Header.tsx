"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const hexagonClip =
  "polygon(50% 0%, 92% 23%, 92% 77%, 50% 100%, 8% 77%, 8% 23%)";

export default function Header() {
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    let lastSeenInterval: ReturnType<typeof setInterval> | null = null;

    let messagesChannel:
      | ReturnType<typeof supabase.channel>
      | null = null;

    async function updateLastSeen(userId: string) {
      const { error } = await supabase
        .from("profiles")
        .update({
          last_seen: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Ошибка обновления last_seen:", error);
      }
    }

    async function loadUnreadMessages(userId: string) {
      const { count, error } = await supabase
        .from("messages")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("receiver_id", userId)
        .eq("is_read", false);

      if (error) {
        console.error(
          "Ошибка загрузки непрочитанных сообщений:",
          error
        );
        return;
      }

      setUnreadMessages(count ?? 0);
    }

    function subscribeToMessages(userId: string) {
      if (messagesChannel) {
        supabase.removeChannel(messagesChannel);
      }

      messagesChannel = supabase
        .channel(`header-messages-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `receiver_id=eq.${userId}`,
          },
          () => {
            loadUnreadMessages(userId);
          }
        )
        .subscribe();
    }

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUsername(null);
        setEmail(null);
        setAvatarUrl(null);
        setUnreadMessages(0);

        if (lastSeenInterval) {
          clearInterval(lastSeenInterval);
          lastSeenInterval = null;
        }

        if (messagesChannel) {
          supabase.removeChannel(messagesChannel);
          messagesChannel = null;
        }

        return;
      }

      setEmail(user.email ?? null);

      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Ошибка загрузки профиля:", error);
      }

      setUsername(data?.username ?? null);
      setAvatarUrl(data?.avatar_url ?? null);

      await updateLastSeen(user.id);
      await loadUnreadMessages(user.id);

      subscribeToMessages(user.id);

      if (lastSeenInterval) {
        clearInterval(lastSeenInterval);
      }

      lastSeenInterval = setInterval(() => {
        updateLastSeen(user.id);
      }, 60 * 1000);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      subscription.unsubscribe();

      if (lastSeenInterval) {
        clearInterval(lastSeenInterval);
      }

      if (messagesChannel) {
        supabase.removeChannel(messagesChannel);
      }
    };
  }, []);

  async function handleLogout() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profiles")
        .update({
          last_seen: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#050914]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
        >
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
            <div className="absolute inset-1 scale-110 bg-primary/40 blur-lg" />

            <div
              className="absolute inset-0 bg-gradient-to-br from-[#d8b4fe] via-primary to-[#6366f1]"
              style={{
                clipPath: hexagonClip,
                filter:
                  "drop-shadow(0 0 7px rgba(192,132,252,0.95)) drop-shadow(0 0 14px rgba(139,92,246,0.55))",
              }}
            />

            <div
              className="relative h-[43px] w-[43px] overflow-hidden bg-[#07101d]"
              style={{
                clipPath: hexagonClip,
              }}
            >
              <Image
                src="/images/logo.png"
                alt="Логотип GameTrade"
                fill
                priority
                className="object-cover"
              />
            </div>

            <div
              className="pointer-events-none absolute inset-[2px]"
              style={{
                clipPath: hexagonClip,
                boxShadow:
                  "inset 0 0 8px rgba(255,255,255,0.22), inset 0 0 14px rgba(192,132,252,0.45)",
              }}
            />
          </div>

          <span className="hidden text-[18px] font-bold tracking-[0.03em] sm:block">
            <span className="text-white">GAME</span>
            <span className="text-primary">TRADE</span>
          </span>
        </Link>

        <Link
          href="/catalog"
          className="hidden h-[38px] shrink-0 items-center gap-2 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/25 to-primary/10 px-4 text-sm font-medium text-white shadow-[0_0_18px_rgba(139,92,246,0.12)] transition hover:border-primary/40 hover:from-primary/30 hover:to-primary/15 md:flex"
        >
          <svg
            className="h-4 w-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"
            />
          </svg>

          Каталог
        </Link>

        <div className="min-w-0 max-w-[520px] flex-1">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по играм, категориям, товарам..."
              className="h-[38px] w-full rounded-lg border border-white/[0.09] bg-[#0a1220] py-2 pl-10 pr-4 text-[13px] text-foreground placeholder:text-text-secondary/55 transition focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />

            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M21 21l-4.5-4.5m2.5-5.5a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
              />
            </svg>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href="/chat"
            className="relative hidden items-center gap-2 px-2.5 py-2 text-[13px] text-text-secondary transition hover:text-white lg:flex"
          >
            <svg
              className="h-[17px] w-[17px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>

            <span>Сообщения</span>

            {unreadMessages > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unreadMessages > 99 ? "99+" : unreadMessages}
              </span>
            )}
          </Link>

          <Link
            href="/favorites"
            className="hidden items-center gap-2 px-2.5 py-2 text-[13px] text-text-secondary transition hover:text-white lg:flex"
          >
            <svg
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>

            <span>Избранное</span>
          </Link>

          <Link
            href="/chat"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0a1220] text-text-secondary transition hover:border-primary/40 hover:text-white lg:hidden"
            title="Сообщения"
          >
            <svg
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>

            {unreadMessages > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unreadMessages > 99 ? "99+" : unreadMessages}
              </span>
            )}
          </Link>

          <Link
            href="/favorites"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0a1220] text-text-secondary transition hover:border-primary/40 hover:text-white lg:hidden"
            title="Избранное"
          >
            <svg
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </Link>

          {username || email ? (
            <>
              <Link
                href="/orders"
                className="hidden h-[38px] items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0a1220] px-3 text-[12px] font-medium text-text-secondary transition hover:border-primary/30 hover:text-white xl:flex"
              >
                <svg
                  className="h-[18px] w-[18px] shrink-0 text-primary drop-shadow-[0_0_5px_rgba(168,85,247,0.9)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M12 2.4
                       L13.55 5.35
                       L16.9 4.2
                       L17.15 7.75
                       L20.65 8.35
                       L18.7 11.35
                       L21.15 13.9
                       L17.9 15.35
                       L18.15 18.9
                       L14.65 18.35
                       L12 21
                       L9.35 18.35
                       L5.85 18.9
                       L6.1 15.35
                       L2.85 13.9
                       L5.3 11.35
                       L3.35 8.35
                       L6.85 7.75
                       L7.1 4.2
                       L10.45 5.35
                       Z"
                    fill="currentColor"
                    stroke="currentColor"
                  />

                  <path
                    d="M8.5 12.15L10.65 14.3L15.7 9.4"
                    stroke="#ffffff"
                    strokeWidth={2.2}
                  />
                </svg>

                Мои сделки
              </Link>

              <Link
                href="/profile"
                className="flex h-[42px] items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0a1220] px-1.5 pr-2 text-sm transition hover:border-primary/35"
                title="Мой профиль"
              >
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                  <div className="absolute inset-1 scale-110 bg-primary/40 blur-md" />

                  <div
                    className="absolute inset-0 bg-gradient-to-br from-[#d8b4fe] via-primary to-[#6366f1]"
                    style={{
                      clipPath: hexagonClip,
                      filter:
                        "drop-shadow(0 0 5px rgba(192,132,252,0.9)) drop-shadow(0 0 10px rgba(139,92,246,0.5))",
                    }}
                  />

                  <div
                    className="relative flex h-[35px] w-[35px] items-center justify-center overflow-hidden bg-[#07101d] text-xs font-bold text-white"
                    style={{
                      clipPath: hexagonClip,
                    }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Аватар пользователя"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-accent">
                        {(username || email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div
                    className="pointer-events-none absolute inset-[2px]"
                    style={{
                      clipPath: hexagonClip,
                      boxShadow:
                        "inset 0 0 6px rgba(255,255,255,0.2), inset 0 0 10px rgba(192,132,252,0.45)",
                    }}
                  />
                </div>

                <svg
                  className="h-3.5 w-3.5 text-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="hidden h-[38px] items-center rounded-lg border border-white/[0.08] bg-[#0a1220] px-3 text-xs text-text-secondary transition hover:border-red-500/40 hover:text-red-400 2xl:flex"
              >
                Выйти
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="flex h-[38px] items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 text-sm font-medium text-white transition hover:border-primary/45 hover:bg-primary/15"
            >
              <svg
                className="h-4 w-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>

              <span className="hidden sm:inline">
                Войти
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}