import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "semantic-ui-css/semantic.min.css";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";
import Error from "./components/Error.jsx";
import axios from "axios";
import { BASE_URL } from "./requests/constants";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "./components/ThemeProvider";
// import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient();
axios.defaults.baseURL = BASE_URL;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        <ErrorBoundary fallback={<Error />}>
          <ThemeProvider>
            <App />
            <Analytics />
            {/* <Toaster /> */}
          </ThemeProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
