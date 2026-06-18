import { AppShell } from "@/components/app-shell";
import { WorkspaceSkeleton } from "@/components/workspace-chrome";

export default function LoadingKnowledge() {
  return (
    <AppShell>
      <WorkspaceSkeleton title="Loading knowledge hub" />
    </AppShell>
  );
}
