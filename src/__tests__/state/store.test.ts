/**
 * Zustand store unit tests.
 *
 * Tests the core state management logic: user persistence,
 * token storage, reset, and account type management.
 * These tests don't need a DOM — they exercise pure JS logic.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { act } from "@testing-library/react";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock the queryClient before importing the store
vi.mock("@/lib/queryClient", () => ({
  queryClient: {
    clear: vi.fn(),
  },
}));

// Import AFTER mocks are in place
import useStore from "@/state";

const mockUser: any = {
  _id: "user-123",
  first_name: "Test",
  last_name: "User",
  email: "test@example.com",
  role: "lecturer",
  username: "testuser",
  provider: "Local",
  picture: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  refresh_token: "",
  __v: 0,
};

describe("Zustand store", () => {
  beforeEach(() => {
    const { reset } = useStore.getState();
    act(() => reset());
    localStorageMock.clear();
  });

  it("should start with null user and empty token", () => {
    const { user, token } = useStore.getState();
    expect(user).toBeNull();
    expect(token).toBe("");
  });

  it("should save a user", () => {
    act(() => {
      useStore.getState().saveUser(mockUser as any);
    });
    const { user } = useStore.getState();
    expect(user).toEqual(mockUser);
    expect(user?.email).toBe("test@example.com");
  });

  it("should save a token", () => {
    act(() => {
      useStore.getState().saveUserToken("jwt-token-abc");
    });
    const { token } = useStore.getState();
    expect(token).toBe("jwt-token-abc");
  });

  it("should set account type", () => {
    act(() => {
      useStore.getState().setAccountType("student");
    });
    expect(useStore.getState().accountType).toBe("student");
  });

  it("should reset all state to defaults", () => {
    act(() => {
      useStore.getState().saveUser(mockUser as any);
      useStore.getState().saveUserToken("some-token");
      useStore.getState().setAccountType("lecturer");
    });

    // Verify state is populated
    expect(useStore.getState().user).not.toBeNull();
    expect(useStore.getState().token).toBe("some-token");

    // Reset
    act(() => {
      useStore.getState().reset();
    });

    const { user, token, accountType } = useStore.getState();
    expect(user).toBeNull();
    expect(token).toBe("");
    expect(accountType).toBe("");
  });

  it("should handle selectedPaymentPlan lifecycle", () => {
    const mockPlan = { _id: "plan-1", name: "Pro", amount: 5000 };

    act(() => {
      useStore.getState().setSelectedPaymentPlan(mockPlan as any);
    });
    expect(useStore.getState().selectedPaymentPlan).toEqual(mockPlan);

    act(() => {
      useStore.getState().setSelectedPaymentPlan(null);
    });
    expect(useStore.getState().selectedPaymentPlan).toBeNull();
  });
});
