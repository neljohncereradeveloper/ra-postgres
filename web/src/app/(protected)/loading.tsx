import { SidebarInset } from "@/components/ui/sidebar"

export default function ProtectedLoading() {
  return (
    <SidebarInset>
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600">Loading content...</p>
      </div>
    </SidebarInset>
  )
} 