import { useContext, useEffect } from "react";
import SUIForm from "./SUIForm";
import SUITable from "./SUITable";
import { ModalContext } from "../Layout";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
//
const Assessments = () => {
  const { showModal } = useContext(ModalContext);
  const [searchParams] = useSearchParams();

  const code = searchParams.get("code") || localStorage.getItem("code");

  const { data, mutate } = useMutation({
    mutationKey: ["profileData"],
    mutationFn: async (code) => {
      const res = await axios.get(`/getGoogleUser?code=${code}`);
      const {
        data: { data },
      } = res;
      localStorage.setItem("user: ", JSON.stringify(data));
      return res;
    },
  });

  useEffect(() => {
    if (code) {
      mutate(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      localStorage.setItem("code", code);
    }
  }, [searchParams]);

  useEffect(() => {
    console.log("data: ", data);
  }, [data]);

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
