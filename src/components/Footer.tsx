import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-[#08040f]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
                GT
              </div>
              <span className="text-lg font-bold gradient-text">GameTrade</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Безопасный маркетплейс игровых аккаунтов, буста и услуг. Комиссия всего 5%.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Категории</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link href="/catalog/accounts" className="hover:text-primary transition">Аккаунты</Link></li>
              <li><Link href="/catalog/boost" className="hover:text-primary transition">Буст</Link></li>
              <li><Link href="/catalog/services" className="hover:text-primary transition">Услуги</Link></li>
              <li><Link href="/catalog/currency" className="hover:text-primary transition">Валюта</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Информация</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link href="/about" className="hover:text-primary transition">О нас</Link></li>
              <li><Link href="/guarantee" className="hover:text-primary transition">Гарантии</Link></li>
              <li><Link href="/rules" className="hover:text-primary transition">Правила</Link></li>
              <li><Link href="/support" className="hover:text-primary transition">Поддержка</Link></li>
            </ul>
          </div>

          {/* Payments */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Оплата</h4>
            <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
              <span className="rounded-lg border border-border bg-card px-2.5 py-1.5">ЮMoney</span>
              <span className="rounded-lg border border-border bg-card px-2.5 py-1.5">СБП</span>
              <span className="rounded-lg border border-border bg-card px-2.5 py-1.5">Карты</span>
              <span className="rounded-lg border border-border bg-card px-2.5 py-1.5">Мир</span>
            </div>
            <p className="mt-3 text-xs text-text-secondary">
              Безопасные сделки через эскроу. Комиссия 5%.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-text-secondary">
          © 2026 GameTrade. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
