import useStore from "@/state";
import {
  logo,
  folder,
  folderBlue,
  scan,
  scanBlue,
  personalcard,
  personalcardBlue,
  report,
  faq,
  setting,
} from "../assets";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { user, reset } = useStore();
  const currPath = pathname.split("/").at(-1);

  return (
    <div className="hidden md:flex md:w-full h-dvh py-2 px-6 bg-slate-800 flex-col justify-between shadow-zinc-800 border-r border-r-purple-500">
      <div className="h-3/5 flex flex-col gap-8 items-start justify-start">
        <img
          src={logo}
          alt="logo"
          className="cursor-pointer w-3/4 py-4"
          onClick={() => {
            if (user && Object.keys(user)?.length) return;
            else nav("/app");
          }}
        />

        <div className="flex flex-col items-start justify-start gap-4">
          <div className="flex justify-start gap-4 items-center py-4">
            <img
              src={`${currPath === "assessments" ? folderBlue : folder}`}
              alt="icon"
              className={`cursor-pointer`}
              onClick={() => nav("/app/assessments")}
            />
            <NavLink
              className={({ isActive }) =>
                `cursor-pointer  ${isActive ? "" : "text-white"}`
              }
              to="/app/assessments"
            >
              Assessments
            </NavLink>
          </div>

          <div className="flex justify-start gap-4 items-center py-4">
            <img
              src={`${currPath === "grader" ? scanBlue : scan}`}
              alt="icon"
              className={`cursor-pointer`}
              onClick={() => nav("/app/grader")}
            />
            <NavLink
              className={({ isActive }) =>
                `cursor-pointer  ${isActive ? "" : "text-white"}`
              }
              to="/app/grader"
            >
              Grader
            </NavLink>
          </div>

          <div className="flex justify-start gap-4 items-center py-4">
            <img
              src={`${
                currPath === "uploads" ? personalcardBlue : personalcard
              }`}
              alt="icon"
              className={`cursor-pointer`}
              onClick={() => nav("/app/uploads")}
            />
            <NavLink
              className={({ isActive }) =>
                `cursor-pointer  ${isActive ? "" : "text-white"}`
              }
              to="/app/uploads"
            >
              Uploads
            </NavLink>
          </div>

          <div className="flex justify-start gap-4 items-center py-4">
            <img
              src={`${currPath === "settings" ? setting : setting}`}
              alt="icon"
              className={`cursor-pointer`}
              onClick={() => nav("/app/settings")}
            />
            <NavLink
              className={({ isActive }) =>
                `cursor-pointer  ${isActive ? "" : "text-white"}`
              }
              to="/app/settings"
            >
              Settings
            </NavLink>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <p
          className="cursor-pointer text-white"
          onClick={() => {
            reset();
            window.location.reload();
          }}
        >
          Log Out
        </p>

        <div className="w-full p-2 flex gap-2 items-center justify-start">
          <img src={report} alt="icon" className="cursor-pointer" />
          <NavLink
            to={() => window.open("mailto:johnfiewor@gmail.com", "_blank")}
            className="cursor-pointer"
          >
            Report Bug
          </NavLink>
        </div>
        <div className="w-full p-2 flex gap-2 items-center justify-start">
          <img src={faq} alt="icon" className="cursor-pointer" />
          <NavLink to="/" className="cursor-pointer">
            FAQ
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
