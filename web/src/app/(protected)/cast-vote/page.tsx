import { SidebarInset } from "@/components/ui/sidebar";
import { CastVoteOrchestrator } from "@/components/cast-vote";

export const metadata = {
  title: "Cast Vote",
  description: "Cast vote.",
};

export const dynamic = "force-dynamic";

export default function CastVotePage() {
  return (
    <SidebarInset>
      {/* <PageHeader breadcrumbs={[{ label: "Cast Vote" }]} /> */}
      <div className="flex-1 h-full overflow-auto">
        <CastVoteOrchestrator />
      </div>
    </SidebarInset>
  );
}
