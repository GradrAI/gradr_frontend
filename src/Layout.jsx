import { createContext, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { Outlet } from "react-router-dom";

export const ModalContext = createContext();

const Layout = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <ModalContext.Provider value={{ showModal, setShowModal }}>
      <div className="w-100 h-screen flex">
        <div className="w-2/12">
          <Sidebar />
        </div>

        <div className="w-10/12 h-100 flex flex-col">
          <Header />
          <Outlet />
        </div>
      </div>
    </ModalContext.Provider>
  );
};

export default Layout;
