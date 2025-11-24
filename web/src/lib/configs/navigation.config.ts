import {
  Users,
  ClipboardList,
  User,
  Settings,
  Map,
  Lock,
  Briefcase,
  Printer,
} from "lucide-react";
import { AuthApplicationAccessEnum } from "../constants/auth.constants";

export interface NavItemConfig {
  title: string;
  url: string;
  icon: any;
  requiredModules: string[];
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    title: "Cast Vote",
    url: "/cast-vote",
    icon: ClipboardList,
    requiredModules: [AuthApplicationAccessEnum.CastVoteManagementModule],
  },
  {
    title: "Reprint",
    url: "/reprint",
    icon: Printer,
    requiredModules: [AuthApplicationAccessEnum.CastVoteManagementModule],
  },
  {
    title: "Elections",
    url: "/elections",
    icon: ClipboardList,
    requiredModules: [AuthApplicationAccessEnum.ElectionManagementModule],
  },
  {
    title: "Districts",
    url: "/districts",
    icon: Map,
    requiredModules: [AuthApplicationAccessEnum.ElectionManagementModule],
  },
  {
    title: "Positions",
    url: "/positions",
    icon: Briefcase,
    requiredModules: [AuthApplicationAccessEnum.ElectionManagementModule],
  },
  {
    title: "Precincts",
    url: "/precincts",
    icon: Lock,
    requiredModules: [AuthApplicationAccessEnum.ElectionManagementModule],
  },
  {
    title: "Delegates",
    url: "/delegates",
    icon: Users,
    requiredModules: [AuthApplicationAccessEnum.ElectionManagementModule],
  },
  {
    title: "Candidates",
    url: "/candidates",
    icon: Users,
    requiredModules: [AuthApplicationAccessEnum.ElectionManagementModule],
  },

  {
    title: "Users",
    url: "/user",
    icon: User,
    requiredModules: [AuthApplicationAccessEnum.AdminModule],
  },
  {
    title: "Reports",
    url: "/reports",
    icon: ClipboardList,
    requiredModules: [AuthApplicationAccessEnum.ElectionManagementModule],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    requiredModules: [AuthApplicationAccessEnum.AdminModule],
  },
  // Add more items as needed
];
