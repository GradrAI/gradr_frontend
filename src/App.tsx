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

import "./App.css";
import Content from "./pages/Content";
import PaymentPlan from "./pages/SignUp/PaymentPlan";
import KYC from "./pages/SignUp/KYC";

function App() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  if (pathname === "/app" && localStorage?.getItem("user"))
    nav("/app/assessments");

  return (
    <Routes>
      <Route path="/">
        <Route index element={<Landing />} />
        <Route path="sign-up" element={<SignUp />}>
          <Route index element={<KYC />} />
          <Route path="paymentPlan" element={<PaymentPlan />} />
        </Route>
        <Route path="app" element={<Layout />}>
          <Route element={<Home />}>
            <Route index element={<Content />} />
          </Route>
          <Route path="assessments" element={<Assessments />} />
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
      {/* add not_found route */}
      <Route path="*" element={<h1>Not Found</h1>} />
    </Routes>
  );
}

export default App;
