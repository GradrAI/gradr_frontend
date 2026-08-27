import { render, waitFor, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import GoogleCallback from "@/pages/Auth/GoogleCallback";
import api from "@/lib/axios";

vi.mock("@/lib/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

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

const saveUserMock = vi.fn();
const saveUserTokenMock = vi.fn();
const setCodeMock = vi.fn();

vi.mock("@/state", () => ({
  default: () => ({
    accountType: "lecturer",
    studentData: null,
    saveUser: saveUserMock,
    saveUserToken: saveUserTokenMock,
    setCode: setCodeMock,
  }),
}));

const renderCallback = (initialEntry: string) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <GoogleCallback />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("GoogleCallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        message: "Please verify your email.",
        data: {
          email: "teacher@example.com",
          isPending: true,
        },
      },
    });
  });

  it("exchanges callback code with state", async () => {
    renderCallback("/auth/google/callback?code=abc&state=xyz");

    expect(screen.getByText("Authenticating securely...")).toBeInTheDocument();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "getGoogleUser?code=abc&accountType=lecturer&state=xyz"
      );
    });
  });
});
