"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#0b0614]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white font-bold text-lg">
            GT
          </div>
          <span className="hidden sm:block text-xl font-bold gradient-text">
            GameTrade
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск аккаунтов, буста, услуг..."
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 pl-10 text-sm text-foreground placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/sell"
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition glow-primary"
          >
            Продать
          </Link>

          <Link
            href="/favorites"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-text-secondary hover:text-foreground hover:border-primary/50 transition"
            title="Избранное"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Link>

          <Link
            href="/chat"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-text-secondary hover:text-foreground hover:border-primary/50 transition relative"
            title="Сообщения"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              2
            </span>
          </Link>

          <Link
            href="/login"
            className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground hover:border-primary/50 transition"
          >
            <svg className="h-5 w-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="hidden sm:inline">Войти</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
