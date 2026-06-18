import { AppShell } from "@/components/app-shell";
import { Card, PageSection } from "@/components/ui";
import { TenderUploadForm } from "@/components/tender-upload-form";

export default function NewTenderPage() {
  return (
    <AppShell>
      <PageSection>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#00E5FF]">RFP Intake</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Upload the tender package</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#94A3B8]">
            Create the workspace from source documents only. TenderFlow extracts the tender profile, requirements, intelligence, risks,
            and readiness signals from the uploaded files.
          </p>
        </div>
        <Card className="bg-[#0B1220]">
          <TenderUploadForm />
        </Card>
      </PageSection>
    </AppShell>
  );
}
