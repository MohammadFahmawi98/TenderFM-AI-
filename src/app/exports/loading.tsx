import { AppShell } from "@/components/app-shell";
import { WorkspaceSkeleton } from "@/components/workspace-chrome";

export default function LoadingExports() {
  return (
    <AppShell>
      <WorkspaceSkeleton title="Loading export center" />
    </AppShell>
  );
}
