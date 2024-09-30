import { Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./Layout";
import Assessments from "./components/Assessments";
import Results from "./components/Results";
import Home from "./pages/Home";
import Details from "./components/Details";
import Submissions from "./pages/Submissions";
import Login from "./components/Login";
import Landing from "./pages/Landing";

function App() {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<Landing />} />
        <Route path="app" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="results">
            <Route index element={<Results />} />
            <Route path=":id" element={<Details />} />
          </Route>
          <Route path="submissions" element={<Submissions />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
