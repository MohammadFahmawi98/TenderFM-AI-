import { AppShell } from "@/components/app-shell";
import { WorkspaceSkeleton } from "@/components/workspace-chrome";

export default function LoadingDocuments() {
  return (
    <AppShell>
      <WorkspaceSkeleton title="Loading document workspace" />
    </AppShell>
  );
}
