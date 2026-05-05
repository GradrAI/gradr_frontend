import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  FileText, 
  Download, 
  Share2, 
  PieChart, 
  User, 
  BookOpen, 
  Calendar, 
  RefreshCcw,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import useStore from "@/state";
import { BASE_URL } from "@/requests/constants";

const Reports = () => {
  const { user } = useStore();
  const [selectedCycle, setSelectedCycle] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  // 1. Fetch Cycles
  const { data: cyclesData, isLoading: isLoadingCycles } = useQuery({
    queryKey: ["cycles"],
    queryFn: async () => {
      const res = await api.get("/cycles");
      return res.data.data;
    }
  });

  // 2. Fetch Periods (when cycle changes)
  const { data: periodsData, isLoading: isLoadingPeriods } = useQuery({
    queryKey: ["periods", selectedCycle],
    queryFn: async () => {
      const res = await api.get(`/periods?cycleId=${selectedCycle}`);
      return res.data.data;
    },
    enabled: !!selectedCycle
  });

  // 3. Fetch Courses (when period changes)
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["courses", selectedPeriod],
    queryFn: async () => {
      const res = await api.get(`/courses/users?periodId=${selectedPeriod}`);
      return res.data.data;
    },
    enabled: !!selectedPeriod
  });

  // 4. Fetch Students (when period changes - for report cards)
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students", selectedPeriod],
    queryFn: async () => {
      const res = await api.get(`/students/period?periodId=${selectedPeriod}`);
      return res.data.data;
    },
    enabled: !!selectedPeriod
  });

  // 5. Broadsheet Query
  const { data: broadsheetData, isLoading: isLoadingBroadsheet, refetch: refetchBroadsheet } = useQuery({
    queryKey: ["broadsheet", selectedPeriod, selectedCourse],
    queryFn: async () => {
      const res = await api.get(`/reports/broadsheet/${selectedPeriod}/course/${selectedCourse}`);
      return res.data.data;
    },
    enabled: !!selectedPeriod && !!selectedCourse
  });

  // Export Mutations
  const googleSheetsMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/reports/broadsheet/${selectedPeriod}/course/${selectedCourse}/google-sheets`);
      return res.data.data;
    },
    onSuccess: (data) => {
      toast.success("Exported to Google Sheets!");
      if (data.spreadsheetUrl) {
        window.open(data.spreadsheetUrl, "_blank");
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to export to Google Sheets");
    }
  });

  const downloadCSV = () => {
    const url = `${BASE_URL}/reports/broadsheet/${selectedPeriod}/course/${selectedCourse}/csv`.replace(/([^:]\/)\/+/g, "$1");
    window.open(url, "_blank");
  };

  const downloadPDF = (studentId: string) => {
    const url = `${BASE_URL}/reports/reportcard/${selectedPeriod}/student/${studentId}/pdf`.replace(/([^:]\/)\/+/g, "$1");
    window.open(url, "_blank");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <PieChart className="text-primary" /> Reports & Analytics
          </h1>
          <p className="text-slate-500 mt-1">Generate broad sheets, report cards, and track institutional performance.</p>
        </div>
      </div>

      {/* Selectors Section */}
      <Card className="border-none shadow-md bg-slate-50/50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Calendar size={14} /> Academic Session
              </label>
              <Select onValueChange={setSelectedCycle} value={selectedCycle}>
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent>
                  {cyclesData?.map((cycle: any) => (
                    <SelectItem key={cycle._id} value={cycle._id}>
                      {cycle.label || cycle.name || "Unnamed Session"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <RefreshCcw size={14} /> Period
              </label>
              <Select 
                onValueChange={setSelectedPeriod} 
                value={selectedPeriod}
                disabled={!selectedCycle}
              >
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue placeholder={!selectedCycle ? "Select session first" : "Select Period"} />
                </SelectTrigger>
                <SelectContent>
                  {periodsData?.map((period: any) => (
                    <SelectItem key={period._id} value={period._id}>{period.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <BookOpen size={14} /> Course (Broadsheet)
              </label>
              <Select 
                onValueChange={setSelectedCourse} 
                value={selectedCourse}
                disabled={!selectedPeriod}
              >
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue placeholder={!selectedPeriod ? "Select period first" : "Select Course"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses (Master Broadsheet)</SelectItem>
                  {coursesData?.map((course: any) => (
                    <SelectItem key={course._id} value={course._id}>{course.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Broadsheet Preview Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="min-h-[400px]">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle>Broad Sheet Preview</CardTitle>
                <CardDescription>
                  {selectedCourse === "all" 
                    ? "Institutional master summary for all courses in this term." 
                    : "Performance summary for all students in selected course."}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={!broadsheetData}
                  onClick={downloadCSV}
                >
                  <Download size={14} className="mr-2" /> CSV
                </Button>
                <Button 
                  size="sm" 
                  disabled={!broadsheetData || googleSheetsMutation.isPending}
                  onClick={() => googleSheetsMutation.mutate()}
                >
                  {googleSheetsMutation.isPending ? "Exporting..." : <><Share2 size={14} className="mr-2" /> Google Sheets</>}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-auto">
              {isLoadingBroadsheet ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : broadsheetData ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Matric No.</TableHead>
                      {selectedCourse === "all" ? (
                        <>
                          {broadsheetData.courses.map((c: any) => (
                            <TableHead key={c.id} className="text-center">{c.name}</TableHead>
                          ))}
                        </>
                      ) : (
                        <>
                          {broadsheetData.assessments.map((ass: any) => (
                            <TableHead key={ass.id}>{ass.title}</TableHead>
                          ))}
                          <TableHead className="font-bold">Total (%)</TableHead>
                          <TableHead className="font-bold">Grade</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {broadsheetData.rows.map((row: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {selectedCourse === "all" ? row.student.name : row.student.name}
                        </TableCell>
                        <TableCell>
                          {selectedCourse === "all" ? row.student.identifier : row.student.identifier || "N/A"}
                        </TableCell>
                        
                        {selectedCourse === "all" ? (
                          row.courseScores.map((cs: any, cIdx: number) => (
                            <TableCell key={cIdx} className="text-center">
                              {cs.percentage !== null ? (
                                <div className="flex flex-col items-center">
                                  <span className="font-semibold text-primary">{cs.percentage}%</span>
                                  <span className="text-[10px] font-bold text-slate-400">{cs.grade}</span>
                                </div>
                              ) : "-"}
                            </TableCell>
                          ))
                        ) : (
                          <>
                            {row.scores.map((s: any, sIdx: number) => (
                              <TableCell key={sIdx}>{s.score ?? "-"}</TableCell>
                            ))}
                            <TableCell className="font-bold text-primary">{row.aggregate.percentage}%</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                row.aggregate.overallGrade === 'F' ? 'bg-red-100 text-red-600' : 
                                row.aggregate.overallGrade === 'A' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                              }`}>
                                {row.aggregate.overallGrade}
                              </span>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
                  <FileText size={48} strokeWidth={1} />
                  <p>Select a course or "All Courses" to view the Broad Sheet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Report Cards Area */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Student Report Cards</CardTitle>
              <CardDescription>Download detailed performance summaries for individual students.</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {!selectedPeriod ? (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-sm">Select a period to list students</p>
                </div>
              ) : isLoadingStudents ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : studentsData?.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-auto pr-2">
                  {studentsData.map((student: any) => (
                    <div 
                      key={student._id} 
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-primary/30 hover:bg-slate-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                          {student.name?.[0] || <User size={14} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.studentId || "No ID"}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-primary group-hover:bg-white"
                        onClick={() => downloadPDF(student._id)}
                      >
                        <Download size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-sm">No students found in this period</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-slate-50 p-4 rounded-b-lg flex flex-col items-start gap-2 border-t">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Quick Summary</p>
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
                  <p className="text-[10px] text-slate-400 uppercase">Total Students</p>
                  <p className="text-lg font-bold text-slate-800">{studentsData?.length || 0}</p>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
                  <p className="text-[10px] text-slate-400 uppercase">Graded Courses</p>
                  <p className="text-lg font-bold text-slate-800">{coursesData?.length || 0}</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
