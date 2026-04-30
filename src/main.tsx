import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";
import Error from "./components/Error.jsx";
import axios from "axios";
import { BASE_URL } from "./requests/constants";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "./components/ThemeProvider";
// import { Toaster } from "@/components/ui/toaster";
import { PostHogProvider } from '@posthog/react'
import { SpeedInsights } from "@vercel/speed-insights/react"

const options = {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
} as const


axios.defaults.baseURL = BASE_URL;
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        <ErrorBoundary fallback={<Error />}>
          <ThemeProvider>
            <PostHogProvider apiKey={import.meta.env.VITE_POSTHOG_KEY} options={options}>
              <App />
            </PostHogProvider>
            <Analytics />
            <SpeedInsights />
            {/* <Toaster /> */}
          </ThemeProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
