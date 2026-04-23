import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "@/state";
import { Loader2 } from "lucide-react";

const Home = () => {
  const nav = useNavigate();
  const { user } = useStore();

  useEffect(() => {
    // Redirect guard logic
    if (user && Object.keys(user).length > 0) {
      // Authenticated user
      if (user.role === "student") {
        nav("/student/dashboard", { replace: true });
      } else {
        // Teachers/Lecturers/Admins
        nav("/app/assessments", { replace: true });
      }
    } else {
      // Unauthenticated user - redirect to login
      nav("/login", { replace: true });
    }
  }, [user, nav]);

  // Show a simple loading state while redirecting
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-slate-500 font-medium">Redirecting you to your dashboard...</p>
    </div>
  );
};

export default Home;
