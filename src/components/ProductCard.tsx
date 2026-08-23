import Link from "next/link";
import type { Product } from "@/lib/data";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:bg-card-hover glow-card"
    >
      {/* Image placeholder */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#1e0b36] to-[#2e1065]">
        <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-40 group-hover:scale-110 transition-transform duration-500">
          {product.category === "accounts" && "👤"}
          {product.category === "boost" && "🚀"}
          {product.category === "currency" && "💰"}
          {product.category === "services" && "🛠️"}
          {product.category === "items" && "🎒"}
          {product.category === "keys" && "🔑"}
        </div>

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {product.delivery === "auto" && (
            <span className="rounded-md bg-success/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              АВТО
            </span>
          )}
          {product.oldPrice && (
            <span className="rounded-md bg-danger/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              СКИДКА
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3.5">
        <div className="mb-1 text-xs text-text-secondary">{product.game}</div>
        <h3 className="mb-2 line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-1">
          {product.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-accent/20 px-1.5 py-0.5 text-[10px] text-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Price + Seller */}
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-foreground">
                {product.price.toLocaleString("ru-RU")} ₽
              </span>
              {product.oldPrice && (
                <span className="text-xs text-text-secondary line-through">
                  {product.oldPrice.toLocaleString("ru-RU")} ₽
                </span>
              )}
            </div>
            <div className="mt-0.5 text-[11px] text-text-secondary">
              {product.sales} продаж
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-warning">★</span>
              <span className="font-medium">{product.seller.rating}</span>
            </div>
            <div className="text-[11px] text-text-secondary truncate max-w-[90px]">
              {product.seller.name}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
