import { useContext, useEffect } from "react";
import SUIForm from "./SUIForm";
import SUITable from "./SUITable";
import { ModalContext } from "../pages/Home";
import { useSearchParams } from "react-router-dom";
//
const Assessments = () => {
  const { showModal } = useContext(ModalContext);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("code")) {
      localStorage.setItem("code", searchParams.get("code"));
    }
  }, [searchParams]);

  return (
    <div className="w-100 p-4 flex flex-col justify-between gap-2 border-l-stone-950">
      <h1 className="text-3xl">Assessments</h1>

      <div className="w-100">
        {!showModal ? (
          <div className="flex flex-col gap-6 justify-between items-start">
            <input
              placeholder="search"
              className="rounded w-[10rem] py-4 px-6 border-slate-500 bg-slate-200"
              name=""
            />
            <SUITable />
          </div>
        ) : (
          <SUIForm />
        )}
      </div>
    </div>
  );
};

export default Assessments;
