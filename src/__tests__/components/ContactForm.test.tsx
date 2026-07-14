import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import type { AxiosResponse } from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ContactForm from "@/components/landing/ContactForm";
import api from "@/lib/axios";

vi.mock("@/lib/axios", () => ({
  default: { post: vi.fn() },
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

const renderForm = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <ContactForm />
    </QueryClientProvider>
  );

// Test double: the component ignores the response body, so shape is irrelevant.
const okResponse = { data: { success: true } } as unknown as AxiosResponse;

const mockedPost = vi.mocked(api.post);

describe("ContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders name, email, phone, and message fields", () => {
    renderForm();
    expect(screen.getByPlaceholderText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@domain.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\+234/)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Tell us how we can help/i)
    ).toBeInTheDocument();
  });

  it("shows validation errors for required fields on empty submit", async () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/Please enter your name/i)).toBeInTheDocument();
      expect(screen.getByText(/Enter a valid email/i)).toBeInTheDocument();
      expect(screen.getByText(/Please enter a message/i)).toBeInTheDocument();
    });
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it("submits without a phone number when phone is left blank", async () => {
    mockedPost.mockResolvedValueOnce(okResponse);
    renderForm();

    await userEvent.type(screen.getByPlaceholderText("Jane Doe"), "Jane Doe");
    await userEvent.type(
      screen.getByPlaceholderText("you@domain.com"),
      "jane@example.com"
    );
    await userEvent.type(
      screen.getByPlaceholderText(/Tell us how we can help/i),
      "I would like a demo."
    );
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(mockedPost).toHaveBeenCalledWith("/contact", {
        name: "Jane Doe",
        email: "jane@example.com",
        message: "I would like a demo.",
        phone: undefined,
      });
    });
  });

  it("includes the phone number when provided", async () => {
    mockedPost.mockResolvedValueOnce(okResponse);
    renderForm();

    await userEvent.type(screen.getByPlaceholderText("Jane Doe"), "Jane Doe");
    await userEvent.type(
      screen.getByPlaceholderText("you@domain.com"),
      "jane@example.com"
    );
    await userEvent.type(
      screen.getByPlaceholderText(/\+234/),
      "+2348000000000"
    );
    await userEvent.type(
      screen.getByPlaceholderText(/Tell us how we can help/i),
      "Call me."
    );
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(mockedPost).toHaveBeenCalledWith("/contact", {
        name: "Jane Doe",
        email: "jane@example.com",
        message: "Call me.",
        phone: "+2348000000000",
      });
    });
  });
});
