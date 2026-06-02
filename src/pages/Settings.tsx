import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import useStore from "@/state";
import api from "@/lib/axios";
import AcademicSetup from "./Settings/AcademicSetup";

const Settings = () => {
  const { user } = useStore();
  const [code, setCode] = useState("");
  const queryClient = useQueryClient();

  // Organization connect mutation
  const { 
    isPending: isConnecting, 
    mutate: connectOrg, 
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

  const orgId = typeof user?.organization === 'string' 
    ? user?.organization 
    : (user?.organization as any)?._id || (user?.organization as any)?.$oid;

  const { data: organizationData } = useQuery({
    queryKey: ["organization-details", orgId],
    queryFn: async () => {
      const res = await api.get(`/organizations/${orgId}`);
      return res.data.data;
    },
    enabled: !!orgId,
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
    <div className="p-4 md:p-8 max-w-6xl w-full mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your profile, preferences, and institutional setup.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full space-y-6">
        <TabsList className="bg-muted p-1 gap-2 h-12 inline-flex">
          <TabsTrigger value="profile" className="px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Profile</TabsTrigger>
          <TabsTrigger value="preferences" className="px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Preferences</TabsTrigger>
          <TabsTrigger value="academic" className="px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Academic Setup</TabsTrigger>
          <TabsTrigger value="organization" className="px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Organization</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>User Details</CardTitle>
              <CardDescription>Your personal account information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-lg font-semibold text-foreground">{user?.first_name} {user?.last_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                  <p className="text-lg font-semibold text-foreground">{user?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <p className="text-lg font-semibold text-foreground capitalize">{user?.role}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Joined On</p>
                  <p className="text-lg font-semibold text-foreground">
                    {user?.createdAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(user.createdAt)) : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Exam Preferences</CardTitle>
              <CardDescription>Default settings for your course assessments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  className="text-sm font-medium leading-none cursor-pointer text-foreground"
                >
                  Randomize questions for students
                </label>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/90">Custom Instructions for AI</label>
                <Textarea 
                  placeholder="Enter custom instructions for grading or question generation..."
                  value={localSettings.customInstructions}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, customInstructions: e.target.value }))}
                  rows={4}
                  className="bg-background border-input"
                />
                <p className="text-xs text-muted-foreground italic">These instructions are injected into the AI context during grading.</p>
              </div>

              <Button 
                onClick={handleSaveSettings} 
                disabled={isUpdatingSettings || isLoadingSettings}
                className="w-full md:w-auto"
              >
                {isUpdatingSettings ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Setup Tab */}
        <TabsContent value="academic" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <AcademicSetup />
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Manage your institutional connection.</CardDescription>
            </CardHeader>
            <CardContent>
              {organizationData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Organization Name</p>
                      <p className="text-lg font-semibold text-foreground">
                        {organizationData.organizationType === "individual" ? `${organizationData.name} (Personal Account)` : organizationData.name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                      <p className="text-lg font-semibold text-foreground">{organizationData?.phoneNumber || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                      <p className="text-lg font-semibold text-foreground capitalize">{organizationData.organizationType}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Institutional Code</p>
                      <code className="text-lg font-mono bg-muted px-2 py-1 rounded text-primary dark:text-blue-400">
                        {organizationData.tenant_code}
                      </code>
                    </div>
                    {organizationData.desktop_api_key && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Desktop API Key</p>
                        <code className="text-lg font-mono bg-muted px-2 py-1 rounded text-primary dark:text-blue-400 break-all">
                          {organizationData.desktop_api_key}
                        </code>
                      </div>
                    )}
                  </div>
                  
                  {organizationData.organizationType === "individual" && (
                    <div className="pt-4 border-t border-border">
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl mb-6">
                        <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-1">Individual Educator Mode</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          You are currently using GradrAI as an individual. To join a larger institution and share resources with colleagues, enter their institutional code below.
                        </p>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <Input
                          placeholder="Organization Code"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          className="bg-background border-input max-w-sm"
                        />
                        <Button onClick={() => connectOrg(code)} disabled={isConnecting}>
                          {isConnecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Connect Institution
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-muted text-muted-foreground p-6 rounded-2xl mb-6 inline-flex flex-col items-center gap-3">
                    <Loader2 size={32} className="animate-spin text-slate-400" />
                    <p className="font-medium">Loading organization details...</p>
                  </div>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    If this takes too long, please ensure you are correctly logged in.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
