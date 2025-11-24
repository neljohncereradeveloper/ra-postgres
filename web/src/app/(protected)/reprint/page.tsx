import { SidebarInset } from "@/components/ui/sidebar";
import { ReprintCastVote } from "@/components/reprint";

export const metadata = {
  title: "Reprint",
  description: "Reprint.",
};

export const dynamic = "force-dynamic";

export default function CastVotePage() {
  return (
    <SidebarInset>
      {/* <PageHeader breadcrumbs={[{ label: "Reprint" }]} /> */}
      <div className="flex-1 h-full overflow-auto">
        <ReprintCastVote />
      </div>
    </SidebarInset>
  );
}
