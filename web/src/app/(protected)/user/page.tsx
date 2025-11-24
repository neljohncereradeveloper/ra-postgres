import { UserManagement } from "@/components/admin/user";
import { SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "User Management",
  description: "Manage system users.",
};

export const dynamic = "force-dynamic";

export default async function UserPage() {
  return (
    <SidebarInset>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "User Management" },
        ]}
      />
      <div className="flex-1 h-full overflow-auto">
        <UserManagement />
      </div>
    </SidebarInset>
  );
}
