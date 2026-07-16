import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AxiosResponse } from "axios";
import Pricing from "@/pages/Auth/Pricing";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import api from "@/lib/axios";

// Mock dependencies
vi.mock("@/lib/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

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

vi.mock("@paystack/inline-js", () => ({
  default: vi.fn().mockImplementation(() => ({
    resumeTransaction: vi.fn(),
  })),
}));

const mockStore = {
  user: { email: "test@example.com" },
  selectedPaymentPlan: null as unknown,
  // usePaymentRail gates the plans query on a selected rail; seed one so plans load.
  selectedRail: "paystack_ngn" as string | null,
  setSelectedPaymentPlan: vi.fn((plan: unknown) => {
    mockStore.selectedPaymentPlan = plan;
  }),
  setSelectedRail: vi.fn((rail: string) => {
    mockStore.selectedRail = rail;
  }),
};

vi.mock("@/state", () => {
  const useStore = () => mockStore;
  // usePaymentRail reads useStore.getState().selectedRail directly.
  useStore.getState = () => mockStore;
  return { default: useStore };
});

// Test doubles return partial Axios shapes; cast once at the mock boundary.
const asAxios = (data: unknown) => ({ data }) as unknown as AxiosResponse;

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

describe("Pricing Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.selectedPaymentPlan = null;
    mockStore.selectedRail = "paystack_ngn";
    mockStore.setSelectedPaymentPlan.mockClear();
    queryClient.clear();
    // usePaymentRail calls fetch("/api/geo"); stub it so the hook resolves cleanly.
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ country: "NG" }) })
      )
    );
  });

  it("shows loading state initially", () => {
    // Return a pending promise so it stays loading
    vi.mocked(api.get).mockReturnValue(new Promise<AxiosResponse>(() => {}));
    renderWithProviders(<Pricing />);
    expect(screen.getByText(/Loading payment plans/i)).toBeInTheDocument();
  });

  it("renders payment plans after loading", async () => {
    const mockPlans = [
      {
        _id: "plan_1",
        name: "Basic",
        planType: "subscription",
        rail: "paystack_ngn",
        amount: 5000,
        credits: 10,
        features: ["Feature 1", "Feature 2"],
      },
    ];

    vi.mocked(api.get).mockResolvedValue(asAxios({ data: mockPlans }));

    renderWithProviders(<Pricing />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading payment plans/i)).not.toBeInTheDocument();
      expect(screen.getByText("Basic")).toBeInTheDocument();
      expect(screen.getByText(/5,000/)).toBeInTheDocument(); // NGN amount (₦5,000)
      expect(screen.getByText("Feature 1")).toBeInTheDocument();
    });
  });

  it("allows selecting a plan", async () => {
    const mockPlans = [
      {
        _id: "plan_1",
        name: "Pro",
        planType: "subscription",
        rail: "paystack_ngn",
        amount: 10000,
        credits: 50,
        features: [],
      },
    ];

    vi.mocked(api.get).mockResolvedValue(asAxios({ data: mockPlans }));

    renderWithProviders(<Pricing />);

    await waitFor(() => {
      expect(screen.getByText("Pro")).toBeInTheDocument();
    });

    // Click the card
    fireEvent.click(screen.getByText("Pro"));

    expect(mockStore.setSelectedPaymentPlan).toHaveBeenCalledWith(mockPlans[0]);
  });
});
