import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { requireAuth } from "@/lib/auth/server";

// Force dynamic rendering for all protected routes
export const dynamic = "force-dynamic";

// Server component that now also checks for basic authentication
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure the user is authenticated before rendering any part of the protected layout
  await requireAuth();

  return (
    // Client-side auth provider for navigation and maintaining auth state
    <AuthProvider>
      <SidebarProvider>
        <AppSidebar />
        {children}
      </SidebarProvider>
    </AuthProvider>
  );
}
