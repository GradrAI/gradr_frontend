import { createContext, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { Outlet } from "react-router-dom";
import useStore from "./state";

export const ModalContext = createContext<any>(null);

const Layout = () => {
  const [showModal, setShowModal] = useState(false);
  const { user } = useStore();

  return (
    <ModalContext.Provider value={{ showModal, setShowModal }}>
      <div className="w-100 h-full flex">
        <div
          className={`md:w-2/12 ${Boolean(user?._id?.length) ? "inline-block" : "hidden"}`}
        >
          <Sidebar />
        </div>

        <div
          className={`w-full ${Boolean(user?._id?.length) ? "md:w-10/12" : "md:w-full"} h-100 flex flex-col bg-gray-200`}
        >
          <Header />
          <Outlet />
        </div>
      </div>
    </ModalContext.Provider>
  );
};

export default Layout;
