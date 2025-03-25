import { useContext, useEffect, useState } from "react";
import { ModalContext } from "../../Layout";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DataTable } from "../../components/data-table";
import { columns } from "./columns";
import useStore from "@/state";

const Assessments = () => {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { accountType, user, saveUserToken, saveUser, setCode } = useStore();

  const code = searchParams.get("code");

  // mutation to get user data
  const { data, mutate, isError, error } = useMutation({
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
        saveUserToken(token);
        saveUser(user);
      }
      return res;
    },
  });

  useEffect(() => {
    // when code is available, call mutation
    if (code) mutate(code);
  }, [code]);

  useEffect(() => {
    console.log("data: ", data);
    if (isError) {
      console.log("error?.response: ", error?.response);
      if (error?.response?.data?.success === false) {
        console.log("error?.response?.data: ", error?.response?.data);
        // get refresh token and try again
        if (user?.refresh_token) {
          console.log("user?.refresh_token: ", user?.refresh_token);
        }
      }
    }
  }, [data, isError]);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) setCode(code);

    if (accountType === "organization") nav("/sign-up");
    if (accountType === "individual")
      nav("/app/assessments", { replace: true });
  }, [searchParams, accountType]);

  const {
    data: examData,
    isLoading: examIsLoading,
    isSuccess: examIsSuccess,
    isError: examIsError,
  } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => await axios.get(`/exams/users?userId=${user?._id}`),
    enabled: Boolean(user?._id?.length),
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
