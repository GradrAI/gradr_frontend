import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Layout from "./Layout";

import Assessments from "./pages/Assessments/Assessments";
import Home from "./pages/Home";
import Uploads from "./pages/Uploads/Uploads";
import Landing from "./pages/Landing";
import Grader from "./pages/Grader/Grader";
import NewUpload from "./pages/Uploads/NewUpload";
import Details from "./pages/Grader/Details";
import Settings from "./pages/Settings";
import SignUp from "./pages/SignUp/SignUp";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Content from "./pages/Content";
import Pricing from "./pages/SignUp/Pricing";
import KYC from "./pages/SignUp/KYC";
import StudentUpload from "./pages/Student/pages/StudentUpload";
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/TermsOfService";
import PostPayment from "./pages/SignUp/PostPayment";
import useStore from "./state";
import "./App.css";
import { useEffect } from "react";
import ProtectedRoutes from "./pages/ProtectedRoutes";
import AssessmentDetails from "./pages/Assessments/AssessmentDetails";

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
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-of-service" element={<TermsOfService />} />
        <Route index element={<Landing />} />
        <Route path="link/:courseId/:uniqueCode" element={<StudentUpload />} />
        <Route path="sign-up" element={<SignUp />}>
          <Route index element={<KYC />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="confirmation" element={<PostPayment />} />
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
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
