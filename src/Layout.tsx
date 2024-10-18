import { createContext, useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { Outlet } from "react-router-dom";
import initialUserState from "./data/initialUserState";

export const ModalContext = createContext<any>(null);

const Layout = () => {
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState("");

  const user = localStorage.getItem("user");
  let parsedUser = initialUserState;
  if (user) parsedUser = JSON.parse(user);
  useEffect(() => {
    if (parsedUser && parsedUser._id) {
      setUserId(parsedUser._id);
    }
  }, [parsedUser]);

  return (
    <ModalContext.Provider value={{ showModal, setShowModal }}>
      <div className="w-100 h-screen flex">
        <div
          className={`md:w-2/12 ${Boolean(userId.length) ? "inline-block" : "hidden"}`}
        >
          <Sidebar />
        </div>

        <div
          className={`w-full ${Boolean(userId.length) ? "md:w-10/12" : "md:w-full"} h-100 flex flex-col`}
        >
          <Header />
          <Outlet />
        </div>
      </div>
    </ModalContext.Provider>
  );
};

export default Layout;
