import Link from "next/link";
import { clsx } from "clsx";
import { AnimatedWorkspaceLoader } from "@/components/animated-workspace-loader";

type ViewItem = {
  label: string;
  href: string;
  count?: number | string;
  active?: boolean;
};

export function WorkspaceHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  meta,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  meta?: Array<{ label: string; value: string | number; tone?: "blue" | "green" | "amber" | "red" | "muted" }>;
}) {
  return (
    <section className="rounded-lg border border-[#162033] bg-[#0B1220]">
      <div className="flex flex-col gap-5 px-5 py-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00E5FF]">{eyebrow}</p>
          <h2 className="mt-2 break-words text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
          {subtitle ? <p className="mt-3 max-w-4xl text-sm leading-6 text-[#94A3B8]">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {meta?.length ? (
        <div className="grid border-t border-[#162033] md:grid-cols-4 xl:grid-cols-6">
          {meta.map((item) => (
            <div key={item.label} className="border-b border-r border-[#162033] px-5 py-3 last:border-r-0 md:border-b-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#64748B]">{item.label}</p>
              <p className={clsx("mt-1 text-lg font-semibold", toneClass(item.tone))}>{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function ViewsBar({
  views,
  right,
}: {
  views: ViewItem[];
  right?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-12 flex-col gap-3 rounded-lg border border-[#162033] bg-[#0B1220] px-3 py-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex gap-1 overflow-x-auto">
        {views.map((view) => (
          <Link
            key={`${view.href}-${view.label}`}
            href={view.href}
            className={clsx(
              "inline-flex h-8 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-semibold transition",
              view.active
                ? "bg-[#1E293B] text-white shadow-[inset_0_-2px_0_#00E5FF]"
                : "text-[#94A3B8] hover:bg-[#111827] hover:text-white",
            )}
          >
            <span>{view.label}</span>
            {view.count !== undefined ? <span className="rounded bg-[#050816] px-1.5 py-0.5 text-[10px] text-[#94A3B8]">{view.count}</span> : null}
          </Link>
        ))}
      </div>
      {right ? <div className="flex shrink-0 flex-wrap items-center gap-2">{right}</div> : null}
    </div>
  );
}

export function ToolbarButton({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="rounded-md border border-[#1E293B] bg-[#050816] px-3 py-2 text-xs font-semibold text-[#F8FAFC] hover:border-[#00E5FF]/50">
      {children}
    </Link>
  );
}

export function StatusChip({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "blue" | "green" | "amber" | "red" | "muted";
}) {
  return (
    <span className={clsx("inline-flex items-center rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]", chipClass(tone))}>
      {children}
    </span>
  );
}

export function TaskBoard({
  columns,
}: {
  columns: Array<{
    title: string;
    tone?: "blue" | "green" | "amber" | "red" | "muted";
    items: Array<{ id: string; title: string; subtitle?: string; meta?: string }>;
  }>;
}) {
  return (
    <div className="grid gap-3 xl:grid-cols-4">
      {columns.map((column) => (
        <div key={column.title} className="min-h-60 rounded-lg border border-[#162033] bg-[#050816]">
          <div className="flex items-center justify-between border-b border-[#162033] px-3 py-3">
            <div className="flex items-center gap-2">
              <StatusChip tone={column.tone}>{column.title}</StatusChip>
              <span className="text-xs text-[#64748B]">{column.items.length}</span>
            </div>
          </div>
          <div className="space-y-2 p-3">
            {column.items.length === 0 ? (
              <p className="rounded-md border border-dashed border-[#1E293B] p-3 text-xs leading-5 text-[#64748B]">No items in this group.</p>
            ) : (
              column.items.map((item) => (
                <article key={item.id} className="rounded-md border border-[#162033] bg-[#0B1220] p-3">
                  <p className="text-sm font-medium text-[#F8FAFC]">{item.title}</p>
                  {item.subtitle ? <p className="mt-2 text-xs leading-5 text-[#94A3B8]">{item.subtitle}</p> : null}
                  {item.meta ? <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[#64748B]">{item.meta}</p> : null}
                </article>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function WorkspaceSkeleton({ title = "Loading workspace" }: { title?: string }) {
  return (
    <div className="space-y-4 px-4 py-6 md:px-8">
      <AnimatedWorkspaceLoader title={title} />
      <div className="h-12 animate-pulse rounded-lg border border-[#162033] bg-[#0B1220]" />
      <div className="grid gap-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-72 animate-pulse rounded-lg border border-[#162033] bg-[#0B1220]" />
        ))}
      </div>
    </div>
  );
}

function toneClass(tone: "blue" | "green" | "amber" | "red" | "muted" = "muted") {
  return {
    blue: "text-[#00E5FF]",
    green: "text-[#10B981]",
    amber: "text-[#F59E0B]",
    red: "text-[#EF4444]",
    muted: "text-[#F8FAFC]",
  }[tone];
}

function chipClass(tone: "blue" | "green" | "amber" | "red" | "muted") {
  return {
    blue: "bg-[#00E5FF]/10 text-[#00E5FF]",
    green: "bg-[#10B981]/10 text-[#10B981]",
    amber: "bg-[#F59E0B]/10 text-[#F59E0B]",
    red: "bg-[#EF4444]/10 text-[#EF4444]",
    muted: "bg-[#1E293B] text-[#94A3B8]",
  }[tone];
}
