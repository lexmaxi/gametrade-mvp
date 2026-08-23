import { products } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-text-secondary">
        <Link href="/" className="hover:text-primary">
          Главная
        </Link>
        <span className="mx-2">/</span>
        <Link href="/catalog" className="hover:text-primary">
          Каталог
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.game}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Image */}
        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#1e0b36] to-[#2e1065] aspect-square flex items-center justify-center">
          <span className="text-8xl opacity-50">
            {product.category === "accounts" && "👤"}
            {product.category === "boost" && "🚀"}
            {product.category === "currency" && "💰"}
            {product.category === "services" && "🛠️"}
          </span>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <div className="mb-2 text-sm text-text-secondary">{product.game}</div>
          <h1 className="mb-4 text-2xl font-bold leading-tight sm:text-3xl">
            {product.title}
          </h1>

          {/* Tags */}
          <div className="mb-6 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg bg-accent/20 px-2.5 py-1 text-xs text-muted"
              >
                {tag}
              </span>
            ))}
            {product.delivery === "auto" && (
              <span className="rounded-lg bg-success/20 px-2.5 py-1 text-xs text-success">
                Автовыдача
              </span>
            )}
          </div>

          {/* Price block */}
          <div className="mb-6 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-bold">
                {product.price.toLocaleString("ru-RU")} ₽
              </span>
              {product.oldPrice && (
                <span className="text-lg text-text-secondary line-through">
                  {product.oldPrice.toLocaleString("ru-RU")} ₽
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Комиссия площадки 5% уже включена в цену
            </p>

            <button className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-hover py-3.5 text-base font-semibold text-white hover:opacity-90 transition glow-primary mb-3">
              Купить сейчас
            </button>
            <button className="w-full rounded-xl border border-border bg-card py-3 text-sm font-medium text-foreground hover:border-primary/50 transition">
              Написать продавцу
            </button>
          </div>

          {/* Seller */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{product.seller.name}</div>
                <div className="flex items-center gap-1 text-sm text-text-secondary mt-0.5">
                  <span className="text-warning">★</span>
                  <span>{product.seller.rating}</span>
                  <span>·</span>
                  <span>{product.seller.sales} продаж</span>
                </div>
              </div>
              <Link
                href={`/seller/${product.seller.name}`}
                className="rounded-lg border border-border px-3 py-1.5 text-sm hover:border-primary/50 transition"
              >
                Профиль
              </Link>
            </div>
          </div>

          {/* Guarantee note */}
          <div className="mt-6 rounded-2xl border border-success/30 bg-success/5 p-4 text-sm">
            <div className="font-medium text-success mb-1">🛡 Гарантия сделки</div>
            <p className="text-text-secondary">
              Деньги удерживаются на эскроу до вашего подтверждения. При
              проблемах — бесплатный арбитраж.
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-3 text-lg font-semibold">Описание</h2>
        <p className="text-text-secondary leading-relaxed">
          {product.title}. Полный доступ к аккаунту / услуге. После оплаты вы
          получите все необходимые данные. При возникновении вопросов продавец
          на связи в чате. Площадка гарантирует безопасность сделки.
        </p>
      </div>
    </div>
  );
}
