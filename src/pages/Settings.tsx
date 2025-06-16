import { Button } from "@/components/ui/button";
import initialUserState from "@/data/initialUserState";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import useStore from "@/state";

const Settings = () => {
  const { user, token } = useStore();
  const [code, setCode] = useState("");

  const { data, isPending, isSuccess, isError, mutate, error } = useMutation({
    mutationKey: ["organization"],
    mutationFn: async (code: string) => {
      await axios.post(`/user`, { tenant_code: code });
    },
  });

  const { data: organizationData } = useQuery({
    queryKey: [""],
    queryFn: async () =>
      await axios.get(`/organizations/${user?.organization}`),
    enabled: Boolean(user?.organization?.length),
    select: (res) => res.data.data,
  });

  useEffect(() => {
    if (isSuccess) toast.success("Organization connected successfully");
    if (isError) toast.error(error?.message || "Error connecting organization");
    if (data) {
      //! TO-DO: update user state
    }
  }, []);

  return (
    <div className="p-4 flex flex-col justify-between items-start gap-8">
      <div>
        <p className="font-semibold text-2xl text-slate-800">User Details</p>
        <p>
          <span className="text-blue-600">Name: </span> {user?.first_name}
          {user?.last_name}
        </p>
        <p>
          <span className="text-blue-600">Email: </span> {user?.email}
        </p>
        <p>
          <span className="text-blue-600">Registration Date: </span>
          {user?.createdAt
            ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
                new Date(user.createdAt)
              )
            : "N/A"}
        </p>
      </div>

      <div>
        <p className="font-semibold text-2xl text-slate-800">
          Organization Details
        </p>
        {user?.organization && organizationData ? (
          <>
            <p>
              <span className="text-blue-600">Name:</span>{" "}
              {organizationData?.name}
            </p>
            <p>
              <span className="text-blue-600">Contact Number:</span>{" "}
              {organizationData?.phoneNumber}
            </p>
          </>
        ) : (
          <div>
            <p className="text-red-500">
              You are not part of any organization.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <Input
                placeholder="Enter Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-white border-black"
              />
              <Button onClick={() => mutate(code)}>
                {isPending ? (
                  <div className="h-5 w-5 border-2 rounded-full border-solid border-white border-e-transparent animate-spin transition-all ease-in-out"></div>
                ) : (
                  "Connect Organization"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
