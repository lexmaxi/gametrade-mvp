"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  useLanguage,
  type Language,
} from "@/components/LanguageProvider";

import {
  getGameSearchSuggestions,
  normalizeSearchText,
  type GameSearchItem,
} from "@/lib/gameSearch";

const hexagonClip =
  "polygon(50% 0%, 92% 23%, 92% 77%, 50% 100%, 8% 77%, 8% 23%)";

/*
  Компактная десятиконечная звезда.
  Лучи специально сделаны короткими, чтобы рамка выглядела
  декоративно и не закрывала большую часть аватара.
*/
const starClip =
  "polygon(50% 0%, 58% 17%, 71% 6%, 68% 23%, 86% 15%, 77% 31%, 100% 32%, 83% 43%, 98% 50%, 81% 57%, 94% 71%, 76% 69%, 82% 88%, 66% 77%, 58% 96%, 50% 81%, 42% 96%, 34% 77%, 18% 88%, 24% 69%, 6% 71%, 19% 57%, 2% 50%, 17% 43%, 0% 32%, 23% 31%, 14% 15%, 32% 23%, 29% 6%, 42% 17%)";

type MenuView = "main" | "language";

type FrameType =
  | "none"
  | "hexagon"
  | "circle"
  | "star"
  | "diamond"
  | "square";

const FRAME_OPTIONS: {
  id: FrameType;
  name: string;
}[] = [
  {
    id: "none",
    name: "Без рамки",
  },
  {
    id: "hexagon",
    name: "Шестиугольник",
  },
  {
    id: "circle",
    name: "Круг",
  },
  {
    id: "star",
    name: "Десятиконечная звезда",
  },
  {
    id: "diamond",
    name: "Алмаз",
  },
  {
    id: "square",
    name: "Квадрат",
  },
];

const COLOR_OPTIONS = [
  "#8b5cf6",
  "#3b82f6",
  "#06b6d4",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#ec4899",
];

const languages: {
  id: Language;
  name: string;
  nativeName: string;
  flag: string;
}[] = [
  {
    id: "ru",
    name: "Русский",
    nativeName: "Русский",
    flag: "🇷🇺",
  },
  {
    id: "en",
    name: "English",
    nativeName: "Английский",
    flag: "🇬🇧",
  },
  {
    id: "de",
    name: "Deutsch",
    nativeName: "Немецкий",
    flag: "🇩🇪",
  },
  {
    id: "fr",
    name: "Français",
    nativeName: "Французский",
    flag: "🇫🇷",
  },
  {
    id: "es",
    name: "Español",
    nativeName: "Испанский",
    flag: "🇪🇸",
  },
  {
    id: "pl",
    name: "Polski",
    nativeName: "Польский",
    flag: "🇵🇱",
  },
];

function getFrameClip(frame: FrameType) {
  switch (frame) {
    case "hexagon":
      return hexagonClip;

    case "star":
      return starClip;

    case "diamond":
      return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";

    default:
      return undefined;
  }
}

function getFrameRadius(frame: FrameType) {
  switch (frame) {
    case "circle":
      return "9999px";

    case "square":
      return "4px";

    default:
      return undefined;
  }
}

