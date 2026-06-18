import { AppShell } from "@/components/app-shell";
import { WorkspaceSkeleton } from "@/components/workspace-chrome";

export default function SettingsLoading() {
  return (
    <AppShell>
      <WorkspaceSkeleton title="Loading settings center" />
    </AppShell>
  );
}
