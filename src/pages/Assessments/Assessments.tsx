import { useContext, useEffect, useState } from "react";
import { ErrorResponse } from "@/types/ErrorResponse";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DataTable } from "../../components/data-table";
import { columns } from "./columns";
import useStore from "@/state";
import { Skeleton } from "@/components/ui/skeleton";

const Assessments = () => {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { accountType, user, saveUserToken, saveUser, setCode } = useStore();

  const code = searchParams.get("code");

  // mutation to get user data
  const { data, mutate, isError, error } = useMutation({
    mutationKey: ["profileData"],
    mutationFn: async (code: string) => {
      // this endpoint uses the code (gotten after a user has signed-in with google) to retrieve tokens(contains access_token, refresh_token etc)
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
    if (isError) {
      if (
        (error as AxiosError<ErrorResponse>)?.response?.data?.success === false
      ) {
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
    isPending: examIsPending,
    isSuccess: examIsSuccess,
    isError: examIsError,
    error: examError,
  } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => await axios.get(`/exams/users?userId=${user?._id}`),
    enabled: Boolean(user?._id?.length),
  });

  return (
    <div className="w-100 p-4 flex flex-col justify-between gap-2">
      <h1 className="text-3xl">Assessments</h1>

      {(examIsLoading || examIsPending) && (
        <div className="flex flex-col space-y-3">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <Skeleton className="w-[200px] h-[50px] rounded-md" />
            <Skeleton className="w-[100px] h-[50px] rounded-md" />
          </div>
          <Skeleton className="w-full h-[300px] rounded-md" />
        </div>
      )}

      {examIsError && (
        <p className="text-2xl text-red-500">
          {(examError as AxiosError<ErrorResponse>)?.response?.data?.error ||
            "An error occurred"}
        </p>
      )}

      {examIsSuccess && Boolean(examData?.data?.length) && (
        <DataTable columns={columns} data={examData.data} />
      )}
    </div>
  );
};

export default Assessments;
