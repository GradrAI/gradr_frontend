import { createContext, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Outlet } from "react-router-dom";
import useStore from "@/state";
import StudentHeader from "../components/StudentHeader";

export const ModalContext = createContext<any>(null);

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { LayoutDashboard, BookOpenCheck } from "lucide-react";

export default function StudentLayout() {
  const [showModal, setShowModal] = useState(false);
  const { user } = useStore();

  const studentItems = [
    {
      title: "Dashboard",
      url: "/student/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "SmartPrep",
      url: "/student/practice",
      icon: BookOpenCheck,
    },
  ];

  return (
    <ModalContext.Provider value={{ showModal, setShowModal }}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:bg-background focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <SidebarProvider>
        {user && Object.keys(user)?.length && <AppSidebar items={studentItems} />}
        <main className="w-full h-screen min-w-0">
          {user && <StudentHeader user={user} />}

          <div id="main-content">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </ModalContext.Provider>
  );
}
