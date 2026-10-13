import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import type { AxiosResponse } from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createInstance, type i18n } from "i18next";
import { I18nextProvider } from "react-i18next";
import en from "@/i18n/locales/en.json";
import fr from "@/i18n/locales/fr.json";
import ContactForm from "@/components/landing/ContactForm";
import api from "@/lib/axios";

vi.mock("@/lib/axios", () => ({
  default: { post: vi.fn() },
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

let queryClient: QueryClient;
let i18nInstance: i18n;

const renderForm = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18nInstance}>
        <ContactForm />
      </I18nextProvider>
    </QueryClientProvider>
  );

// Test double: the component ignores the response body, so shape is irrelevant.
const okResponse = { data: { success: true } } as unknown as AxiosResponse;

const mockedPost = vi.mocked(api.post);

describe("ContactForm", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    i18nInstance = createInstance();
    await i18nInstance.init({
      lng: "en",
      resources: {
        en: { translation: en },
        fr: { translation: fr },
      },
      interpolation: { escapeValue: false },
    });
  });

  it("shows validation errors for required fields on empty submit", async () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /^name/i })).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByRole("textbox", { name: /^email/i })).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByRole("textbox", { name: /^message/i })).toHaveAttribute("aria-invalid", "true");
    });
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it("submits without a phone number when phone is left blank", async () => {
    mockedPost.mockResolvedValueOnce(okResponse);
    renderForm();

    await userEvent.type(screen.getByRole("textbox", { name: /^name/i }), "Jane Doe");
    await userEvent.type(
      screen.getByRole("textbox", { name: /^email/i }),
      "jane@example.com"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: /^message/i }),
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

    await userEvent.type(screen.getByRole("textbox", { name: /^name/i }), "Jane Doe");
    await userEvent.type(
      screen.getByRole("textbox", { name: /^email/i }),
      "jane@example.com"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: /^phone/i }),
      "+2348000000000"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: /^message/i }),
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
