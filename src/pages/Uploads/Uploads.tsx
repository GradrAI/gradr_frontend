import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import useStore from "@/state";
import { ErrorResponse } from "@/types/ErrorResponse";
import { Course } from "@/types/Course";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import api from "@/lib/axios";

const Uploads = () => {
  const nav = useNavigate();
  const { user } = useStore();

  // Fetch active period first
  const { data: activePeriod, isLoading: isPeriodLoading } = useQuery({
    queryKey: ["activePeriod"],
    queryFn: async () => {
      const res = await api.get("/periods/active");
      return res.data.data;
    },
  });

  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: ["courses", activePeriod?._id],
    queryFn: async () => {
      const res = await api.get(`/courses/users?periodId=${activePeriod._id}`);
      return res.data.data;
    },
    enabled: Boolean(user?._id?.length) && !!activePeriod?._id,
    refetchOnWindowFocus: false,
  });

  // check if user is linked to an organization
  const handleClick = () => {
    if (!user?.organization) {
      toast.error("You need to be part of an organization to upload files");
      return;
    }
    nav("new");
  };

  return (
    <div className="p-4 flex flex-col gap-4 ">
      <Button className="w-[150px] self-end" onClick={handleClick}>
        Upload new file(s)
      </Button>
      {(isLoading || isPeriodLoading) && (
        <div className="w-full flex flex-col items-center justify-between gap-2">
          <div className="w-full flex items-center justify-between gap-6">
            <Skeleton className="w-[200px] h-[30px] rounded-lg" />
            <Skeleton className="w-[100px] h-[30px] rounded-lg" />
          </div>
          <Skeleton className="w-full h-[150px] rounded-lg" />
          <div className="w-full flex items-center justify-end gap-6">
            <Skeleton className="w-[50px] h-[30px] rounded-lg" />
            <Skeleton className="w-[50px] h-[30px] rounded-lg" />
          </div>
        </div>
      )}
      {isError && (
        <p className="text-2xl text-red-500">
          {(error as AxiosError<ErrorResponse>)?.response?.data?.error ||
            "An error occurred"}
        </p>
      )}

      {isSuccess && data?.length && (
        <DataTable<Partial<Course>, unknown>
          columns={columns}
          data={data}
          getSubRows={(row: Partial<Course>) => row.categories ?? []}
        />
      )}
    </div>
  );
};

export default Uploads;
