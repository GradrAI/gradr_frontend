import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import useStore from "@/state";
import api from "@/lib/axios";

const Settings = () => {
  const { user } = useStore();
  const [code, setCode] = useState("");
  const queryClient = useQueryClient();

  // Organization connect mutation
  const { 
    isPending: isConnecting, 
    mutate: connectOrg, 
    error: connectError 
  } = useMutation({
    mutationKey: ["organization"],
    mutationFn: async (code: string) => {
      await api.post(`/user`, { tenant_code: code });
    },
    onSuccess: () => {
      toast.success("Organization connected successfully");
      queryClient.invalidateQueries({ queryKey: ["organization-details"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Error connecting organization");
    }
  });

  const { data: organizationData } = useQuery({
    queryKey: ["organization-details"],
    queryFn: async () => await api.get(`/organizations/${user?.organization}`),
    enabled: Boolean(user?.organization?.length),
    select: (res) => res.data.data,
  });

  // Settings fetch and update
  const { data: settingsData, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const res = await api.get("/user/settings");
      return res.data.data;
    },
    enabled: !!user,
  });

  const { mutate: updateSettings, isPending: isUpdatingSettings } = useMutation({
    mutationFn: async (updates: any) => {
      await api.patch("/user/settings", updates);
    },
    onSuccess: () => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update settings");
    }
  });

  const [localSettings, setLocalSettings] = useState({
    randomizeQuestions: false,
    customInstructions: "",
  });

  useEffect(() => {
    if (settingsData) {
      setLocalSettings({
        randomizeQuestions: settingsData.randomizeQuestions || false,
        customInstructions: settingsData.customInstructions || "",
      });
    }
  }, [settingsData]);

  const handleSaveSettings = () => {
    updateSettings(localSettings);
  };

  return (
    <div className="p-4 flex flex-col justify-between items-start gap-8 max-w-4xl">
      <div className="w-full">
        <p className="font-semibold text-2xl text-slate-800 mb-4">User Details</p>
        <div className="space-y-1">
          <p className="m-0">
            <span className="text-blue-600 font-medium">Name: </span> {user?.first_name}{" "}{user?.last_name}
          </p>
          <p>
            <span className="text-blue-600 font-medium">Email: </span> {user?.email}
          </p>
          <p>
            <span className="text-blue-600 font-medium">Role: </span> {user?.role}
          </p>
          <p>
            <span className="text-blue-600 font-medium">Registration Date: </span>
            {user?.createdAt
              ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
                  new Date(user.createdAt)
                )
              : "N/A"}
          </p>
        </div>
      </div>

      {user?.role === "lecturer" && (
        <div className="w-full border-t pt-8">
          <p className="font-semibold text-2xl text-slate-800 mb-4">Exam Preferences</p>
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="randomize" 
                checked={localSettings.randomizeQuestions}
                onCheckedChange={(checked) => 
                  setLocalSettings(prev => ({ ...prev, randomizeQuestions: !!checked }))
                }
              />
              <label 
                htmlFor="randomize"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Randomize questions for students
              </label>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Custom Instructions</label>
              <Textarea 
                placeholder="Enter custom instructions for AI or grading..."
                value={localSettings.customInstructions}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, customInstructions: e.target.value }))}
                rows={4}
                className="bg-white"
              />
              <p className="text-xs text-slate-500">These instructions can be used by the system during exam generation or grading.</p>
            </div>

            <Button 
              onClick={handleSaveSettings} 
              disabled={isUpdatingSettings || isLoadingSettings}
            >
              {isUpdatingSettings ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      )}

      <div className="w-full border-t pt-8">
        <p className="font-semibold text-2xl text-slate-800 mb-4">
          Organization Details
        </p>
        {user?.organization && organizationData ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <p>
                <span className="text-blue-600 font-medium">
                  {organizationData.organizationType === "individual" ? "Account Name:" : "Name:"}
                </span>{" "}
                {organizationData?.name}
              </p>
              <p>
                <span className="text-blue-600 font-medium">Contact Number:</span>{" "}
                {organizationData?.phoneNumber}
              </p>
              {organizationData.organizationType === "individual" && (
                <p>
                  <span className="text-blue-600 font-medium">Account Type:</span> Individual
                </p>
              )}
            </div>
            
            {organizationData.organizationType === "individual" && (
              <div className="pt-4 mt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-4">
                  Want to switch to an institution? Connect your account to an organization below.
                </p>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <Input
                    placeholder="Enter Organization Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="bg-white border-slate-300 max-w-sm"
                  />
                  <Button onClick={() => connectOrg(code)} disabled={isConnecting}>
                    {isConnecting ? (
                      <div className="h-5 w-5 border-2 rounded-full border-solid border-white border-e-transparent animate-spin transition-all ease-in-out"></div>
                    ) : (
                      "Connect Organization"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-red-500 mb-4">
              You are not part of any organization.
            </p>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <Input
                placeholder="Enter Organization Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-white border-slate-300 max-w-sm"
              />
              <Button onClick={() => connectOrg(code)} disabled={isConnecting}>
                {isConnecting ? (
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
