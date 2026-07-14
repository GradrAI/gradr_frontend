import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SignInForm from "@/pages/Auth/SignInForm";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import axios from "axios";

// Mock dependencies
vi.mock("axios");
vi.mock("@posthog/react", () => ({
  usePostHog: () => ({
    capture: vi.fn(),
    identify: vi.fn(),
  }),
}));
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Zustand store partially to not interfere with login
vi.mock("@/state", () => ({
  default: () => ({
    user: null,
    accountType: "",
    saveUser: vi.fn(),
    saveUserToken: vi.fn(),
    setAccountType: vi.fn(),
  }),
}));
vi.mock("@/lib/recaptcha", () => ({
  getRecaptchaToken: vi.fn().mockResolvedValue("test-token"),
  loadRecaptcha: vi.fn().mockResolvedValue(undefined),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("SignInForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the sign in form correctly", () => {
    renderWithProviders(<SignInForm />);
    expect(screen.getByRole("heading", { name: /Welcome back/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@domain.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in with Google" })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields on submit", async () => {
    renderWithProviders(<SignInForm />);
    const submitBtn = screen.getByRole("button", { name: "Sign In" });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Enter a valid email/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email", async () => {
    renderWithProviders(<SignInForm />);
    const emailInput = screen.getByPlaceholderText(/you@domain.com/i);
    const submitBtn = screen.getByRole("button", { name: "Sign In" });

    await userEvent.type(emailInput, "not-an-email");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Enter a valid email/i)).toBeInTheDocument();
    });
  });

  it("calls login API on valid submission", async () => {
    // Mock axios post to resolve
    (axios.post as any).mockResolvedValueOnce({
      data: {
        user: { _id: "1", email: "test@test.com", role: "lecturer" },
        token: "fake-token",
        needsKYC: false,
        needsPayment: false,
        membershipStatus: "approved",
      },
    });

    renderWithProviders(<SignInForm />);
    const emailInput = screen.getByPlaceholderText(/you@domain.com/i);
    const passInput = screen.getByPlaceholderText(/••••••••/i);
    const submitBtn = screen.getByRole("button", { name: "Sign In" });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passInput, "password123");
    
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/auth/login",
        { email: "test@example.com", password: "password123" },
        { headers: { "X-Recaptcha-Token": "test-token" } }
      );
    });
  });
});
