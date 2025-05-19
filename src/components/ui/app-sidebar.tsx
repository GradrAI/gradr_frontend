import { Folder, Scan, Settings, Upload } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import useStore from "@/state";
import { logo } from "@/assets";
import { useNavigate } from "react-router-dom";

// Menu items.
const items = [
  {
    title: "Assessments",
    url: "/app/assessments",
    icon: Folder,
  },
  {
    title: "Grader",
    url: "/app/grader",
    icon: Scan,
  },
  {
    title: "Uploads",
    url: "/app/uploads",
    icon: Upload,
  },
  {
    title: "Settings",
    url: "/app/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const nav = useNavigate();
  const { user, saveUser } = useStore();

  return (
    <Sidebar collapsible="icon" className="">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="py-8">
            <img
              src={logo}
              alt="logo"
              className="cursor-pointer py-8"
              onClick={() => {
                if (user && Object.keys(user)?.length) return;
                else nav("/app");
              }}
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="py-8 gap-8">
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="">
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span className="text-xl">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
