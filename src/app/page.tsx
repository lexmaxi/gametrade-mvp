import Link from "next/link";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";
import { products, popularGames } from "@/lib/data";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero */}
      <section className="mb-10 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#1a0b2e] via-[#140a22] to-[#0b0614] p-8 sm:p-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            <span className="gradient-text">Игровые аккаунты</span>
            <br />
            буст и услуги
          </h1>
          <p className="mb-6 text-base text-text-secondary sm:text-lg">
            Безопасные сделки с гарантией. Комиссия всего{" "}
            <span className="font-semibold text-primary">5%</span>. Оплата
            ЮMoney, СБП и картами.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="rounded-xl bg-gradient-to-r from-primary to-primary-hover px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition glow-primary"
            >
              Смотреть каталог
            </Link>
            <Link
              href="/sell"
              className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:border-primary/50 transition"
            >
              Начать продавать
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Категории</h2>
        </div>
        <CategoryGrid />
      </section>

      {/* Popular Games */}
      <section className="mb-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Популярные игры</h2>
          <Link href="/catalog" className="text-sm text-primary hover:underline">
            Все игры →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-8">
          {popularGames.map((game) => (
            <Link
              key={game.slug}
              href={`/catalog?game=${game.slug}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:bg-card-hover"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/30 to-primary/20 text-2xl">
                🎮
              </div>
              <span className="text-center text-xs font-medium text-foreground group-hover:text-primary transition">
                {game.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Hot offers */}
      <section className="mb-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Горячие предложения</h2>
          <Link href="/catalog" className="text-sm text-primary hover:underline">
            Смотреть все →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Trust block */}
      <section className="mt-12 rounded-3xl border border-border bg-card p-8">
        <h2 className="mb-6 text-center text-xl font-bold">Почему GameTrade?</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-2xl">
              🔒
            </div>
            <h3 className="mb-1 font-semibold">Безопасные сделки</h3>
            <p className="text-sm text-text-secondary">
              Деньги на эскроу до подтверждения получения. Арбитраж 24/7.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 text-2xl">
              ⚡
            </div>
            <h3 className="mb-1 font-semibold">Быстрая выдача</h3>
            <p className="text-sm text-text-secondary">
              Автовыдача за минуты. Ручная — с гарантией качества.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-hover/20 text-2xl">
              💰
            </div>
            <h3 className="mb-1 font-semibold">Комиссия 5%</h3>
            <p className="text-sm text-text-secondary">
              Одна из самых низких на рынке. Прозрачные условия.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
