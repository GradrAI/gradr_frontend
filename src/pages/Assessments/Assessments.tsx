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
  const {
    accountType,
    user,
    saveUserToken,
    saveUser,
    setCode,
    uniqueExamCode,
  } = useStore();

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
        localStorage.setItem("token", token);
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
    if (accountType === "student") nav(`/link/${uniqueExamCode}`);
    if (accountType === "organization") {
      // if user already belongs to an organization, nav to dashboard
      if (user?.organization) nav("/app/assessments", { replace: true });
      else nav("/sign-up");
    }
    if (accountType === "individual")
      nav("/app/assessments", { replace: true });
  }, [searchParams, accountType]);

  const {
    data: courseData,
    isLoading: courseIsLoading,
    isSuccess: courseIsSuccess,
    isError: courseIsError,
    error: courseError,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => await axios.get(`/courses/users?userId=${user?._id}`),
    enabled: Boolean(user?._id?.length),
  });

  return (
    <div className="w-100 p-4 flex flex-col justify-between gap-2">
      {courseIsLoading && (
        <div className="flex flex-col space-y-3">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <Skeleton className="w-[200px] h-[50px] rounded-md" />
            <Skeleton className="w-[100px] h-[50px] rounded-md" />
          </div>
          <Skeleton className="w-full h-[300px] rounded-md" />
        </div>
      )}

      {courseIsError && (
        <p className="text-2xl text-red-500">
          {(courseError as AxiosError<ErrorResponse>)?.response?.data?.error ||
            "An error occurred"}
        </p>
      )}

      {courseIsSuccess && Boolean(courseData?.data?.length) && (
        <DataTable columns={columns} data={courseData.data} />
      )}
    </div>
  );
};

export default Assessments;
