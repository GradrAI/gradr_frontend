import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startPracticeSession } from "@/requests/practice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { BrainCircuit, Loader2Icon, ArrowRight, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const EXAM_TYPES = [
  { id: "utme", label: "JAMB UTME" },
  { id: "wassce", label: "WASSCE" },
  { id: "post-utme", label: "Post-UTME" },
  { id: "ncee", label: "Common Entrance (NCEE)" },
];

const SECONDARY_SUBJECTS = [
  "english", "mathematics", "physics", "chemistry", "biology", 
  "economics", "government", "crk", "irk", "geography", 
  "commerce", "accounting", "englishlit", "history"
];

const NCEE_SUBJECTS = [
  "mathematics", "basic_science", "english", 
  "national_values", "quantitative_aptitude", "verbal_aptitude"
];

export default function PracticeSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [examType, setExamType] = useState("utme");
  const [mode, setMode] = useState("quick");
  const [questionCount, setQuestionCount] = useState(20);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["english"]);

  const availableSubjects = examType === "ncee" ? NCEE_SUBJECTS : SECONDARY_SUBJECTS;

  const handleExamTypeChange = (id: string) => {
    setExamType(id);
    // Reset subjects when switching between NCEE and secondary exam types
    if (id === "ncee") {
      setSelectedSubjects(["mathematics"]);
    } else if (examType === "ncee") {
      setSelectedSubjects(["english"]);
    }
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) => 
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const handleStart = async () => {
    if (selectedSubjects.length === 0) {
      toast.error("Please select at least one subject.");
      return;
    }
    
    setLoading(true);
    try {
      const resp = await startPracticeSession({
        examType,
        subjects: selectedSubjects,
        mode,
        questionCount
      });
      const session = resp.data.data.session;
      toast.success("Practice session created successfully!");
      navigate(`/student/practice/${session._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to start practice session");
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto h-[calc(100vh-80px)] overflow-y-auto">
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

      <div className="mb-8 p-6 sm:p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Configure SmartPrep</h1>
            <p className="text-indigo-100 font-medium text-sm sm:text-base">Create a personalized AI mock test.</p>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6 pt-8 px-6 sm:px-8">
          <CardTitle className="text-xl text-slate-800">Session Settings</CardTitle>
          <CardDescription>Tailor your practice session to your needs.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 space-y-10">
          
          {/* Exam Type Selection */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">1. Select Exam Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {EXAM_TYPES.map((type) => (
                <div 
                  key={type.id}
                  onClick={() => handleExamTypeChange(type.id)}
                  className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${
                    examType === type.id 
                      ? "border-indigo-500 bg-indigo-50/50 shadow-sm" 
                      : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${examType === type.id ? "text-indigo-700" : "text-slate-600"}`}>
                      {type.label}
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      examType === type.id ? "border-indigo-600" : "border-slate-300"
                    }`}>
                      {examType === type.id && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects Multi-Select */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">2. Select Subjects</label>
              <span className="text-xs font-semibold text-slate-400">{selectedSubjects.length} selected</span>
            </div>
            <div className="flex flex-wrap gap-3 p-5 bg-slate-50 rounded-2xl border border-slate-100">
              {availableSubjects.map((subject) => (
                <div 
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={`px-4 py-2 cursor-pointer rounded-full text-sm font-semibold transition-all flex items-center gap-2 border ${
                    selectedSubjects.includes(subject)
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md translate-y-[-1px]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                  }`}
                >
                  {selectedSubjects.includes(subject) && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  )}
                  <span className="capitalize">{subject}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Question Count Selection */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">3. Number of Questions</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[10, 20, 30, 40].map((num) => (
                <div 
                  key={num}
                  onClick={() => setQuestionCount(num)}
                  className={`p-3 rounded-xl cursor-pointer border-2 text-center transition-all ${
                    questionCount === num 
                      ? "border-purple-500 bg-purple-50/50 shadow-sm" 
                      : "border-slate-200 hover:border-purple-200"
                  }`}
                >
                  <span className={`text-lg font-bold ${questionCount === num ? "text-purple-700" : "text-slate-600"}`}>
                    {num}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mode Selection */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">4. Exam Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => setMode("quick")}
                className={`p-5 rounded-2xl cursor-pointer border-2 transition-all ${
                  mode === "quick" 
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm" 
                    : "border-slate-200 text-slate-600 hover:border-emerald-200"
                }`}
              >
                <h3 className="font-bold text-lg mb-1">Quick Practice</h3>
                <p className="text-sm opacity-80">Mixed randomized questions, balanced across chosen subjects.</p>
              </div>
              <div 
                onClick={() => setMode("subject-drill")}
                className={`p-5 rounded-2xl cursor-pointer border-2 transition-all ${
                  mode === "subject-drill" 
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm" 
                    : "border-slate-200 text-slate-600 hover:border-emerald-200"
                }`}
              >
                <h3 className="font-bold text-lg mb-1">Subject Drill</h3>
                <p className="text-sm opacity-80">Deep dive into topics grouped distinctly per subject.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <Button
              size="lg"
              onClick={handleStart}
              disabled={loading || selectedSubjects.length === 0}
              className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-10 h-14 text-lg font-semibold shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
                  Generating Test...
                </>
              ) : (
                <>
                  Begin SmartPrep
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
