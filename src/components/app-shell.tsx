"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CommandBar } from "@/components/command-bar";
import { globalNavItems } from "@/lib/navigation";
import { SignOutButton } from "@/components/sign-out-button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="grid min-h-screen md:grid-cols-[220px_1fr]">
        <aside className="hidden max-h-screen border-r border-[#162033] bg-[#0B1220] md:sticky md:top-0 md:flex md:flex-col md:overflow-y-auto">
          <Link href="/" className="block border-b border-[#162033] px-5 py-6">
            <p className="text-lg font-semibold tracking-tight">TenderFlow</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.22em] text-[#94A3B8]">
              FM AI Platform
            </p>
          </Link>

          <nav className="flex-1 py-3">
            {globalNavItems.map((item) => {
              const Icon = item.icon;

              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group relative flex h-10 items-center gap-3 px-5 text-[13px] font-medium transition ${
                    active
                      ? "bg-[#111827] text-white"
                      : "text-[#94A3B8] hover:bg-[#0F172A] hover:text-white"
                  }`}
                >
                  <span
                    className={`absolute left-0 top-1.5 h-7 w-[3px] rounded-r-full transition ${
                      active ? "bg-[#3B82F6]" : "bg-transparent group-hover:bg-[#1E293B]"
                    }`}
                  />
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mx-3 mb-4 rounded-lg border border-[#162033] bg-[#111827] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#3B82F6]">
              Quick Start
            </p>
            <p className="mt-2 text-xs leading-5 text-[#94A3B8]">
              Upload an RFP to create a tender workspace with AI-powered analysis.
            </p>
            <Link
              href="/tenders/new"
              className="mt-3 inline-flex rounded-md bg-[#3B82F6] px-3 py-1.5 text-[11px] font-semibold text-white"
            >
              Upload RFP
            </Link>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-[#162033] bg-[#050816]/90 px-4 backdrop-blur md:px-6">
            <div className="flex h-14 items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold tracking-tight md:text-base">
                  TenderFlow FM AI
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <CommandBar />
                <SignOutButton />
              </div>
            </div>

            <nav className="flex gap-1.5 overflow-x-auto border-t border-[#162033] py-1.5 md:hidden">
              {globalNavItems.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-medium ${
                      active
                        ? "border-[#3B82F6]/50 bg-[#3B82F6]/10 text-white"
                        : "border-[#162033] bg-[#111827] text-[#94A3B8]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}
