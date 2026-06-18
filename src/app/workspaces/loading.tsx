import { AppShell } from "@/components/app-shell";
import { WorkspaceSkeleton } from "@/components/workspace-chrome";

export default function LoadingWorkspaces() {
  return (
    <AppShell>
      <WorkspaceSkeleton title="Loading workspace list" />
    </AppShell>
  );
}
