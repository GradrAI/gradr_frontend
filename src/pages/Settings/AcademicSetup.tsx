import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Calendar, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

const AcademicSetup = () => {
  const queryClient = useQueryClient();
  const [isAddingCycle, setIsAddingCycle] = useState(false);
  const [newCycleName, setNewCycleName] = useState("");
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  
  const [isAddingPeriod, setIsAddingPeriod] = useState(false);
  const [newPeriodName, setNewPeriodName] = useState("");

  // Fetch all Cycles
  const { data: cycles, isLoading: isLoadingCycles } = useQuery({
    queryKey: ["cycles"],
    queryFn: async () => {
      const res = await api.get("/cycles");
      return res.data.data;
    },
  });

  // Create Cycle
  const createCycleMutation = useMutation({
    mutationFn: async (label: string) => await api.post("/cycles", { label }),
    onSuccess: () => {
      toast.success("Academic session created");
      setIsAddingCycle(false);
      setNewCycleName("");
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create session"),
  });

  // Fetch Periods for selected Cycle
  const { data: periods, isLoading: isLoadingPeriods } = useQuery({
    queryKey: ["periods", selectedCycleId],
    queryFn: async () => {
      const res = await api.get(`/periods?cycleId=${selectedCycleId}`);
      return res.data.data;
    },
    enabled: !!selectedCycleId,
  });

  // Create Period
  const createPeriodMutation = useMutation({
    mutationFn: async (data: { name: string; cycleId: string }) => 
      await api.post("/periods", data),
    onSuccess: () => {
      toast.success("Term/Semester created");
      setIsAddingPeriod(false);
      setNewPeriodName("");
      queryClient.invalidateQueries({ queryKey: ["periods", selectedCycleId] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create period"),
  });

  // Activate Period
  const activatePeriodMutation = useMutation({
    mutationFn: async (periodId: string) => 
      await api.patch(`/periods/${periodId}/activate`),
    onSuccess: () => {
      toast.success("Period activated successfully");
      queryClient.invalidateQueries({ queryKey: ["periods", selectedCycleId] });
      queryClient.invalidateQueries({ queryKey: ["activePeriod"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Activation failed"),
  });

  return (
    <div className="space-y-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cycles Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Academic Sessions</h3>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsAddingCycle(!isAddingCycle)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Session
            </Button>
          </div>

          {isAddingCycle && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4 space-y-3">
                <Input 
                  placeholder="e.g. 2025/2026 Academic Session" 
                  value={newCycleName}
                  onChange={(e) => setNewCycleName(e.target.value)}
                  className="bg-white"
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => createCycleMutation.mutate(newCycleName)}
                    disabled={createCycleMutation.isPending || !newCycleName}
                  >
                    {createCycleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Session"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsAddingCycle(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoadingCycles ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-2">
              {cycles?.map((cycle: any) => (
                <button
                  key={cycle._id}
                  onClick={() => setSelectedCycleId(cycle._id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                    selectedCycleId === cycle._id 
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary" 
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={`h-5 w-5 ${selectedCycleId === cycle._id ? "text-primary" : "text-slate-400"}`} />
                    <span className="font-medium text-slate-700">{cycle.label}</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 ${selectedCycleId === cycle._id ? "text-primary" : "text-slate-300"}`} />
                </button>
              ))}
              {cycles?.length === 0 && !isAddingCycle && (
                <p className="text-center text-slate-500 py-8 italic">No sessions created yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Periods Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Terms / Semesters</h3>
            {selectedCycleId && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsAddingPeriod(!isAddingPeriod)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Term
              </Button>
            )}
          </div>

          {!selectedCycleId ? (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center">
              <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Select a session on the left to manage terms.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {isAddingPeriod && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-4 space-y-3">
                    <Input 
                      placeholder="e.g. First Term" 
                      value={newPeriodName}
                      onChange={(e) => setNewPeriodName(e.target.value)}
                      className="bg-white"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => createPeriodMutation.mutate({ name: newPeriodName, cycleId: selectedCycleId })}
                        disabled={createPeriodMutation.isPending || !newPeriodName}
                      >
                        {createPeriodMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Term"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsAddingPeriod(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isLoadingPeriods ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <div className="space-y-3">
                  {periods?.map((period: any) => (
                    <Card key={period._id} className={period.status === "active" ? "border-primary ring-1 ring-primary/20" : ""}>
                      <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base font-semibold">{period.name}</CardTitle>
                          {period.status === "active" && (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                              Active
                            </Badge>
                          )}
                        </div>
                        {period.status !== "active" && (
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => activatePeriodMutation.mutate(period._id)}
                            disabled={activatePeriodMutation.isPending}
                          >
                            {activatePeriodMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activate"}
                          </Button>
                        )}
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Billing:</span>
                            <span className={period.billingStatus === "trial" ? "text-amber-600 font-bold uppercase" : "uppercase"}>
                              {period.billingStatus}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Headcount:</span>
                            <span>{period.isHeadcountLocked ? "Locked" : "Open"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {periods?.length === 0 && !isAddingPeriod && (
                    <p className="text-center text-slate-500 py-8 italic">No terms created for this session.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Pro Tip:</strong> Only one period can be active at a time institution-wide. 
          Activating a new period will automatically scope all new assessments and reports to that term.
        </p>
      </div>
    </div>
  );
};

export default AcademicSetup;