export default function Header() {
  const { language, setLanguage, t } = useLanguage();

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] =
    useState<GameSearchItem[]>([]);
  const [showSuggestions, setShowSuggestions] =
    useState(false);

  const [username, setUsername] =
    useState<string | null>(null);
  const [email, setEmail] =
    useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] =
    useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] =
    useState(0);

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const [menuView, setMenuView] =
    useState<MenuView>("main");

  const [showFrameMenu, setShowFrameMenu] =
    useState(false);

  /*
    appliedFrame / appliedColor — уже применённые настройки.
    Именно они отображаются в Header и профиле.
  */
  const [appliedFrame, setAppliedFrame] =
    useState<FrameType>("hexagon");

  const [appliedColor, setAppliedColor] =
    useState("#8b5cf6");

  /*
    selectedFrame / selectedColor — временный выбор
    внутри окна настройки.
  */
  const [selectedFrame, setSelectedFrame] =
    useState<FrameType>("hexagon");

  const [selectedColor, setSelectedColor] =
    useState("#8b5cf6");

  const [showLogoutConfirm, setShowLogoutConfirm] =
    useState(false);

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const activeLanguage =
    languages.find(
      (item) => item.id === language
    ) ?? languages[0];

  useEffect(() => {
    const savedFrame =
      window.localStorage.getItem(
        "gametrade-avatar-frame"
      ) as FrameType | null;

    const savedColor =
      window.localStorage.getItem(
        "gametrade-avatar-color"
      );

    if (
      savedFrame &&
      FRAME_OPTIONS.some(
        (frame) => frame.id === savedFrame
      )
    ) {
      setAppliedFrame(savedFrame);
      setSelectedFrame(savedFrame);
    }

    if (
      savedColor &&
      COLOR_OPTIONS.includes(savedColor)
    ) {
      setAppliedColor(savedColor);
      setSelectedColor(savedColor);
    }
  }, []);

  useEffect(() => {
    let lastSeenInterval:
      | ReturnType<typeof setInterval>
      | null = null;

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
        console.error(
          "Ошибка обновления last_seen:",
          error
        );
      }
    }

    async function loadUnreadMessages(
      userId: string
    ) {
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
        setShowProfileMenu(false);

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
        console.error(
          "Ошибка загрузки профиля:",
          error
        );
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

  function handleSearchChange(value: string) {
    setSearch(value);

    const normalizedValue =
      normalizeSearchText(value);

    if (!normalizedValue) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const results =
      getGameSearchSuggestions(value, 5);

    setSuggestions(results);
    setShowSuggestions(results.length > 0);
  }

  function handleSuggestionClick(
    game: GameSearchItem
  ) {
    setSearch(game.name);
    setSuggestions([]);
    setShowSuggestions(false);

    window.location.href =
      `/catalog?game=${game.slug}`;
  }

  function openFrameMenu() {
    setSelectedFrame(appliedFrame);
    setSelectedColor(appliedColor);

    setShowProfileMenu(false);
    setShowFrameMenu(true);
  }

  function handleCancelFrame() {
    setSelectedFrame(appliedFrame);
    setSelectedColor(appliedColor);

    setShowFrameMenu(false);
  }

  function handleApplyFrame() {
    setAppliedFrame(selectedFrame);
    setAppliedColor(selectedColor);

    window.localStorage.setItem(
      "gametrade-avatar-frame",
      selectedFrame
    );

    window.localStorage.setItem(
      "gametrade-avatar-color",
      selectedColor
    );

    window.dispatchEvent(
      new Event("gametrade-avatar-style-change")
    );

    setShowFrameMenu(false);
  }

  function selectLanguage(
    newLanguage: Language
  ) {
    setLanguage(newLanguage);
    setMenuView("main");
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({
            last_seen:
              new Date().toISOString(),
          })
          .eq("id", user.id);
      }

      await supabase.auth.signOut();

      window.location.href = "/";
    } catch (error) {
      console.error(
        "Ошибка выхода из аккаунта:",
        error
      );

      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#07101d]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] w-full max-w-[1600px] items-center gap-3 px-3 sm:px-5 lg:px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
          >
            <div className="relative flex h-[48px] w-[48px] items-center justify-center">
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
            </div>

            <span className="hidden text-[18px] font-bold tracking-[0.03em] sm:block">
              <span className="text-white">
                GAME
              </span>

              <span className="text-primary">
                TRADE
              </span>
            </span>
          </Link>

          <Link
            href="/catalog"
            className="hidden h-[38px] shrink-0 items-center gap-2 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/25 to-primary/10 px-4 text-sm font-medium text-white transition hover:border-primary/40 md:flex"
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

            {t("catalog")}
          </Link>

          <div className="relative min-w-0 max-w-[520px] flex-1">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) =>
                  handleSearchChange(e.target.value)
                }
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder={t("searchPlaceholder")}
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

            {showSuggestions &&
              suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[100] overflow-hidden rounded-xl border border-white/[0.1] bg-[#0a1220]/98 p-1.5 shadow-2xl backdrop-blur-xl">
                  {suggestions.map((game) => (
                    <button
                      key={game.slug}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionClick(game);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition hover:bg-primary/10"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                          🎮
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-white">
                            {game.name}
                          </div>

                          <div className="truncate text-[11px] text-text-secondary">
                            Поиск по игре
                          </div>
                        </div>
                      </div>

                      <svg
                        className="h-4 w-4 shrink-0 text-text-secondary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M9 18l6-6-6-6"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
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

              <span>{t("messages")}</span>

              {unreadMessages > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {unreadMessages > 99
                    ? "99+"
                    : unreadMessages}
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

              <span>{t("favorites")}</span>
            </Link>

            <Link
              href="/chat"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0a1220] text-text-secondary transition hover:border-primary/40 hover:text-white lg:hidden"
              title={t("messages")}
            >
              💬

              {unreadMessages > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {unreadMessages > 99
                    ? "99+"
                    : unreadMessages}
                </span>
              )}
            </Link>

            <Link
              href="/favorites"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0a1220] text-text-secondary transition hover:border-primary/40 hover:text-white lg:hidden"
              title={t("favorites")}
            >
              ♡
            </Link>

            {username || email ? (
              <>
                <Link
                  href="/orders"
                  className="hidden h-[38px] items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0a1220] px-3 text-[12px] font-medium text-text-secondary transition hover:border-primary/30 hover:text-white xl:flex"
                >
                  ✓ {t("myDeals")}
                </Link>

                <div className="relative">
                  <div className="flex h-[42px] items-center overflow-hidden rounded-lg border border-white/[0.08] bg-[#0a1220] transition hover:border-primary/35">
                    <Link
                      href="/profile"
                      className="flex h-full items-center px-1.5"
                      title="Мой профиль"
                      onClick={() => {
                        setShowProfileMenu(false);
                      }}
                    >
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                        {appliedFrame !== "none" && (
                          <>
                            <div
                              className="absolute inset-1 scale-110 blur-md"
                              style={{
                                backgroundColor:
                                  appliedColor,
                                opacity: 0.5,
                                clipPath:
                                  getFrameClip(
                                    appliedFrame
                                  ),
                                borderRadius:
                                  getFrameRadius(
                                    appliedFrame
                                  ),
                              }}
                            />

                            <div
                              className="absolute inset-0"
                              style={{
                                backgroundColor:
                                  appliedColor,
                                clipPath:
                                  getFrameClip(
                                    appliedFrame
                                  ),
                                borderRadius:
                                  getFrameRadius(
                                    appliedFrame
                                  ),
                                filter: `drop-shadow(0 0 5px ${appliedColor}) drop-shadow(0 0 10px ${appliedColor})`,
                              }}
                            />
                          </>
                        )}

                        <div
                          className="relative flex h-[35px] w-[35px] items-center justify-center overflow-hidden bg-[#07101d] text-xs font-bold text-white"
                          style={
                            appliedFrame === "none"
                              ? {
                                  borderRadius:
                                    "9999px",
                                }
                              : {
                                  clipPath:
                                    getFrameClip(
                                      appliedFrame
                                    ),
                                  borderRadius:
                                    getFrameRadius(
                                      appliedFrame
                                    ),
                                }
                          }
                        >
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt="Аватар пользователя"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-accent">
                              {(
                                username ||
                                email ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(
                          (current) => !current
                        );
                        setMenuView("main");
                      }}
                      className="flex h-full w-8 items-center justify-center border-l border-white/[0.08] text-text-secondary transition hover:bg-white/[0.05] hover:text-white"
                      title="Открыть меню профиля"
                      aria-label="Открыть меню профиля"
                    >
                      <svg
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          showProfileMenu
                            ? "rotate-180"
                            : ""
                        }`}
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
                    </button>
                  </div>

                  {showProfileMenu && (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-[200] w-[330px] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0a1220]/98 p-1.5 shadow-2xl backdrop-blur-xl">
                      {menuView === "main" && (
                        <>
                          <Link
                            href="/profile"
                            onClick={() =>
                              setShowProfileMenu(false)
                            }
                            className="mb-1 flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.05]"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                              {(
                                username ||
                                email ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-white">
                                {username ||
                                  "Мой профиль"}
                              </div>

                              <div className="truncate text-xs text-text-secondary">
                                {email}
                              </div>
                            </div>
                          </Link>

                          <div className="my-1 h-px bg-white/[0.08]" />

                          <button
                            type="button"
                            onClick={() =>
                              setMenuView("language")
                            }
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-text-secondary transition hover:bg-primary/10 hover:text-white"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05]">
                              🌐
                            </span>

                            <span>{t("language")}</span>

                            <span className="ml-auto text-xs text-primary">
                              {
                                activeLanguage.nativeName
                              }
                            </span>

                            <svg
                              className="h-4 w-4 text-text-secondary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.8}
                                d="M9 18l6-6-6-6"
                              />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={openFrameMenu}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-text-secondary transition hover:bg-primary/10 hover:text-white"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05]">
                              ✨
                            </span>

                            <span>
                              {t("frameAndColor")}
                            </span>

                            <svg
                              className="ml-auto h-4 w-4 text-text-secondary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.8}
                                d="M9 18l6-6-6-6"
                              />
                            </svg>
                          </button>

                          <div className="my-1 h-px bg-white/[0.08]" />

                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileMenu(false);
                              setShowLogoutConfirm(true);
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                              🚪
                            </span>

                            <span>
                              {t("logoutAccount")}
                            </span>
                          </button>
                        </>
                      )}

                      {menuView === "language" && (
                        <div>
                          <div className="flex items-center gap-3 px-2 py-2">
                            <button
                              type="button"
                              onClick={() =>
                                setMenuView("main")
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-white/[0.06] hover:text-white"
                            >
                              ←
                            </button>

                            <div>
                              <h3 className="text-sm font-semibold text-white">
                                {t("selectLanguage")}
                              </h3>

                              <p className="text-[11px] text-text-secondary">
                                {t(
                                  "interfaceLanguage"
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1 px-2 pb-2">
                            {languages.map(
                              (languageOption) => (
                                <button
                                  key={
                                    languageOption.id
                                  }
                                  type="button"
                                  onClick={() =>
                                    selectLanguage(
                                      languageOption.id
                                    )
                                  }
                                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                                    language ===
                                    languageOption.id
                                      ? "bg-primary/10"
                                      : "hover:bg-white/[0.05]"
                                  }`}
                                >
                                  <span className="text-xl">
                                    {
                                      languageOption.flag
                                    }
                                  </span>

                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-white">
                                      {
                                        languageOption.name
                                      }
                                    </div>

                                    <div className="text-[11px] text-text-secondary">
                                      {
                                        languageOption.nativeName
                                      }
                                    </div>
                                  </div>

                                  {language ===
                                    languageOption.id && (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                                      ✓
                                    </div>
                                  )}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
                  {t("login")}
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {showFrameMenu && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#0a1220] p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Рамка и цвет
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Выберите форму рамки и цвет её
                  подсветки.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancelFrame}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary transition hover:bg-white/[0.06] hover:text-white"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 flex justify-center rounded-2xl border border-white/[0.07] bg-[#07101d] py-8">
              <div className="relative flex h-28 w-28 items-center justify-center">
                {selectedFrame !== "none" ? (
                  <>
                    <div
                      className="absolute inset-2 scale-110 blur-xl"
                      style={{
                        backgroundColor:
                          selectedColor,
                        opacity: 0.5,
                        clipPath:
                          getFrameClip(
                            selectedFrame
                          ),
                        borderRadius:
                          getFrameRadius(
                            selectedFrame
                          ),
                      }}
                    />

                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor:
                          selectedColor,
                        clipPath:
                          getFrameClip(
                            selectedFrame
                          ),
                        borderRadius:
                          getFrameRadius(
                            selectedFrame
                          ),
                        filter: `drop-shadow(0 0 10px ${selectedColor}) drop-shadow(0 0 20px ${selectedColor})`,
                      }}
                    />

                    <div
                      className="relative flex h-[98px] w-[98px] items-center justify-center overflow-hidden bg-[#07101d] text-3xl font-bold text-white"
                      style={{
                        clipPath:
                          getFrameClip(
                            selectedFrame
                          ),
                        borderRadius:
                          getFrameRadius(
                            selectedFrame
                          ),
                      }}
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Предпросмотр аватара"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-accent">
                          {(
                            username ||
                            email ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#07101d] text-3xl font-bold text-white">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Предпросмотр аватара"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                        {(
                          username ||
                          email ||
                          "U"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-white">
                Форма рамки
              </h3>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {FRAME_OPTIONS.map((frame) => {
                  const isSelected =
                    selectedFrame === frame.id;

                  return (
                    <button
                      key={frame.id}
                      type="button"
                      onClick={() =>
                        setSelectedFrame(
                          frame.id
                        )
                      }
                      className={`relative flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-primary/70 bg-primary/10"
                          : "border-white/[0.08] bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                        {frame.id === "none" ? (
                          <div className="relative h-8 w-8 rounded-full border-2 border-dashed border-white/30">
                            <div className="absolute left-1/2 top-1/2 h-px w-10 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] bg-red-400" />
                          </div>
                        ) : (
                          <div
                            className="h-8 w-8"
                            style={{
                              backgroundColor:
                                selectedColor,
                              clipPath:
                                getFrameClip(
                                  frame.id
                                ),
                              borderRadius:
                                getFrameRadius(
                                  frame.id
                                ),
                              boxShadow: `0 0 10px ${selectedColor}`,
                            }}
                          />
                        )}
                      </div>

                      <span className="text-sm text-white">
                        {frame.name}
                      </span>

                      {isSelected && (
                        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-7">
              <h3 className="text-sm font-semibold text-white">
                Цвет подсветки
              </h3>

              <div className="mt-3 flex flex-wrap gap-3">
                {COLOR_OPTIONS.map((color) => {
                  const isSelected =
                    selectedColor === color;

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setSelectedColor(color)
                      }
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full transition hover:scale-110 ${
                        isSelected
                          ? "ring-2 ring-white ring-offset-2 ring-offset-[#0a1220]"
                          : ""
                      }`}
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 15px ${color}`,
                      }}
                      aria-label={`Выбрать цвет ${color}`}
                    >
                      {isSelected && (
                        <span className="text-sm font-bold text-white">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-white/[0.08] pt-5">
              <button
                type="button"
                onClick={handleCancelFrame}
                className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-white/[0.08] hover:text-white"
              >
                Отмена
              </button>

              <button
                type="button"
                onClick={handleApplyFrame}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] transition hover:brightness-110"
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0a1220] p-6 shadow-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-2xl">
              🚪
            </div>

            <h2 className="text-xl font-bold text-white">
              Выйти из аккаунта?
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Вы действительно хотите выйти из
              своего аккаунта? Для продолжения
              работы с GameTrade потребуется
              снова войти в аккаунт.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowLogoutConfirm(false)
                }
                disabled={isLoggingOut}
                className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
              >
                Отмена
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut
                  ? "Выход..."
                  : "Выйти"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}