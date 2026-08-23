import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/lib/data";
import Link from "next/link";

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Каталог</h1>
        <p className="text-text-secondary text-sm">
          Все предложения по игровым аккаунтам, бусту и услугам
        </p>
      </div>

      {/* Filters bar */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/catalog"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Все
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/catalog/${cat.slug}`}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-text-secondary hover:border-primary/50 hover:text-foreground transition"
          >
            {cat.icon} {cat.name}
          </Link>
        ))}
      </div>

      {/* Sort + count */}
      <div className="mb-4 flex items-center justify-between text-sm text-text-secondary">
        <span>{products.length} предложений</span>
        <select className="rounded-lg border border-border bg-card px-3 py-1.5 text-foreground focus:outline-none focus:border-primary">
          <option>Сначала популярные</option>
          <option>Сначала дешёвые</option>
          <option>Сначала дорогие</option>
          <option>По рейтингу</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
