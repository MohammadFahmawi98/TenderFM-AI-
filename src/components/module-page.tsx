import { AppShell } from "@/components/app-shell";
import { Card, EmptyState, PageSection } from "@/components/ui";

export function ModulePage({
  title,
  description,
  emptyTitle,
}: {
  title: string;
  description: string;
  emptyTitle: string;
}) {
  return (
    <AppShell>
      <PageSection>
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-[#94A3B8]">{description}</p>
        </div>
        <Card>
          <EmptyState
            title={emptyTitle}
            body="This module will activate from real uploaded tender records, parsed source documents, and database-backed AI results."
          />
        </Card>
      </PageSection>
    </AppShell>
  );
}
