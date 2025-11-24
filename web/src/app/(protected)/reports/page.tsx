import { SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/shared/page-header";
import { ReportsManagement } from "@/components/admin/reports";

export const metadata = {
  title: "Reports",
  description: "View reports.",
};

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  return (
    <SidebarInset>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Reports" },
        ]}
      />
      <div className="flex-1 h-full overflow-auto">
        <ReportsManagement />
      </div>
    </SidebarInset>
  );
}
