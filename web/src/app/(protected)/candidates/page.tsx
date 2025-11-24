import { SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/shared/page-header";
import { CCandidates } from "@/components/admin/candidates";

export const metadata = {
  title: "Candidates Management",
  description: "Manage candidates.",
};

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  return (
    <SidebarInset>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Candidates" },
        ]}
      />
      <div className="flex-1 h-full overflow-auto">
        <CCandidates />
      </div>
    </SidebarInset>
  );
}
