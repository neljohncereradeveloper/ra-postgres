import { SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/shared/page-header";
import { PrecinctManagement } from "@/components/admin/precinct";

export const metadata = {
  title: "Precinct Management",
  description: "Manage precincts.",
};

export const dynamic = "force-dynamic";

export default async function DistrictPage() {
  return (
    <SidebarInset>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/precinct" },
          { label: "Precincts" },
        ]}
      />
      <div className="flex-1 h-full overflow-auto">
        <PrecinctManagement />
      </div>
    </SidebarInset>
  );
}
