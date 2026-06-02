import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, GraduationCap, FileText, CheckCircle2, Info } from "lucide-react";

const StudentResultDetails = () => {
    const { resultId } = useParams();
    const navigate = useNavigate();

    const { data: result, isLoading, isError } = useQuery({
        queryKey: ["result", resultId],
        queryFn: async () => {
            const res = await api.get(`/results/${resultId}`);
            return res.data;
        },
        enabled: !!resultId,
    });

    if (isLoading) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <Skeleton className="h-10 w-32 mb-8" />
                <Skeleton className="h-64 w-full mb-8" />
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        );
    }

    if (isError || !result) {
        return (
            <div className="p-8 max-w-4xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Error loading result</h2>
                <Button onClick={() => navigate("/student/dashboard")}>Back to Dashboard</Button>
            </div>
        );
    }

    const printResult = () => {
        // TODO: Implement print functionality
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Button 
                variant="ghost" 
                className="mb-8 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => navigate("/student/dashboard")}
            >
                <ChevronLeft className="w-4 h-4 mr-1.5" />
                Back to Dashboard
            </Button>

            <header className="mb-10">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-extrabold text-foreground">
                        {result.courseId?.name || "Assessment Result"}
                    </h1>
                    <div className="bg-indigo-600 text-white px-6 py-2 rounded-full text-xl font-black shadow-lg shadow-indigo-200 dark:shadow-none">
                        {result.score}
                    </div>
                </div>
                <div className="flex items-center text-muted-foreground space-x-4">
                    <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-1.5" />
                        <span className="text-sm">{result.categoryId?.name || "Quiz"}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-500" />
                        <span className="text-sm">Completed on {new Date(result.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </header>

            <div className="grid gap-8">
                {/* Overall Feedback Section */}
                <Card className="border border-border shadow-xl bg-gradient-to-br from-card to-muted/20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <GraduationCap className="w-24 h-24" />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center text-indigo-900 dark:text-indigo-300">
                            <Info className="w-5 h-5 mr-2" />
                            Overall Feedback
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-foreground/90 leading-relaxed text-lg italic bg-background/50 p-4 rounded-xl border border-border">
                            {result.feedback || "Great job completing the assessment."}
                        </div>
                        {result?.explanation && (
                            <div className="bg-slate-800 text-slate-100 p-6 rounded-2xl">
                                <h4 className="font-bold mb-3 flex items-center text-indigo-400">
                                    Summarized Explanation
                                </h4>
                                <p className="text-sm leading-relaxed opacity-90">{result.explanation}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Per-Question Breakdown */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-foreground flex items-center">
                        Question Breakdown
                    </h2>
                    {result.results?.length > 0 ? (
                        result.results.map((item: any, index: number) => (
                            <Card key={index} className="border-border dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow bg-card">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-bold text-foreground">
                                        Question {index + 1}
                                    </CardTitle>
                                    <div className="bg-muted text-muted-foreground font-bold px-3 py-1 rounded-lg text-sm">
                                        Score: {item.score} / {item.maxScore}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Feedback</p>
                                        <p className="text-foreground/95">{item.feedback}</p>
                                    </div>
                                    {item.explanation && (
                                        <div className="mt-4 pt-4 border-t border-border">
                                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Explanation</p>
                                            <p className="text-muted-foreground text-sm leading-relaxed bg-muted/40 p-4 rounded-xl">
                                                {item.explanation}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-muted-foreground italic text-center py-10">No individual question data available.</p>
                    )}
                </div>
            </div>
            
            <CardFooter className="mt-12 pt-8 border-t border-border flex flex-col items-center">
                <p className="text-muted-foreground/60 text-xs mb-4 uppercase tracking-widest">Powered by GradrAI</p>
                <Button variant="outline" onClick={()=>printResult()}>Print Result</Button>
            </CardFooter>
        </div>
    );
};

export default StudentResultDetails;
