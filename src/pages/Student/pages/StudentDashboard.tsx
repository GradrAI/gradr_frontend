import api from "@/lib/axios";
// import useStore from "@/state";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { data: resultsResponse, isLoading, isError, error } = useQuery({
        queryKey: ["results"],
        queryFn: async () => await api.get(`/results/all`),
    });

    const results = resultsResponse?.data || [];

    return (
        <div className="p-8 max-w-6xl">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Student Dashboard</h1>
                <p className="text-slate-500">Track your courses and academic performance</p>
            </header>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 animate-pulse">Fetching your results...</p>
                </div>
            )}

            {isError && (
                <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-red-700 mb-8">
                    <h3 className="font-bold mb-1">Error loading results</h3>
                    <p>{error instanceof Error ? error.message : "An unexpected error occurred"}</p>
                </div>
            )}

            {!isLoading && !isError && results.length === 0 && (
                <div className="bg-slate-50 border border-slate-100 p-12 rounded-3xl text-center">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">No results yet</h2>
                    <p className="text-slate-500">Your graded exams will appear here once they are processed.</p>
                </div>
            )}

            {results.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((result: any) => (
                        <Card 
                            key={result._id} 
                            className="bg-white border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 overflow-hidden"
                            onClick={() => navigate(`/student/results/${result._id}`)}
                        >
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                            {result.courseId?.name || "Unknown Course"}
                                        </CardTitle>
                                        <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                                            {result.categoryId?.name || "Quiz"}
                                        </CardDescription>
                                    </div>
                                    <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-sm font-black shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        {result.score}
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardContent>
                                {result.explanation && (
                                    <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                                        "{result.explanation}"
                                    </p>
                                )}
                            </CardContent>

                            <CardFooter className="pt-0 flex items-center justify-between">
                                <div className="flex items-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                                    <svg className="w-3.5 h-3.5 mr-1.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {new Date(result.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;