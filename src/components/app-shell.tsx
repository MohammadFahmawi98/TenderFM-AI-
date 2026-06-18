"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Search, Sparkles } from "lucide-react";
import { navItems } from "@/lib/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#0B1020] text-[#F8FAFC]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-[#1E293B] bg-[#0F172A]/95 lg:block">
          <Link href="/" className="flex h-20 items-center gap-3 border-b border-[#1E293B] px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3B82F6]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">TenderFlow</p>
              <p className="text-xs text-[#94A3B8]">FM AI Command</p>
            </div>
          </Link>
          <nav className="space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition ${
                    active
                      ? "bg-[#1E293B] text-white"
                      : "text-[#94A3B8] hover:bg-[#111827] hover:text-white"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-[#1E293B] bg-[#0B1020]/88 px-4 backdrop-blur md:px-8">
            <div className="flex h-20 items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#3B82F6]">
                  Facility Management Tender Intelligence
                </p>
                <h1 className="truncate text-xl font-semibold md:text-2xl">
                  TenderFlow FM AI
                </h1>
              </div>
              <div className="hidden min-w-72 items-center gap-2 rounded-md border border-[#1E293B] bg-[#111827] px-3 py-2 md:flex">
                <Search className="h-4 w-4 text-[#94A3B8]" />
                <input
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#94A3B8]"
                  placeholder="Search tenders, clients, documents"
                />
              </div>
              <Link
                href="/tenders/new"
                className="flex h-10 items-center gap-2 rounded-md bg-[#3B82F6] px-4 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                New Tender
              </Link>
            </div>
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}
