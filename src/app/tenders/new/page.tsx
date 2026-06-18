import { AppShell } from "@/components/app-shell";
import { Card, PageSection } from "@/components/ui";
import { TenderUploadForm } from "@/components/tender-upload-form";

export default function NewTenderPage() {
  return (
    <AppShell>
      <PageSection>
        <div>
          <h2 className="text-2xl font-semibold">Upload Tender</h2>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Create a real tender record from uploaded documents. Configure PostgreSQL first with a valid organization ID.
          </p>
        </div>
        <Card>
          <TenderUploadForm />
        </Card>
      </PageSection>
    </AppShell>
  );
}
