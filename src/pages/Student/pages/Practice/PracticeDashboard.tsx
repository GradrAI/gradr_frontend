import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPracticeSessions } from "@/requests/practice";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, BrainCircuit } from "lucide-react";

export default function PracticeDashboard() {
  const navigate = useNavigate();
  
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ["practiceSessions"],
    queryFn: () => getPracticeSessions(),
  });

  const sessions = response?.data?.data?.sessions || [];

  return (
    <div className="p-8 max-w-6xl mx-auto h-[calc(100vh-80px)] overflow-y-auto">
      <header className="mb-10 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2 flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-indigo-500" />
            SmartPrep Practice
          </h1>
          <p className="text-slate-500 font-medium">Master your exams with AI-guided mock tests.</p>
        </div>
        <Button 
          onClick={() => navigate("/student/practice/new")}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
          size="lg"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          New Practice
        </Button>
      </header>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 animate-pulse font-medium">Loading your past sessions...</p>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-red-700 mb-8 shadow-sm">
          <h3 className="font-bold mb-1 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Error loading sessions
          </h3>
          <p>{error instanceof Error ? error.message : "An unexpected error occurred"}</p>
        </div>
      )}

      {!isLoading && !isError && sessions.length === 0 && (
        <div className="bg-slate-50/50 backdrop-blur-sm border border-dashed border-slate-300 p-16 rounded-3xl text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <BrainCircuit className="w-12 h-12 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">No practice sessions yet</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">Start your first SmartPrep session to get AI-powered explanations for JAMB & WASSCE past questions.</p>
          <Button 
            onClick={() => navigate("/student/practice/new")}
            variant="outline"
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl"
            size="lg"
          >
            Start your first session
          </Button>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session: any) => (
            <Card 
              key={session._id} 
              className="bg-white/80 backdrop-blur-md border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 overflow-hidden"
              onClick={() => navigate(`/student/practice/${session._id}`)}
            >
              <CardHeader className="pb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                      {session.examType}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-slate-500 capitalize">
                      {session.mode.replace('-', ' ')}
                    </CardDescription>
                  </div>
                  {session.status === "completed" ? (
                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white px-3 py-1.5 rounded-xl text-sm font-black shadow-md">
                      {session.score}%
                    </div>
                  ) : (
                    <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider">
                      In Progress
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-2">
                  {session.subjects.map((sub: string) => (
                    <span key={sub} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold capitalize">
                      {sub}
                    </span>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="pt-4 flex items-center justify-between border-t border-slate-50">
                <div className="flex items-center text-[11px] text-slate-400 font-medium uppercase tracking-widest">
                  {new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 font-medium text-sm flex items-center">
                  {session.status === 'completed' ? 'Review test' : 'Resume test'}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
