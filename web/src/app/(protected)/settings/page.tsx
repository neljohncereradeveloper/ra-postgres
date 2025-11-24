import { AdminSettings } from "@/components/admin/settings";
import { SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "Settings",
  description: "Manage system settings.",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  return (
    <SidebarInset>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />
      <div className="flex-1 h-full overflow-auto">
        <AdminSettings />
      </div>
    </SidebarInset>
  );
}
