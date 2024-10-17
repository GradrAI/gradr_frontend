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

  // mutation to get user data
  const { data, mutate } = useMutation({
    mutationKey: ["profileData"],
    mutationFn: async (code) => {
      const res = await axios.get(`/api/getGoogleUser?code=${code}`);
      const {
        data: { data },
      } = res;
      if (data) {
        const { token, user } = data;
        // save token to be reused in all axios requests
        axios.defaults.headers.common["Authorization"] = token;
        // save user token in localStorage
        localStorage.setItem("userToken", token);
        // save user data in localStorage
        localStorage.setItem("user", JSON.stringify(user));
      }
      return res;
    },
  });

  useEffect(() => {
    // when code is available, call mutation
    if (code) {
      mutate(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  useEffect(() => {
    // get code from URLSearchParams
    const code = searchParams.get("code");
    if (code) {
      // save code in localStorage
      localStorage.setItem("code", code);
    }
  }, [searchParams]);

  useEffect(() => {
    console.log("data: ", data);
  }, [data]);

  return (
    <div className="w-100 p-4 flex flex-col justify-between gap-2 border-l-stone-950">
      <h1 className="text-3xl">Assessments</h1>

      <div className="w-100"></div>
    </div>
  );
};

export default Assessments;
