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
} from "../assets";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const currPath = pathname.split("/").at(-1);

  return (
    <div className="w-full h-dvh py-2 px-6 bg-slate-100 flex flex-col justify-between shadow-zinc-800 border-r border-r-purple-500">
      <div className="flex flex-col gap-4 items-start justify-around">
        <img
          src={logo}
          alt="logo"
          className="cursor-pointer w-3/4"
          onClick={() => nav("/app")}
        />

        <div className="h-[40%] text-zinc-500 flex flex-col items-start justify-start gap-4">
          <div className="flex justify-start gap-4 items-center py-4">
            <img
              src={`${currPath === "assessments" ? folderBlue : folder}`}
              alt="icon"
              className={`cursor-pointer`}
              onClick={() => nav("/app/assessments")}
            />
            <NavLink
              className={({ isActive }) =>
                `cursor-pointer  ${isActive ? "" : "text-black"}`
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
                `cursor-pointer  ${isActive ? "" : "text-black"}`
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
                `cursor-pointer  ${isActive ? "" : "text-black"}`
              }
              to="/app/uploads"
            >
              Uploads
            </NavLink>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
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
