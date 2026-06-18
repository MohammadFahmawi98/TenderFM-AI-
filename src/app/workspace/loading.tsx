import { AppShell } from "@/components/app-shell";
import { WorkspaceSkeleton } from "@/components/workspace-chrome";

export default function LoadingWorkspace() {
  return (
    <AppShell>
      <WorkspaceSkeleton title="Loading tender workspace" />
    </AppShell>
  );
}
