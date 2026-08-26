"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
    <header className="sticky top-0 z-50 border-b border-border bg-[#0b0614]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-lg font-bold text-white">
            GT
          </div>

          <span className="hidden text-xl font-bold gradient-text sm:block">
            GameTrade
          </span>
        </Link>

        <div className="max-w-xl flex-1">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск аккаунтов, буста, услуг..."
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-text-secondary/60 transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />

            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 0 0 0 14 0z"
              />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/sell"
            className="hidden items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 glow-primary sm:flex"
          >
            Продать
          </Link>

          <Link
            href="/favorites"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-text-secondary transition hover:border-primary/50 hover:text-foreground"
            title="Избранное"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </Link>

          <Link
            href="/chat"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-text-secondary transition hover:border-primary/50 hover:text-foreground"
            title="Сообщения"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>

            {unreadMessages > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                {unreadMessages > 99
                  ? "99+"
                  : unreadMessages}
              </span>
            )}
          </Link>

          <Link
            href="/orders"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-text-secondary transition hover:border-primary/50 hover:text-foreground"
            title="Мои сделки"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 22a10 10 0 100-20 10 10 0 000 20z"
              />
            </svg>
          </Link>

          {username || email ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-2 text-sm font-medium text-foreground transition hover:border-primary/50 sm:px-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Аватар пользователя"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (username || email || "U")
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>

                <span className="hidden max-w-[160px] truncate sm:inline">
                  {username || email}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="hidden h-10 items-center rounded-xl border border-border bg-card px-3 text-sm text-text-secondary transition hover:border-primary/50 hover:text-foreground sm:flex"
              >
                Выйти
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground transition hover:border-primary/50"
            >
              <svg
                className="h-5 w-5 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
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