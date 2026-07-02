import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
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

vi.mock("@paystack/inline-js", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      resumeTransaction: vi.fn(),
    })),
  };
});

let mockStore = {
  user: { email: "test@example.com" },
  selectedPaymentPlan: null,
  setSelectedPaymentPlan: vi.fn((plan) => {
    mockStore.selectedPaymentPlan = plan;
  }),
};

vi.mock("@/state", () => ({
  default: () => mockStore,
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

describe("Pricing Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.selectedPaymentPlan = null;
    mockStore.setSelectedPaymentPlan.mockClear();
    queryClient.clear();
  });

  it("shows loading state initially", () => {
    // Return a pending promise so it stays loading
    (api.get as any).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<Pricing />);
    expect(screen.getByText(/Loading payment plans/i)).toBeInTheDocument();
  });

  it("renders payment plans after loading", async () => {
    const mockPlans = [
      {
        _id: "plan_1",
        name: "Basic",
        planType: "subscription",
        amount: 5000,
        credits: 10,
        features: ["Feature 1", "Feature 2"],
      },
    ];

    (api.get as any).mockResolvedValue({ data: { data: mockPlans } });

    renderWithProviders(<Pricing />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading payment plans/i)).not.toBeInTheDocument();
      expect(screen.getByText("Basic")).toBeInTheDocument();
      expect(screen.getByText("5,000")).toBeInTheDocument(); // Amount formatter
      expect(screen.getByText("Feature 1")).toBeInTheDocument();
    });
  });

  it("allows selecting a plan", async () => {
    const mockPlans = [
      {
        _id: "plan_1",
        name: "Pro",
        planType: "subscription",
        amount: 10000,
        credits: 50,
        features: [],
      },
    ];

    (api.get as any).mockResolvedValue({ data: { data: mockPlans } });

    renderWithProviders(<Pricing />);

    await waitFor(() => {
      expect(screen.getByText("Pro")).toBeInTheDocument();
    });

    // Click the card
    fireEvent.click(screen.getByText("Pro"));

    expect(mockStore.setSelectedPaymentPlan).toHaveBeenCalledWith(mockPlans[0]);
  });
});
