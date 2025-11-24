import { SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/shared/page-header";
import { PositionManagement } from "@/components/admin/position";

export const metadata = {
  title: "Position Management",
  description: "Manage positions.",
};

export const dynamic = "force-dynamic";

export default async function PositionPage() {
  return (
    <SidebarInset>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Positions" },
        ]}
      />
      <PositionManagement />
    </SidebarInset>
  );
}
