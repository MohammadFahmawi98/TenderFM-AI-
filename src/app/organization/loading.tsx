import { AppShell } from "@/components/app-shell";
import { WorkspaceSkeleton } from "@/components/workspace-chrome";

export default function LoadingOrganization() {
  return (
    <AppShell>
      <WorkspaceSkeleton title="Loading organization memory" />
    </AppShell>
  );
}
