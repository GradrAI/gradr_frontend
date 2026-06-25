import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Users,
  UserCheck,
  UserX,
  Calendar,
  RefreshCcw,
  Pencil,
  Trash2,
  Link2,
  Loader2,
  Plus,
  Upload,
  X,
  FileSpreadsheet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import useStore from "@/state";
import api from "@/lib/axios";

interface Cycle {
  _id: string;
  label?: string;
  name?: string;
}

interface Period {
  _id: string;
  name: string;
}

interface LecturerStudent {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  linkStatus: string | null;
  linkedUserId: string | null;
  group: string | null;
  courseCount: number;
  resultCount: number;
  latestResultDate: string | null;
  latestScore: string | null;
}

interface EditForm {
  name: string;
  studentId: string;
  group: string;
}

interface AxiosErrorShape {
  response?: { data?: { error?: string } };
}

interface BulkStudentRow {
  name: string;
  studentId: string;
  email: string;
  group: string;
}

interface BulkCreateResult {
  created: number;
  duplicates: string[];
  failed: number;
}

const StudentsList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedCycle, setSelectedCycle] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [editingStudent, setEditingStudent] = useState<LecturerStudent | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: "", studentId: "", group: "" });
  const [deletingStudent, setDeletingStudent] = useState<LecturerStudent | null>(null);
  const [linkingStudent, setLinkingStudent] = useState<LecturerStudent | null>(null);
  const [linkUserId, setLinkUserId] = useState("");
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkRows, setBulkRows] = useState<BulkStudentRow[]>([{ name: "", studentId: "", email: "", group: "" }]);
  const [csvPreview, setCsvPreview] = useState<BulkStudentRow[] | null>(null);
  const [csvFileName, setCsvFileName] = useState("");

  // 1. Fetch Cycles
  const { data: cyclesData, isLoading: isLoadingCycles } = useQuery({
    queryKey: ["cycles"],
    queryFn: async () => {
      const res = await api.get("/cycles");
      return res.data.data as Cycle[];
    },
  });

  // 2. Fetch Periods (when cycle changes)
  const { data: periodsData, isLoading: isLoadingPeriods } = useQuery({
    queryKey: ["periods", selectedCycle],
    queryFn: async () => {
      const res = await api.get(`/periods?cycleId=${selectedCycle}`);
      return res.data.data as Period[];
    },
    enabled: !!selectedCycle,
  });

  // 3. Fetch lecturer students
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["lecturer-students", selectedPeriod],
    queryFn: async () => {
      const res = await api.get(`/students/lecturer?periodId=${selectedPeriod}`);
      return res.data.data as LecturerStudent[];
    },
    enabled: !!selectedPeriod,
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; name?: string; studentId?: string; group?: string }) =>
      api.patch(`/students/${data.id}`, data),
    onSuccess: () => {
      toast.success("Student updated");
      queryClient.invalidateQueries({ queryKey: ["lecturer-students"] });
    },
    onError: (err: AxiosErrorShape) =>
      toast.error(err.response?.data?.error || "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/students/${id}`),
    onSuccess: () => {
      toast.success("Student deleted");
      setDeletingStudent(null);
      queryClient.invalidateQueries({ queryKey: ["lecturer-students"] });
    },
    onError: (err: AxiosErrorShape) =>
      toast.error(err.response?.data?.error || "Delete failed"),
  });

  const linkMutation = useMutation({
    mutationFn: (data: { id: string; userId: string }) =>
      api.post(`/students/${data.id}/link`, { userId: data.userId }),
    onSuccess: () => {
      toast.success("Student linked");
      queryClient.invalidateQueries({ queryKey: ["lecturer-students"] });
    },
    onError: (err: AxiosErrorShape) =>
      toast.error(err.response?.data?.error || "Link failed"),
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (data: { students: BulkStudentRow[]; periodId?: string }) => {
      const res = await api.post("/students/bulk", data);
      return res.data as BulkCreateResult;
    },
    onSuccess: (result) => {
      const messages: string[] = [];
      if (result.created > 0) messages.push(`${result.created} student(s) added`);
      if (result.duplicates?.length > 0) messages.push(`${result.duplicates.length} duplicate(s) skipped`);
      if (result.failed > 0) messages.push(`${result.failed} failed`);
      toast.success(messages.join(". "));
      setShowBulkDialog(false);
      setBulkRows([{ name: "", studentId: "", email: "", group: "" }]);
      setCsvPreview(null);
      setCsvFileName("");
      queryClient.invalidateQueries({ queryKey: ["lecturer-students"] });
    },
    onError: (err: AxiosErrorShape) =>
      toast.error(err.response?.data?.error || "Bulk creation failed"),
  });

  // Derived counts
  const totalStudents = studentsData?.length ?? 0;
  const linkedCount = studentsData?.filter((s) => s.linkStatus === "linked").length ?? 0;
  const unlinkedCount = totalStudents - linkedCount;

  // Filtered list
  const filteredStudents = studentsData?.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.name ?? "").toLowerCase().includes(q) ||
      (s.studentId ?? "").toLowerCase().includes(q)
    );
  });

  // Handlers
  const openEdit = (student: LecturerStudent) => {
    setEditForm({
      name: student.name,
      studentId: student.studentId,
      group: student.group ?? "",
    });
    setEditingStudent(student);
  };

  const handleSaveEdit = () => {
    if (!editingStudent) return;
    updateMutation.mutate(
      { id: editingStudent._id, ...editForm },
      { onSuccess: () => setEditingStudent(null) }
    );
  };

  const handleCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        toast.error("CSV must have a header row and at least one data row");
        return;
      }

      // Parse header to find column indices
      const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const nameIdx = header.findIndex((h) => h === "name" || h === "full name" || h === "student name");
      const regIdx = header.findIndex((h) => h === "reg number" || h === "reg no" || h === "matric" || h === "matric no" || h === "studentid" || h === "registration number" || h === "id");
      const emailIdx = header.findIndex((h) => h === "email" || h === "email address");
      const groupIdx = header.findIndex((h) => h === "group" || h === "class" || h === "section");

      if (nameIdx === -1 || regIdx === -1) {
        toast.error('CSV must have "Name" and "Reg Number" (or "Matric No") columns');
        return;
      }

      const rows: BulkStudentRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        const name = cols[nameIdx] || "";
        const studentId = cols[regIdx] || "";
        if (!name && !studentId) continue; // skip empty rows
        rows.push({
          name,
          studentId,
          email: emailIdx !== -1 ? cols[emailIdx] || "" : "",
          group: groupIdx !== -1 ? cols[groupIdx] || "" : "",
        });
      }

      if (rows.length === 0) {
        toast.error("No valid rows found in CSV");
        return;
      }

      setCsvPreview(rows);
      setCsvFileName(file.name);
    };
    reader.readAsText(file);
  };

  const addBulkRow = () => {
    setBulkRows((prev) => [...prev, { name: "", studentId: "", email: "", group: "" }]);
  };

  const removeBulkRow = (index: number) => {
    setBulkRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateBulkRow = (index: number, field: keyof BulkStudentRow, value: string) => {
    setBulkRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const handleBulkSubmit = (rows: BulkStudentRow[]) => {
    const valid = rows.filter((r) => r.name && r.studentId);
    if (valid.length === 0) {
      toast.error("No valid rows to submit");
      return;
    }
    bulkCreateMutation.mutate({
      students: valid,
      periodId: selectedPeriod || undefined,
    });
  };

  const statusBadge = (status: string | null) => {
    if (status === "linked")
      return <Badge variant="default" className="text-green-600 bg-green-100 dark:bg-green-950/40 dark:text-green-400 border-green-200 dark:border-green-900/50">Linked</Badge>;
    if (status === "pending")
      return <Badge variant="outline">Pending</Badge>;
    return <Badge variant="secondary">Unlinked</Badge>;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="text-primary" /> My Students
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage students in your courses.
          </p>
        </div>
        <Button onClick={() => setShowBulkDialog(true)} className="flex items-center gap-2">
          <Plus size={16} /> Add Students
        </Button>
      </div>

      {/* Period Selectors */}
      <Card className="border border-border bg-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Calendar size={14} /> Academic Session
              </label>
              <Select onValueChange={setSelectedCycle} value={selectedCycle}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent>
                  {cyclesData?.map((cycle) => (
                    <SelectItem key={cycle._id} value={cycle._id}>
                      {cycle.label || cycle.name || "Unnamed Session"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <RefreshCcw size={14} /> Period
              </label>
              <Select
                onValueChange={setSelectedPeriod}
                value={selectedPeriod}
                disabled={!selectedCycle}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue
                    placeholder={
                      !selectedCycle ? "Select session first" : "Select Period"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {periodsData?.map((period) => (
                    <SelectItem key={period._id} value={period._id}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {selectedPeriod && studentsData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
              <p className="text-xs text-muted-foreground font-medium">Total Students</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">{linkedCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Linked Students</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                <UserX className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">{unlinkedCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Unlinked Students</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search + Student Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle>Students</CardTitle>
            <CardDescription>
              Students enrolled in your courses for the selected period.
            </CardDescription>
          </div>
          <div className="w-64">
            <Input
              placeholder="Search by name or matric..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingStudents ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !selectedPeriod ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <GraduationCap className="w-12 h-12 mb-4 opacity-40" />
              <p className="text-lg font-medium">Select a session and period</p>
              <p className="text-sm">Choose an academic session and period above to view students.</p>
            </div>
          ) : !filteredStudents?.length ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Users className="w-12 h-12 mb-4 opacity-40" />
              <p className="text-lg font-medium">No students found</p>
              <p className="text-sm">
                {searchQuery
                  ? "Try a different search term."
                  : "No students are enrolled in your courses for this period."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Matric No.</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Latest Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((s) => (
                  <TableRow
                    key={s._id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      navigate(
                        `/app/students/${s._id}?periodId=${selectedPeriod}`
                      )
                    }
                  >
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.studentId}</TableCell>
                    <TableCell>
                      {!s.email || s.email.endsWith("@temp.local") ? (
                        <span className="italic text-muted-foreground">
                          No email on file
                        </span>
                      ) : (
                        s.email
                      )}
                    </TableCell>
                    <TableCell>{statusBadge(s.linkStatus)}</TableCell>
                    <TableCell>{s.courseCount}</TableCell>
                    <TableCell>{s.latestScore ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(s);
                          }}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingStudent(s);
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                        {s.linkStatus !== "linked" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLinkingStudent(s);
                            }}
                          >
                            <Link2 size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingStudent}
        onOpenChange={(open) => !open && setEditingStudent(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Matric No.</label>
              <Input
                value={editForm.studentId}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, studentId: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Group</label>
              <Input
                value={editForm.group}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, group: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStudent(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingStudent}
        onOpenChange={(open) => !open && setDeletingStudent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will permanently remove {deletingStudent?.name}
              &apos;s record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingStudent) deleteMutation.mutate(deletingStudent._id);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Link Dialog */}
      <Dialog
        open={!!linkingStudent}
        onOpenChange={(open) => !open && setLinkingStudent(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Student to User Account</DialogTitle>
            <DialogDescription>
              Enter the User ID of the account to link to {linkingStudent?.name}.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="User ID"
            value={linkUserId}
            onChange={(e) => setLinkUserId(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkingStudent(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (linkingStudent) {
                  linkMutation.mutate({
                    id: linkingStudent._id,
                    userId: linkUserId,
                  });
                  setLinkingStudent(null);
                  setLinkUserId("");
                }
              }}
              disabled={!linkUserId || linkMutation.isPending}
            >
              Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Students Dialog */}
      <Dialog
        open={showBulkDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowBulkDialog(false);
            setBulkRows([{ name: "", studentId: "", email: "", group: "" }]);
            setCsvPreview(null);
            setCsvFileName("");
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Students</DialogTitle>
            <DialogDescription>
              Add students individually, in bulk, or by uploading a CSV file.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="quick" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quick">Quick Entry</TabsTrigger>
              <TabsTrigger value="csv">CSV Upload</TabsTrigger>
            </TabsList>

            {/* Quick Entry Tab */}
            <TabsContent value="quick" className="flex-1 overflow-hidden flex flex-col mt-4">
              <div className="flex-1 overflow-auto space-y-3 pr-1">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 px-1">
                  <label className="text-xs font-semibold text-muted-foreground">Name *</label>
                  <label className="text-xs font-semibold text-muted-foreground">Reg Number *</label>
                  <label className="text-xs font-semibold text-muted-foreground">Email</label>
                  <label className="text-xs font-semibold text-muted-foreground">Group</label>
                  <div className="w-9" />
                </div>
                {bulkRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center">
                    <Input
                      placeholder="John Doe"
                      value={row.name}
                      onChange={(e) => updateBulkRow(i, "name", e.target.value)}
                    />
                    <Input
                      placeholder="CSC/2023/001"
                      value={row.studentId}
                      onChange={(e) => updateBulkRow(i, "studentId", e.target.value)}
                    />
                    <Input
                      placeholder="Optional"
                      value={row.email}
                      onChange={(e) => updateBulkRow(i, "email", e.target.value)}
                    />
                    <Input
                      placeholder="JSS 1A"
                      value={row.group}
                      onChange={(e) => updateBulkRow(i, "group", e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBulkRow(i)}
                      disabled={bulkRows.length <= 1}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <Button variant="outline" size="sm" onClick={addBulkRow} className="flex items-center gap-1">
                  <Plus size={14} /> Add Row
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowBulkDialog(false)}>Cancel</Button>
                  <Button
                    onClick={() => handleBulkSubmit(bulkRows)}
                    disabled={bulkCreateMutation.isPending || !bulkRows.some((r) => r.name && r.studentId)}
                  >
                    {bulkCreateMutation.isPending ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      `Add ${bulkRows.filter((r) => r.name && r.studentId).length} Student(s)`
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* CSV Upload Tab */}
            <TabsContent value="csv" className="flex-1 overflow-hidden flex flex-col mt-4">
              {!csvPreview ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-border rounded-lg p-8">
                  <FileSpreadsheet className="text-muted-foreground" size={48} strokeWidth={1} />
                  <div className="text-center">
                    <p className="font-medium text-foreground">Upload a CSV file</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Required columns: <span className="font-mono text-xs">Name</span>, <span className="font-mono text-xs">Reg Number</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Optional columns: <span className="font-mono text-xs">Email</span>, <span className="font-mono text-xs">Group</span>
                    </p>
                  </div>
                  <label className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span className="flex items-center gap-2">
                        <Upload size={14} /> Choose File
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCsvFile(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              ) : (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <FileSpreadsheet size={16} className="text-primary" />
                      <span className="font-medium">{csvFileName}</span>
                      <Badge variant="secondary">{csvPreview.length} row(s)</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setCsvPreview(null); setCsvFileName(""); }}
                    >
                      Change File
                    </Button>
                  </div>
                  <div className="flex-1 overflow-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Reg Number</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Group</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvPreview.map((row, i) => (
                          <TableRow key={i} className={!row.name || !row.studentId ? "bg-destructive/5" : ""}>
                            <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                            <TableCell className={!row.name ? "text-destructive" : ""}>{row.name || "Missing"}</TableCell>
                            <TableCell className={!row.studentId ? "text-destructive" : ""}>{row.studentId || "Missing"}</TableCell>
                            <TableCell className="text-muted-foreground">{row.email || "—"}</TableCell>
                            <TableCell className="text-muted-foreground">{row.group || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t mt-4">
                    <p className="text-sm text-muted-foreground">
                      {csvPreview.filter((r) => r.name && r.studentId).length} of {csvPreview.length} rows valid
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowBulkDialog(false)}>Cancel</Button>
                      <Button
                        onClick={() => handleBulkSubmit(csvPreview)}
                        disabled={bulkCreateMutation.isPending || !csvPreview.some((r) => r.name && r.studentId)}
                      >
                        {bulkCreateMutation.isPending ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          `Import ${csvPreview.filter((r) => r.name && r.studentId).length} Student(s)`
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsList;
