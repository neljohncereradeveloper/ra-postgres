import { SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/shared/page-header";
import { DistrictManagement } from "@/components/admin/district";

export const metadata = {
  title: "District Management",
  description: "Manage districts.",
};

export const dynamic = "force-dynamic";

export default async function DistrictPage() {
  return (
    <SidebarInset>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Districts" },
        ]}
      />
      <div className="flex-1 h-full overflow-auto">
        <DistrictManagement />
      </div>
    </SidebarInset>
  );
}
