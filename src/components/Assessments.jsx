import { useContext, useEffect, useState } from "react";
import { ModalContext } from "../Layout";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DataTable } from "./data-table";
import { columns } from "./columns";

const Assessments = () => {
  const { showModal } = useContext(ModalContext);
  const [searchParams] = useSearchParams();

  const [userId, setUserId] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    if (user && user._id) {
      setUserId(user._id);
    }
  }, [user]);

  const code = searchParams.get("code") || localStorage.getItem("code");

  // mutation to get user data
  const { data, mutate } = useMutation({
    mutationKey: ["profileData"],
    mutationFn: async (code) => {
      const res = await axios.get(`/getGoogleUser?code=${code}`);
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
    if (code) mutate(code);
  }, [code]);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) localStorage.setItem("code", code);
  }, [searchParams]);

  const {
    data: examData,
    isLoading: examIsLoading,
    isSuccess: examIsSuccess,
    isError: examIsError,
  } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => await axios.get(`/exams/users/${userId}/exams`),
    enabled: Boolean(userId.length),
  });

  return (
    <div className="w-100 p-4 flex flex-col justify-between gap-2">
      <h1 className="text-3xl">Assessments</h1>

      {Boolean(examData?.data?.length) && (
        <DataTable columns={columns} data={examData.data} />
      )}
    </div>
  );
};

export default Assessments;
