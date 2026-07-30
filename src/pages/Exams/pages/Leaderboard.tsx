import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";
import { getExamLeaderboard } from "@/requests/exam";
import type { LeaderboardEntry } from "@/types/Exam";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

/** Pulls the server's user-facing reason out of a failed request (403 etc.). */
const readErrorMessage = (err: unknown): string | null => {
  if (axios.isAxiosError(err)) {
    const data: unknown = err.response?.data;
    if (data && typeof data === "object" && "message" in data) {
      const { message } = data;
      if (typeof message === "string" && message.length > 0) return message;
    }
  }
  return null;
};

/** Seconds → "m:ss"; an attempt with no recorded duration renders as an em dash. */
const formatDuration = (seconds: number | null): string => {
  if (seconds === null || Number.isNaN(seconds)) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const Leaderboard = () => {
  const { examId } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["leaderboard", examId],
    queryFn: () => getExamLeaderboard(examId ?? ""),
    enabled: !!examId,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <Skeleton className="w-full max-w-xs h-[40px] rounded-md" />
        <Skeleton className="w-full h-[260px] rounded-xl" />
        <Skeleton className="w-full h-[320px] rounded-xl" />
      </div>
    );
  }

  if (isError) {
    // A 403 here is an expected outcome (leaderboard disabled, or the student
    // has not submitted yet) — show the server's reason, never a crash screen.
    const message =
      readErrorMessage(error) ?? "This leaderboard could not be loaded.";
    return (
      <div className="p-4 sm:p-6">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-xl">Leaderboard unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const entries: LeaderboardEntry[] = data?.entries ?? [];
  const totalGraded = data?.totalGraded ?? 0;
  const myRank = data?.myRank ?? null;

  const topTen = entries.slice(0, 10);
  const chartData = topTen.map((entry) => ({
    name: entry.displayName,
    percentage: entry.percentage,
  }));

  const chartSummary =
    topTen.length === 0
      ? "No graded attempts to chart yet."
      : `Top ${topTen.length} by percentage. ${topTen
          .slice(0, 3)
          .map((e) => `${e.displayName} ${e.percentage}%`)
          .join(", ")}.`;

  return (
    <div className="p-4 sm:p-6 space-y-6 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="text-primary" aria-hidden="true" /> Leaderboard
        </h1>
        {myRank !== null && (
          <Badge variant="default" className="text-sm px-3 py-1">
            Your rank: #{myRank}
          </Badge>
        )}
      </div>

      {totalGraded === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No graded attempts yet.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top performers</CardTitle>
              <CardDescription>
                {totalGraded} graded attempt{totalGraded === 1 ? "" : "s"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <div
                role="img"
                aria-label={chartSummary}
                className="h-[260px] w-full text-foreground"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 16, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="currentColor"
                      strokeOpacity={0.1}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "currentColor", opacity: 0.6, fontSize: 11 }}
                      interval={0}
                      dy={8}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "currentColor", opacity: 0.6, fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        borderColor: "hsl(var(--border))",
                        color: "hsl(var(--popover-foreground))",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [`${value}%`, "Score"]}
                    />
                    <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                      {chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="hidden sm:table-cell">%</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Time taken
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry, index) => (
                    <TableRow
                      key={entry.userId ?? `${entry.rank}-${index}`}
                      aria-current={entry.isMe ? "true" : undefined}
                      className={entry.isMe ? "bg-primary/5" : undefined}
                    >
                      <TableCell className="font-semibold">
                        #{entry.rank}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.displayName}
                        {entry.isMe && (
                          <span className="ml-2 text-xs text-primary">
                            (you)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.score}
                        <span className="text-muted-foreground">
                          {" "}
                          / {entry.maxScore}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {entry.percentage}%
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {formatDuration(entry.durationSeconds)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
