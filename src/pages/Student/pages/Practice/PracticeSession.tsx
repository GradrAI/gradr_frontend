import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPracticeSessionById, submitPracticeSession, pollExplanations } from "@/requests/practice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { BrainCircuit, Clock, CheckCircle2, XCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Loader2Icon } from "lucide-react";
import DOMPurify from "dompurify";

const sanitize = (html: string) => ({ __html: DOMPurify.sanitize(html) });

export default function PracticeSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { studentAnswer: string; timeSpentMs: number }>>({});
  const [globalTimeLeft, setGlobalTimeLeft] = useState(7200); // 2 hours visual countdown
  const [pollingAllowed, setPollingAllowed] = useState(false);
  
  const questionStartTime = useRef<number>(Date.now());

  // Fetch session data
  const { data: sessionData, isLoading, isError } = useQuery({
    queryKey: ["practiceSession", sessionId],
    queryFn: () => getPracticeSessionById(sessionId!),
    enabled: !!sessionId,
    refetchInterval: pollingAllowed ? 3000 : false,
  });

  const session = sessionData?.data?.data;
  const isCompleted = session?.status === "completed";
  const questions = session?.questions || [];

  // Poll explanations specifically if completed but explanations not ready
  useEffect(() => {
    if (isCompleted && !session?.explanationsGenerated) {
      setPollingAllowed(true);
    } else {
      setPollingAllowed(false);
    }
  }, [isCompleted, session?.explanationsGenerated]);

  // Global visual countdown timer
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setGlobalTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  // Record time when switching questions
  const recordQuestionTime = () => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex].pastQuestionId?._id || questions[currentIndex].pastQuestionId;
    const currentTime = Date.now();
    const spent = currentTime - questionStartTime.current;
    
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        studentAnswer: prev[qId]?.studentAnswer || "",
        timeSpentMs: (prev[qId]?.timeSpentMs || 0) + spent
      }
    }));
    questionStartTime.current = currentTime;
  };

  const handleNext = () => {
    recordQuestionTime();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    recordQuestionTime();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const selectOption = (qId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        studentAnswer: value,
        timeSpentMs: prev[qId]?.timeSpentMs || 0
      }
    }));
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      recordQuestionTime();
      // Format payload from answers state ensuring we send an array
      const payload = questions.map((q: any) => {
        const id = q.pastQuestionId?._id || q.pastQuestionId;
        return {
          pastQuestionId: id,
          studentAnswer: answers[id]?.studentAnswer || "",
          timeSpentMs: answers[id]?.timeSpentMs || 0
        };
      });
      return submitPracticeSession(sessionId!, payload);
    },
    onSuccess: () => {
      toast.success("Test submitted! Generating your AI Explanations...");
      queryClient.invalidateQueries({ queryKey: ["practiceSession", sessionId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit test");
    }
  });

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen flex-col">
      <Loader2Icon className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Loading session...</p>
    </div>
  );

  if (isError || !session) return (
    <div className="flex justify-center items-center h-screen text-red-500">
      Error loading test session.
    </div>
  );

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
  };

  const currentQ = questions[currentIndex];
  // Use the stored data on the session question subdocument
  const currentQId = currentQ?.pastQuestionId?._id || currentQ?.pastQuestionId;
  const currentQText = currentQ?.questionText || "";
  const currentQOptions = currentQ?.options || {};
  const currentQImage = currentQ?.image || null;

  return (
    <div className="p-8 max-w-5xl mx-auto h-[calc(100vh-80px)] overflow-y-auto">
      
      <div className="mb-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/student/practice')}
          className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 -ml-4 px-4 py-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Practice
        </Button>
      </div>

      {/* HEADER */}
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
            {session.examType} <span className="text-slate-300">|</span> <span className="text-lg capitalize text-indigo-600">{session.mode.replace('-', ' ')}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">SmartPrep AI Session</p>
        </div>

        {isCompleted ? (
          <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white px-6 py-3 rounded-2xl shadow-md flex items-center gap-3">
            <div className="text-3xl font-black">{session.score}%</div>
            <div className="text-sm font-medium leading-tight">
              <div>{session.totalCorrect} Correct</div>
              <div>out of {session.totalQuestions}</div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 text-slate-50 px-6 py-3 rounded-2xl shadow-md flex items-center gap-3">
            <Clock className="w-5 h-5 text-indigo-400" />
            <div className="font-mono text-2xl font-bold tracking-wider">{formatTime(globalTimeLeft)}</div>
          </div>
        )}
      </header>

      {/* POLLING LOADER */}
      {isCompleted && !session.explanationsGenerated && (
        <div className="mb-6 p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4 animate-pulse">
          <div className="bg-white p-3 rounded-full shadow-sm">
            <BrainCircuit className="w-6 h-6 text-indigo-600 animate-bounce" />
          </div>
          <div>
            <h3 className="font-bold text-indigo-900">GradrAI is determining pedagogical feedback...</h3>
            <p className="text-indigo-700 text-sm">Please wait while we generate concept tags and step-by-step explanations for your test.</p>
          </div>
        </div>
      )}

      {/* QUESTION NAV */}
      {!isCompleted && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {questions.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => {
                recordQuestionTime();
                setCurrentIndex(idx);
              }}
              className={`min-w-10 h-10 rounded-lg font-bold text-sm transition-all flexitems-center justify-center ${
                currentIndex === idx 
                  ? "bg-indigo-600 text-white shadow-md scale-110" 
                  : answers[questions[idx].pastQuestionId?._id || questions[idx].pastQuestionId]?.studentAnswer
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    : "bg-white text-slate-400 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* MULTIPLE COMPLETED QUESTION VIEW vs SINGLE ACTIVE VIEW */}
      {isCompleted ? (
        <div className="space-y-8">
          {questions.map((q: any, idx: number) => {
            const isCorrect = q.isCorrect;
            const chosenAns = q.studentAnswer;
            const labels = ["a", "b", "c", "d"];

            return (
              <Card key={q._id} className="border-slate-100 shadow-sm overflow-hidden">
                <div className={`h-2 w-full ${isCorrect ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                <CardContent className="p-8">
                  <div className="flex gap-4 mb-6">
                    <div className="w-8 h-8 shrink-0 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500">
                      {idx + 1}
                    </div>
                    <div className="prose prose-slate max-w-none text-slate-800 font-medium text-lg leading-relaxed" dangerouslySetInnerHTML={sanitize(q.questionText)} />
                  </div>

                  {q.image && (
                    <div className="pl-12 mb-6">
                      <img
                        src={q.image}
                        alt={`Diagram for question ${idx + 1}`}
                        className="max-w-full md:max-w-md rounded-xl border border-slate-200 shadow-sm"
                        loading="lazy"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3 pl-12 mb-8">
                    {labels.map((opt) => {
                      const optionText = q.options?.[opt];
                      if (!optionText) return null;
                      
                      const isThisCorrect = q.correctAnswer === opt;
                      const isThisChosen = chosenAns === opt;
                      
                      let optClass = "border-slate-200 bg-slate-50 text-slate-500 opacity-60";
                      
                      if (isThisCorrect) {
                        optClass = "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm font-medium";
                      } else if (isThisChosen && !isCorrect) {
                        optClass = "border-red-300 bg-red-50 text-red-800 shadow-sm";
                      }
                      
                      return (
                        <div key={opt} className={`p-4 rounded-xl border-2 flex items-start gap-4 transition-all ${optClass}`}>
                          <div className="font-bold uppercase w-6 shrink-0">{opt}.</div>
                          <div dangerouslySetInnerHTML={sanitize(optionText)} />
                          {isThisCorrect && <CheckCircle2 className="w-5 h-5 ml-auto text-emerald-500" />}
                          {(isThisChosen && !isCorrect) && <XCircle className="w-5 h-5 ml-auto text-red-500" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Explanation Area */}
                  {session.explanationsGenerated && q.explanation && (
                    <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100/50 relative">
                      <div className="absolute top-0 right-8 -translate-y-1/2 bg-white px-4 py-1 rounded-full shadow-sm border border-indigo-100 flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold text-indigo-700 tracking-wider uppercase">AI Explanation</span>
                      </div>
                      
                      <div className="prose prose-indigo text-slate-700 text-sm leading-relaxed max-w-none" dangerouslySetInnerHTML={sanitize(q.explanation)} />
                      
                      {q.conceptTags && q.conceptTags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-indigo-200/50">
                          {q.conceptTags.map((tag: string) => (
                            <span key={tag} className="px-3 py-1 bg-white text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100 shadow-sm flex items-center gap-1.5 before:content-[''] before:block before:w-1.5 before:h-1.5 before:rounded-full before:bg-indigo-400 capitalize">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden min-h-[500px] flex flex-col relative">
          <CardContent className="p-10 flex-1 flex flex-col">
            {questions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <div className="bg-slate-50 p-6 rounded-full mb-6">
                  <XCircle className="w-12 h-12 text-slate-300" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">No Questions Available</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  We couldn't find any questions matching your criteria ({session.examType}, {session.subjects.join(', ')}). 
                  Please try a different subject or configuration.
                </p>
                <Button onClick={() => navigate('/student/practice')} className="bg-indigo-600">
                  Go Back
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-4 mb-10">
                  <div className="w-10 h-10 shrink-0 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
                    {currentIndex + 1}
                  </div>
                  <div className="prose prose-lg max-w-none text-slate-800 font-medium leading-relaxed pt-1" dangerouslySetInnerHTML={sanitize(currentQText)} />
                </div>

                {currentQImage && (
                  <div className="pl-14 mb-8">
                    <img
                      src={currentQImage}
                      alt={`Diagram for question ${currentIndex + 1}`}
                      className="max-w-full md:max-w-md rounded-xl border border-slate-200 shadow-sm"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="space-y-4 pl-14 flex-1">
                  {['a', 'b', 'c', 'd'].map((opt) => {
                    const optValue = currentQOptions[opt];
                    if (!optValue) return null;
                
                const isSelected = answers[currentQId]?.studentAnswer === opt;
                
                return (
                  <div 
                    key={opt}
                    onClick={() => selectOption(currentQId, opt)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                      isSelected 
                        ? "border-indigo-500 bg-indigo-50/50 shadow-md translate-x-2" 
                        : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="relative isolate pt-0.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-indigo-600" : "border-slate-300"
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-in zoom-in duration-200"></div>}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className={`prose max-w-none text-base ${isSelected ? "text-indigo-900 font-medium" : "text-slate-600"}`} dangerouslySetInnerHTML={sanitize(optValue)} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* In-Progress Footer Navigation */}
            <div className="mt-12 flex justify-between items-center pt-6 border-t border-slate-100">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="text-slate-600 border-slate-200 hover:bg-slate-100 rounded-xl"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Previous
              </Button>

              {currentIndex === questions.length - 1 ? (
                <Button
                  size="lg"
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg rounded-xl px-8"
                >
                  {submitMutation.isPending ? <Loader2Icon className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                  Submit Test
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={handleNext}
                  className="bg-slate-900 text-white hover:bg-slate-800 shadow-md rounded-xl px-8"
                >
                  Next Question
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
        </Card>
      )}
    </div>
  );
}
