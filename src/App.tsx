import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import Assessments from "./pages/Assessments/Assessments";
import Home from "./pages/Home";
import Uploads from "./pages/Uploads/Uploads";
import Login from "./components/Login";
import Landing from "./pages/Landing";
import Grader from "./pages/Grader/Grader";
import NewUpload from "./pages/Uploads/NewUpload";
import Details from "./pages/Grader/Details";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<Landing />} />
        <Route path="app" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
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
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
