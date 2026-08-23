import Link from "next/link";
import { categories } from "@/lib/data";

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/catalog/${cat.slug}`}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-card-hover glow-card"
        >
          <span className="text-3xl transition-transform group-hover:scale-110">
            {cat.icon}
          </span>
          <span className="text-sm font-medium text-foreground">{cat.name}</span>
          <span className="text-xs text-text-secondary">
            {cat.count.toLocaleString("ru-RU")}
          </span>
        </Link>
      ))}
    </div>
  );
}
