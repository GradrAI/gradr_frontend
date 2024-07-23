import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import "semantic-ui-css/semantic.min.css";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";
import Error from "./components/Error.jsx";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster toastOptions={{ duration: 4000 }} />
        <ErrorBoundary fallback={<Error />}>
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
