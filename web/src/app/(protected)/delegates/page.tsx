import { SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/shared/page-header";
import { CDelegates } from "@/components/admin/delegates";

export const metadata = {
  title: "Delegates Management",
  description: "Manage delegates.",
};

export const dynamic = "force-dynamic";

export default async function DelegatesPage() {
  return (
    <SidebarInset>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Delegates" },
        ]}
      />
      <div className="flex-1 h-full overflow-auto">
        <CDelegates />
      </div>
    </SidebarInset>
  );
}
