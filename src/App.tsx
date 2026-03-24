import { useEffect, Suspense, lazy } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import useStore from "./state";

import Layout from "./Layout";

// Lazy loaded components
const Assessments = lazy(() => import("./pages/Assessments/Assessments"));
const Home = lazy(() => import("./pages/Home"));
const Uploads = lazy(() => import("./pages/Uploads/Uploads"));
const Landing = lazy(() => import("./pages/Landing"));
const Grader = lazy(() => import("./pages/Grader/Grader"));
const NewUpload = lazy(() => import("./pages/Uploads/NewUpload"));
const Details = lazy(() => import("./pages/Grader/Details"));
const Settings = lazy(() => import("./pages/Settings"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Content = lazy(() => import("./pages/Content"));
const Pricing = lazy(() => import("./pages/Auth/Pricing"));
const KYC = lazy(() => import("./pages/Auth/KYC"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PostPayment = lazy(() => import("./pages/Auth/PostPayment"));
const ProtectedRoutes = lazy(() => import("./pages/ProtectedRoutes"));
const AssessmentDetails = lazy(() => import("./pages/Assessments/AssessmentDetails"));
const SignInForm = lazy(() => import("./pages/Auth/SignInForm"));
const SignUpForm = lazy(() => import("./pages/Auth/SignUpForm"));
const AuthLayout = lazy(() => import("./pages/Auth/AuthLayout"));
const SetPassword = lazy(() => import("./pages/Auth/SetPassword"));
const StudentLayout = lazy(() => import("./pages/Student/components/StudentLayout"));
const StudentRouter = lazy(() => import("./pages/Student/pages/StudentRouter"));
const ExamCreate = lazy(() => import("./pages/Exams/pages/ExamCreate"));
const Exams = lazy(() => import("./pages/Exams/pages/Exams"));

import "./App.css";
const ExamComponent = lazy(() => import("./pages/Student/pages/ExamComponent"));
const StudentUpload = lazy(() => import("./pages/Student/pages/StudentUpload"));
const StudentDashboard = lazy(() => import("./pages/Student/pages/StudentDashboard"));
const StudentResultDetails = lazy(() => import("./pages/Student/pages/StudentResultDetails"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { user } = useStore();

  useEffect(() => {
    if (pathname === "/app/" && user && Object.keys(user)?.length)
      nav("/app/assessments");
  }, [user]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/">
          <Route index element={<Landing />} />

          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfService />} />

          <Route path="auth" element={<AuthLayout />}>
            <Route path="sign-in" element={<SignInForm />} />
            <Route path="sign-up" element={<SignUpForm />} />
            <Route path="set-password" element={<SetPassword />} />
            <Route path="kyc" element={<KYC />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="confirmation" element={<PostPayment />} />
          </Route>

          <Route path="link/:courseId/:uniqueCode" element={<StudentLayout />}>
            <Route index element={<StudentRouter />} />
          </Route>

          <Route path="student" element={<StudentLayout />}>
            <Route index element={<StudentRouter />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="results/:resultId" element={<StudentResultDetails />} />
            <Route path="quiz" element={<ExamComponent />} />
            <Route path="grading" element={<StudentUpload />} />
          </Route>

          <Route path="app" element={<Layout />}>
            <Route element={<Home />}>
              <Route index element={<Content />} />
            </Route>

            <Route path="assessments">
              <Route index element={<Assessments />} />
              <Route path=":courseId" element={<AssessmentDetails />} />
            </Route>

            <Route element={<ProtectedRoutes />}>
              <Route path="grader">
                <Route index element={<Grader />} />
                <Route path="details" element={<Details />} />
              </Route>

              <Route path="uploads">
                <Route index element={<Uploads />} />
                <Route path=":id" element={<Details />} />
                <Route path="new" element={<NewUpload />} />
              </Route>

              <Route path="settings" element={<Settings />} />

              <Route path="exams">
                <Route index element={<Exams />} />
                <Route path="create" element={<ExamCreate />} />
              </Route>
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;

