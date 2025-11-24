"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { NavUser } from "@/components/auth/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AppHeader } from "./app-header";
import { NavMain } from "./nav-main";
import { NAV_ITEMS, NavItemConfig } from "@/lib/configs/navigation.config";
import { getClientSession } from "@/lib/auth/client";

// Dashboard data that is always shown
// const dashboardData = {
//   title: "Dashboard",
//   url: "/dashboard",
//   icon: Home,
// };

// User data
const userData = {
  name: "Account Management",
  username: "profile",
  avatar: "/profile.svg",
};

function hasRequiredModules(
  userModules: string[],
  requiredModules: string[]
): boolean {
  return requiredModules.every((mod) => userModules.includes(mod));
}

function getSectionLabel(pathname: string) {
  if (pathname.includes("/cast-vote")) return "Cast Vote";
  if (
    pathname.includes("/elections") ||
    pathname.includes("/districts") ||
    pathname.includes("/positions") ||
    pathname.includes("/delegates") ||
    pathname.includes("/candidates") ||
    pathname.includes("/user") ||
    pathname.includes("/settings")
  )
    return "Admin Management";
  return "Cast Vote";
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  // State for navigation items
  const [navItems, setNavItems] = React.useState<NavItemConfig[]>([]);
  // Initialize section label based on current path
  const [sectionLabel, setSectionLabel] = React.useState(
    getSectionLabel(pathname)
  );

  React.useEffect(() => {
    async function checkAccess() {
      // Get all module access for the user
      const session = await getClientSession();
      const userModules = session?.applicationAccess
        ? session.applicationAccess
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      // Filter nav items based on access
      const filteredItems = NAV_ITEMS.filter((item) =>
        hasRequiredModules(userModules, item.requiredModules)
      );

      setSectionLabel(getSectionLabel(pathname));
      setNavItems(filteredItems);
    }
    checkAccess();
  }, [pathname]);

  return (
    <Sidebar collapsible="icon" {...props} className="print:hidden">
      <SidebarHeader>
        <AppHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} sectionLabel={sectionLabel} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
