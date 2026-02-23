"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import { Bot, Briefcase, LayoutDashboard, Workflow } from "lucide-react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const navigation = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Chatbot", url: "/chatbot", icon: Bot },
  { title: "Agents", url: "/agents", icon: Workflow },
  { title: "Jobs", url: "/jobs", icon: Briefcase },
];

interface AppSidebarProps {
  user: {
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">M</span>
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">MyApp</span>
            <span className="text-xs text-muted-foreground">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigation} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
