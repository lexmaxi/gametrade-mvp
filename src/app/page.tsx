import Image from "next/image";
import Link from "next/link";

import CategoryGrid from "@/components/CategoryGrid";
import ListingsFeed from "@/components/ListingsFeed";
import { popularGames } from "@/lib/data";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-[1600px] px-3 pb-8 sm:px-5 lg:px-7">
      <section className="relative min-h-[440px] overflow-hidden border-b border-white/[0.05] bg-[#050914] lg:min-h-[450px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_40%,rgba(109,40,217,0.25),transparent_35%),radial-gradient(circle_at_90%_30%,rgba(37,99,235,0.18),transparent_30%)]" />

        <div className="absolute right-0 top-0 hidden h-full w-[72%] lg:block">
          <Image
            src="/images/hero-gaming.png"
            alt="Игровой мир GameTrade"
            fill
            priority
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#050914] via-[#050914]/70 to-transparent" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#050914]/70 via-transparent to-[#050914]/10" />
        </div>

        <div className="absolute -right-32 top-0 hidden h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] lg:block" />

        <div className="relative z-10 flex min-h-[440px] items-center py-10 lg:min-h-[450px] lg:w-[48%] lg:py-12">
          <div className="max-w-[600px]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2V10a2 2 0 00-2-2h-1V6a5 5 0 00-10 0v2H6a2 2 0 00-2 2v9a2 2 0 002 2z"
                />
              </svg>

              №1 Маркетплейс игровых товаров
            </div>

            <h1 className="mb-4 text-[38px] font-bold leading-[1.13] tracking-tight text-white sm:text-5xl lg:text-[42px] xl:text-[48px]">
              Покупайте и продавайте
              <br />

              <span className="gradient-text">
                игровые аккаунты,
              </span>

              <br />

              <span className="gradient-text">
                буст и услуги
              </span>
            </h1>

            <p className="max-w-[520px] text-sm leading-6 text-text-secondary lg:text-[15px]">
              Безопасная площадка для сделок с игровыми аккаунтами,
              валютой и услугами. Удобное общение с продавцом, отзывы
              и защита сделки.
            </p>

            <div className="mt-6 grid max-w-[610px] grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="flex min-h-[58px] items-center gap-2.5 rounded-xl border border-white/[0.06] bg-[#0a1120]/80 px-3 py-2 backdrop-blur-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <svg
                    className="h-[19px] w-[19px] text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M9 12l2 2 4-4"
                    />
                  </svg>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-white">
                    Безопасные сделки
                  </div>

                  <div className="mt-0.5 text-[9px] text-text-secondary">
                    Защита каждой сделки
                  </div>
                </div>
              </div>

              <div className="flex min-h-[58px] items-center gap-2.5 rounded-xl border border-white/[0.06] bg-[#0a1120]/80 px-3 py-2 backdrop-blur-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/[0.08] text-sm font-medium text-blue-300">
                  5%
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-white">
                    Низкая комиссия
                  </div>

                  <div className="mt-0.5 text-[9px] text-text-secondary">
                    Всего 5% с продажи
                  </div>
                </div>
              </div>

              <div className="flex min-h-[58px] items-center gap-2.5 rounded-xl border border-white/[0.06] bg-[#0a1120]/80 px-3 py-2 backdrop-blur-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <svg
                    className="h-[19px] w-[19px] text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M3 18v-2a4 4 0 014-4h1a4 4 0 014 4v2M7.5 8a3 3 0 100-6 3 3 0 000 6zm7 8a3 3 0 016 0v2M17.5 8a3 3 0 100-6"
                    />
                  </svg>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-white">
                    Поддержка 24/7
                  </div>

                  <div className="mt-0.5 text-[9px] text-text-secondary">
                    Всегда на связи
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="group flex h-[50px] min-w-[245px] items-center justify-center gap-4 rounded-lg bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] px-5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(109,40,217,0.25)] transition hover:brightness-110"
              >
                Смотреть каталог

                <svg
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M5 12h14m-6-6l6 6-6 6"
                  />
                </svg>
              </Link>

              <Link
                href="/sell"
                className="flex h-[50px] min-w-[245px] items-center justify-center gap-3 rounded-lg border border-primary/30 bg-[#080d19]/70 px-5 text-sm font-semibold text-white transition hover:border-primary/50 hover:bg-primary/[0.06]"
              >
                Начать продавать

                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M4 7h16v10H4zM7 7V5h10v2M8 17v2m8-2v2M9 11h.01M15 11h.01"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a1120]/75 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              Категории
            </h2>

            <Link
              href="/catalog"
              className="rounded-lg border border-white/[0.07] bg-[#0a1120] px-3 py-1.5 text-[10px] text-text-secondary transition hover:text-white"
            >
              Все категории
            </Link>
          </div>

          <CategoryGrid />
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a1120]/75 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              Популярные игры
            </h2>

            <Link
              href="/catalog"
              className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-[#0a1120] px-3 py-1.5 text-[10px] text-text-secondary transition hover:text-white"
            >
              Все игры

              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 18l6-6-6-6"
                />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {popularGames.map((game) => (
              <Link
                key={game.slug}
                href={`/catalog?game=${game.slug}`}
                className="group flex min-h-[118px] flex-col items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-[#0c1423] p-2 transition hover:-translate-y-0.5 hover:border-primary/40"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-primary/15 to-accent/10 text-xl transition group-hover:scale-105">
                  🎮
                </div>

                <span className="text-center text-[10px] font-medium leading-tight text-white">
                  {game.name}
                </span>

                <span className="text-[9px] text-text-secondary">
                  2 000+
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a1120]/75 p-3 sm:p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <span>🔥</span>
              Горячие предложения
            </h2>

            <Link
              href="/catalog"
              className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-[#0a1120] px-3 py-1.5 text-[10px] text-text-secondary transition hover:text-white"
            >
              Смотреть все

              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 18l6-6-6-6"
                />
              </svg>
            </Link>
          </div>

          <ListingsFeed />
        </section>

        <section className="rounded-2xl border border-primary/15 bg-gradient-to-br from-[#12132a] to-[#0a1120] p-4">
          <h2 className="mb-3 text-base font-semibold text-white">
            Почему выбирают GameTrade?
          </h2>

          <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-3">
            <div className="rounded-xl border border-white/[0.07] bg-[#0c1423]/80 p-3">
              <div className="mb-4 flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                01
              </div>

              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-primary">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  />
                </svg>
              </div>

              <h3 className="text-[11px] font-semibold text-white">
                Безопасность
              </h3>

              <p className="mt-2 text-[9px] leading-4 text-text-secondary">
                Защищаем каждую сделку, проверяем продавцов.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-[#0c1423]/80 p-3">
              <div className="mb-4 flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                02
              </div>

              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-primary">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                  />
                </svg>
              </div>

              <h3 className="text-[11px] font-semibold text-white">
                Удобство
              </h3>

              <p className="mt-2 text-[9px] leading-4 text-text-secondary">
                Общайтесь прямо на сайте, уточняйте детали.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-[#0c1423]/80 p-3">
              <div className="mb-4 flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                03
              </div>

              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-primary">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 2l2.9 5.8 6.4.9-4.6 4.5 1.1 6.3-5.8-3-5.8 3 1.1-6.3-4.6-4.5 6.4-.9L12 2z"
                  />
                </svg>
              </div>

              <h3 className="text-[11px] font-semibold text-white">
                Надёжность
              </h3>

              <p className="mt-2 text-[9px] leading-4 text-text-secondary">
                Система отзывов и рейтинг помогают выбрать.
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0c1423]/60 p-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                ●
              </div>

              <div>
                <div className="text-[11px] font-semibold text-white">
                  50 000+
                </div>

                <div className="text-[8px] text-text-secondary">
                  Активных пользователей
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0c1423]/60 p-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400">
                ◎
              </div>

              <div>
                <div className="text-[11px] font-semibold text-white">
                  200 000+
                </div>

                <div className="text-[8px] text-text-secondary">
                  Успешных сделок
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0c1423]/60 p-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                ✓
              </div>

              <div>
                <div className="text-[11px] font-semibold text-white">
                  98%
                </div>

                <div className="text-[8px] text-text-secondary">
                  Положительных отзывов
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}