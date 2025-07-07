import { createContext, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { Outlet } from "react-router-dom";
import useStore from "./state";
import { Folder, Scan, Settings, Upload } from "lucide-react";

export const ModalContext = createContext<any>(null);

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

export default function Layout() {
  const [showModal, setShowModal] = useState(false);
  const { user } = useStore();

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

  return (
    <ModalContext.Provider value={{ showModal, setShowModal }}>
      <SidebarProvider>
        {user && Object.keys(user)?.length && <AppSidebar items={items} />}
        <main className="w-screen h-screen">
          <div className="w-full h-full flex flex-col bg-gray-200 overflow-y-auto">
            <Header />
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </ModalContext.Provider>
  );
}
