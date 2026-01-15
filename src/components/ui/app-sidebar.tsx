import { Bug, LogOut } from "lucide-react";

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
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Items } from "@/types/MenuItems";

const bottomItems = [
  {
    title: "Log Out",
    url: "#",
    icon: LogOut,
  },
  {
    title: "Report Bug",
    url: "#",
    icon: Bug,
  },
];

interface AppSidebarProps {
  items?: Items[];
}

export function AppSidebar({ items }: AppSidebarProps) {
  const nav = useNavigate();
  const location = useLocation();
  const { user, saveUser } = useStore();

  return (
    <Sidebar collapsible="icon" className="">
      <SidebarContent className="justify-between">
        {items?.length && (
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
                {items.map((item) => {
                  const isActive = location.pathname.startsWith(item.url);
                  return (
                    <SidebarMenuItem key={item.title} className="">
                      <SidebarMenuButton asChild isActive={isActive}>
                        <a href={item.url}>
                          <item.icon
                            className={`h-5 w-5 ${isActive ? "text-green-500" : "text-muted-foreground"}`}
                          />
                          <span
                            className={`text-xl ${isActive ? "text-green-500" : "text-muted-foreground"}`}
                          >
                            {item.title}
                          </span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.title} className="">
                  <SidebarMenuButton asChild>
                    <p
                      className={`cursor-pointer ${item.title === "Log Out" && "hover:text-red-500"} ${item.title === "Report Bug" && "hover:text-green-500"}`}
                      onClick={() => {
                        if (item.title === "Log Out") {
                          toast.success("Logging you out...");
                          setTimeout(() => {
                            saveUser(undefined as any);
                            nav("/");
                          }, 1000);
                        }
                        if (item.title === "Report Bug") {
                          window.open(
                            "mailto:johnfiewor@gradrai.com",
                            "_blank"
                          );
                        }
                      }}
                    >
                      <item.icon />
                      <span className="text-xl">{item.title}</span>
                    </p>
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
