import { AlertTriangle, Database, LockKeyhole } from "lucide-react";
import { clsx } from "clsx";

export function PageSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={clsx("space-y-6 px-4 py-6 md:px-8", className)}>{children}</div>;
}

export function Card({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={clsx("rounded-lg border border-[#1E293B] bg-[#111827] p-5", className)}>
      {children}
    </section>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
      <LockKeyhole className="h-8 w-8 text-[#94A3B8]" />
      <p className="mt-4 text-sm font-semibold">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#94A3B8]">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function DatabaseNotice({ ready }: { ready: boolean }) {
  if (ready) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-2 text-xs text-[#A7F3D0]">
        <Database className="h-4 w-4" />
        Database connected. Dashboard values are loaded from real records.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-3 py-2 text-xs text-[#FDE68A]">
      <AlertTriangle className="h-4 w-4" />
      DATABASE_URL is not configured. Real records will appear after PostgreSQL is connected.
    </div>
  );
}
