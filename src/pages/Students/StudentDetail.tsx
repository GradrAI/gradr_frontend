import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, GraduationCap, Download, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import api from "@/lib/axios";
import { BASE_URL } from "@/requests/constants";

// --- Domain types ---

interface StudentInfo {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  linkStatus: "linked" | "unlinked" | "pending";
  linkedUserId: string | null;
  group: string | null;
}

interface CategoryResult {
  categoryName: string;
  categoryType: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
}

interface CourseAggregate {
  totalScore: number;
  totalMax: number;
  percentage: number;
  grade: string;
}

interface CourseData {
  course: { id: string; name: string };
  results: CategoryResult[];
  aggregate: CourseAggregate;
}

interface TrendPoint {
  date: string;
  courseName: string;
  categoryName: string;
  score: number;
  maxScore: number;
  percentage: number;
}

interface StudentDetailResponse {
  student: StudentInfo;
  courses: CourseData[];
  trend: TrendPoint[];
  generatedAt: string;
}

// --- Component ---

const StudentDetail = () => {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const periodId = searchParams.get("periodId");

  const { data, isLoading } = useQuery<StudentDetailResponse>({
    queryKey: ["student-detail", studentId, periodId],
    queryFn: async () => {
      const res = await api.get(
        `/students/lecturer/${studentId}?periodId=${periodId}`
      );
      return res.data.data;
    },
    enabled: !!studentId && !!periodId,
  });

  const downloadPDF = () => {
    const url = `${BASE_URL}/reports/reportcard/${periodId}/student/${studentId}/pdf`.replace(
      /([^:]\/)\/+/g,
      "$1"
    );
    window.open(url, "_blank");
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2"
      >
        <ArrowLeft size={16} /> Back to Students
      </Button>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : data ? (
        <>
          {/* Student Info Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="text-primary" size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {data.student.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span>
                        Matric: {data.student.studentId || "N/A"}
                      </span>
                      <span>
                        {!data.student.email || data.student.email.endsWith("@temp.local")
                          ? "No email on file"
                          : data.student.email}
                      </span>
                      {data.student.group && (
                        <span>Group: {data.student.group}</span>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      data.student.linkStatus === "linked"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {data.student.linkStatus === "linked"
                      ? "Linked"
                      : "Unlinked"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPDF()}
                  >
                    <Download size={14} className="mr-2" /> Report Card
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Performance Trend Chart */}
          {data.trend?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Trend</CardTitle>
                <CardDescription>
                  Score progression across assessments over time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.trend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="categoryName"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as TrendPoint;
                        return (
                          <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                            <p className="font-semibold text-foreground">
                              {d.categoryName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {d.courseName}
                            </p>
                            <p className="text-sm text-primary font-bold">
                              {d.score}/{d.maxScore} ({d.percentage}%)
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="percentage"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Per-Course Results */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">
              Course Results
            </h2>
            {data.courses?.length > 0 ? (
              data.courses
                .filter((c: CourseData) => c.results.length > 0)
                .map((courseData: CourseData) => (
                  <Card key={courseData.course.id}>
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {courseData.course.name}
                          </CardTitle>
                          <CardDescription>
                            {courseData.results.length} assessment(s)
                          </CardDescription>
                        </div>
                        {courseData.aggregate && (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              {courseData.aggregate.percentage}%
                            </p>
                            <Badge
                              variant={
                                courseData.aggregate.grade === "F"
                                  ? "destructive"
                                  : "default"
                              }
                            >
                              Grade: {courseData.aggregate.grade}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Assessment</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Max</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Grade</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {courseData.results.map(
                            (r: CategoryResult, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">
                                  {r.categoryName}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="capitalize"
                                  >
                                    {r.categoryType}
                                  </Badge>
                                </TableCell>
                                <TableCell>{r.score}</TableCell>
                                <TableCell>{r.maxScore}</TableCell>
                                <TableCell className="font-semibold text-primary">
                                  {r.percentage}%
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-bold border ${
                                      r.grade === "F"
                                        ? "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50"
                                        : r.grade === "A"
                                          ? "bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/50"
                                          : "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50"
                                    }`}
                                  >
                                    {r.grade}
                                  </span>
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                  <FileText size={48} strokeWidth={1} />
                  <p>No results found for this student</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
            <FileText size={48} strokeWidth={1} />
            <p>Unable to load student details</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentDetail;
