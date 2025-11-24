import { SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/shared/page-header";
import { ElectionManagement } from "@/components/admin/election";

export const metadata = {
  title: "Election Management",
  description: "Manage elections.",
};

export const dynamic = "force-dynamic";

export default async function ElectionPage() {
  return (
    <SidebarInset>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Elections" },
        ]}
      />
      <div className="flex-1 h-full overflow-auto">
        <ElectionManagement />
      </div>
    </SidebarInset>
  );
}
