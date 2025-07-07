import { createContext, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Outlet } from "react-router-dom";
import useStore from "@/state";
import StudentHeader from "../components/StudentHeader";

export const ModalContext = createContext<any>(null);

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

export default function StudentLayout() {
  const [showModal, setShowModal] = useState(false);
  const { user } = useStore();

  return (
    <ModalContext.Provider value={{ showModal, setShowModal }}>
      <SidebarProvider>
        {user && Object.keys(user)?.length && <AppSidebar />}
        <main className="w-screen h-screen">
          {user && <StudentHeader user={user} />}

          <Outlet />
        </main>
      </SidebarProvider>
    </ModalContext.Provider>
  );
}
