"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

// Enhanced type definition to support nested menu items
type SubItem = {
  title: string;
  url: string;
  items?: SubItem[];
};

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: SubItem[];
};

// type DashboardItem = {
//   title: string;
//   url: string;
//   icon: LucideIcon;
// };

export function NavMain({
  items,
  sectionLabel = "Platform",
}: {
  items: NavItem[];
  sectionLabel?: string;
}) {
  const pathname = usePathname();

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>{sectionLabel}</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => {
            // Calculate isActive based on the current pathname
            const isActive =
              item.isActive ||
              pathname === item.url ||
              (item.url !== "/" && pathname.startsWith(item.url));

            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  {item.items && item.items.length > 0 ? (
                    <>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <RenderSubItem
                              key={subItem.title}
                              subItem={subItem}
                              pathname={pathname}
                            />
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      data-active={isActive}
                      className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                    >
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}

// Helper component to render nested submenu items
function RenderSubItem({
  subItem,
  pathname,
}: {
  subItem: SubItem;
  pathname: string;
}) {
  const isActive =
    pathname === subItem.url ||
    (subItem.url !== "/" && pathname.startsWith(subItem.url));

  if (subItem.items && subItem.items.length > 0) {
    return (
      <SidebarMenuSubItem key={subItem.title}>
        <Collapsible className="w-full group/sub-collapsible">
          <CollapsibleTrigger asChild>
            <SidebarMenuSubButton
              className="w-full justify-between"
              data-active={isActive}
            >
              <span>{subItem.title}</span>
              <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/sub-collapsible:rotate-90" />
            </SidebarMenuSubButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="pl-4">
              {subItem.items.map((nestedItem) => {
                const isNestedActive =
                  pathname === nestedItem.url ||
                  (nestedItem.url !== "/" &&
                    pathname.startsWith(nestedItem.url));

                return (
                  <SidebarMenuSubItem key={nestedItem.title}>
                    <SidebarMenuSubButton
                      asChild
                      data-active={isNestedActive}
                      className="data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground"
                    >
                      <Link href={nestedItem.url}>
                        <span>{nestedItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuSubItem>
    );
  }

  return (
    <SidebarMenuSubItem key={subItem.title}>
      <SidebarMenuSubButton
        asChild
        data-active={isActive}
        className="data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground"
      >
        <Link href={subItem.url}>
          <span>{subItem.title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
