import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import useStore from "./state";

import Layout from "./Layout";

import Assessments from "./pages/Assessments/Assessments";
import Home from "./pages/Home";
import Uploads from "./pages/Uploads/Uploads";
import Landing from "./pages/Landing";
import Grader from "./pages/Grader/Grader";
import NewUpload from "./pages/Uploads/NewUpload";
import Details from "./pages/Grader/Details";
import Settings from "./pages/Settings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Content from "./pages/Content";
import Pricing from "./pages/Auth/Pricing";
import KYC from "./pages/Auth/KYC";
import StudentUpload from "./pages/Student/pages/StudentUpload";
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/TermsOfService";
import PostPayment from "./pages/Auth/PostPayment";
import ProtectedRoutes from "./pages/ProtectedRoutes";
import AssessmentDetails from "./pages/Assessments/AssessmentDetails";
import SignInForm from "./pages/Auth/SignInForm";
import SignUpForm from "./pages/Auth/SignUpForm";
import AuthLayout from "./pages/Auth/AuthLayout";

import "./App.css";
import StudentLayout from "./pages/Student/components/StudentLayout";
import { Navigate, Outlet } from "react-router-dom";

// Route guard for lecturer-only routes
function ProtectedLecturerRoute({
  user,
  children,
}: {
  user: any;
  children?: React.ReactNode;
}) {
  if (!user || user.role === "student") {
    // If not logged in or is a student, redirect to home
    return <Navigate to="/" replace />;
  }
  return children ? children : <Outlet />;
}

function App() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { user } = useStore();

  useEffect(() => {
    if (pathname === "/app/" && user && Object.keys(user)?.length)
      nav("/app/assessments");
  }, [user]);

  return (
    <Routes>
      <Route path="/">
        <Route index element={<Landing />} />

        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-of-service" element={<TermsOfService />} />

        <Route path="link/:courseId/:uniqueCode" element={<StudentLayout />}>
          <Route index element={<StudentUpload />} />
        </Route>

        <Route path="/auth" element={<AuthLayout />}>
          <Route path="sign-in" element={<SignInForm />} />
          <Route path="sign-up" element={<SignUpForm />} />
          <Route path="kyc" element={<KYC />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="confirmation" element={<PostPayment />} />
        </Route>

        {/* Lecturer-only protected routes */}
        <Route
          path="app"
          element={
            <ProtectedLecturerRoute user={user}>
              <Layout />
            </ProtectedLecturerRoute>
          }
        >
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
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
