import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VerifyOtp from "@/pages/Auth/VerifyOtp";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import axios from "axios";

vi.mock("axios");

const captureMock = vi.fn();
vi.mock("@posthog/react", () => ({
  usePostHog: () => ({ capture: captureMock }),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/state", () => ({
  default: () => ({
    saveUser: vi.fn(),
    saveUserToken: vi.fn(),
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderAt = (initialEntry: string) =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <VerifyOtp />
      </MemoryRouter>
    </QueryClientProvider>
  );

describe("VerifyOtp Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it("rejects a non-numeric code with a clear message", async () => {
    renderAt("/auth/verify-otp?email=test@example.com");
    const input = screen.getByPlaceholderText("123456");
    const submit = screen.getByRole("button", { name: "Verify" });

    await userEvent.type(input, "abc123");
    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText(/Enter the 6-digit code/i)).toBeInTheDocument();
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("verifies a valid 6-digit code and captures the attempt", async () => {
    (axios.post as any).mockResolvedValueOnce({
      data: { user: { role: "student" }, token: "t" },
    });

    renderAt("/auth/verify-otp?email=test@example.com");
    const input = screen.getByPlaceholderText("123456");

    await userEvent.type(input, "123456");
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/auth/verify-otp", {
        email: "test@example.com",
        otp: "123456",
      });
    });
    expect(captureMock).toHaveBeenCalledWith("otp_verification_attempted", {
      attempt: 1,
    });
  });

  it("clears the field and captures a failure event on an invalid code", async () => {
    (axios.post as any).mockRejectedValueOnce({
      response: { data: { error: "Invalid or expired OTP" } },
    });

    renderAt("/auth/verify-otp?email=test@example.com");
    const input = screen.getByPlaceholderText("123456") as HTMLInputElement;

    await userEvent.type(input, "111111");
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await waitFor(() => {
      expect(captureMock).toHaveBeenCalledWith(
        "otp_verification_failed",
        expect.objectContaining({ attempt: 1 })
      );
    });
    await waitFor(() => expect(input.value).toBe(""));
  });

  it("auto-requests a fresh code when redirected here for a pending account", async () => {
    (axios.post as any).mockResolvedValue({ data: {} });

    renderAt("/auth/verify-otp?email=test@example.com&resend=1");

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/auth/resend-otp", {
        email: "test@example.com",
      });
    });
    expect(captureMock).toHaveBeenCalledWith("otp_resend_requested", {
      automatic: true,
    });
    expect(
      screen.getByText(/we've sent a fresh 6-digit code/i)
    ).toBeInTheDocument();
  });
});
