import api from "@/lib/axios";
// import useStore from "@/state";
import { useQuery } from "@tanstack/react-query";

const StudentDashboard = () => {
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
                        <div key={result._id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg text-slate-800 line-clamp-1">
                                    {result.courseId?.name || "Unknown Course"}
                                </h3>
                                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                                    {result.score}
                                </span>
                            </div>
                            
                            {result.explanation && (
                                <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                                    {result.explanation}
                                </p>
                            )}

                            <div className="flex items-center text-xs text-slate-400">
                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(result.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;