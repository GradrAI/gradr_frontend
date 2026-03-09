import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssessmentStat } from "@/types/AssessmentStat";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#f97316", "#8b5cf6", "#ef4444"];
const PIE_COLORS = ["#10b981", "#ef4444"]; // Pass (Green), Fail (Red)

const AssessmentDetails = () => {
  const nav = useNavigate();
  const { courseId } = useParams();
  const [assessmentStat, setAssessmentStat] = useState<AssessmentStat | null>(
    null
  );
  
  const { isSuccess, isLoading, isError, error, data } = useQuery({
    queryKey: ["courseStats", courseId],
    queryFn: async () =>
      await api.get(
        `/courses/${decodeURI(courseId ?? "")}/students-by-category`
      ),
    select: (res) => res.data.data,
  });

  useEffect(() => {
    if (isSuccess && data?.stats) {
      setAssessmentStat(data.stats);
    }
  }, [isSuccess, data]);

  if (isError) {
    return <div className="p-4 text-red-500">{error?.message || "An error occurred"}</div>;
  }

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col gap-6">
        <Skeleton className="w-[250px] h-[40px] rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="w-full h-[120px] rounded-xl" />
          <Skeleton className="w-full h-[120px] rounded-xl" />
          <Skeleton className="w-full h-[120px] rounded-xl" />
          <Skeleton className="w-full h-[120px] rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="w-full h-[350px] rounded-xl" />
          <Skeleton className="w-full h-[350px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {data?.courseName}
          </h1>
          <p className="text-muted-foreground">
            Detailed assessment analytics and performance overview.
          </p>
        </div>
        <Button
          onClick={() => nav(-1)}
          variant="outline"
          className="w-fit"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {assessmentStat && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assessmentStat.totalUniqueStudents}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enrolled & Participating
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Score
                </CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assessmentStat.averageScore}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  Across all categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Highest Score
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{assessmentStat.highestScore}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Top performance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Lowest Score
                </CardTitle>
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{assessmentStat.lowestScore}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Needs attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Score Distribution Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
                <CardDescription>
                  Number of students per grade band
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-0">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={assessmentStat.scoreDistribution}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="grade" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                        {assessmentStat.scoreDistribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pass/Fail Ratio Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Pass/Fail Ratio</CardTitle>
                <CardDescription>
                  Percentage of students passing (≥50%) vs failing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assessmentStat.passFailRatio}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="status"
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                          const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                          if (percent === 0) return null;
                          return (
                            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-xs">
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                      >
                        {assessmentStat.passFailRatio?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Performance Chart */}
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>
                  Average percentage score across different assessment categories
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-0">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={assessmentStat.categoryPerformance}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                      <XAxis 
                        type="number" 
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                      />
                      <YAxis 
                        dataKey="category" 
                        type="category" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
                        width={150}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`${value}%`, 'Average Score']}
                      />
                      <Bar dataKey="averageScore" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

          </div>
        </>
      )}
    </div>
  );
};

export default AssessmentDetails;
