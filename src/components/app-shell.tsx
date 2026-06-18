"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CommandBar } from "@/components/command-bar";
import { navItems } from "@/lib/navigation";
import { SignOutButton } from "@/components/sign-out-button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="grid min-h-screen md:grid-cols-[240px_1fr]">
        <aside className="hidden max-h-screen border-r border-[#162033] bg-[#0B1220] md:sticky md:top-0 md:block md:overflow-y-auto">
          <Link href="/" className="block border-b border-[#162033] px-6 py-7">
            <p className="text-lg font-semibold tracking-tight">TenderFlow</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#94A3B8]">FM AI</p>
          </Link>

          <nav className="py-5">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href === "/workspaces" && pathname.startsWith("/workspace"));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group relative flex h-12 items-center px-6 text-[13px] font-medium tracking-[0.13em] transition ${
                    active ? "bg-[#111827] text-white" : "text-[#94A3B8] hover:bg-[#0F172A] hover:text-white"
                  }`}
                >
                  <span
                    className={`absolute left-0 top-2 h-8 w-[3px] rounded-r-full transition ${
                      active ? "bg-[#00E5FF]" : "bg-transparent group-hover:bg-[#1E293B]"
                    }`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mx-4 mt-4 rounded-lg border border-[#162033] bg-[#111827] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00E5FF]">AI Bid Department</p>
            <p className="mt-3 text-sm leading-6 text-[#94A3B8]">
              Upload an RFP. TenderFlow activates the bid team and prepares the submission package.
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-[#162033] bg-[#050816]/90 px-4 backdrop-blur md:px-8">
            <div className="flex h-20 items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#00E5FF]">AI Tender Operating System</p>
                <h1 className="truncate text-xl font-semibold tracking-tight md:text-2xl">TenderFlow FM AI</h1>
              </div>
              <div className="flex items-center gap-2">
                <CommandBar />
                <SignOutButton />
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto border-t border-[#162033] py-2 md:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`shrink-0 rounded-md border px-3 py-1.5 text-xs tracking-[0.12em] ${
                    pathname === item.href || (item.href === "/workspaces" && pathname.startsWith("/workspace"))
                      ? "border-[#00E5FF] bg-[#00E5FF]/10 text-white"
                      : "border-[#162033] bg-[#111827] text-[#94A3B8]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}
