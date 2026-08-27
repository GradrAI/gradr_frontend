import { isAxiosError } from "axios";
import api from "@/lib/axios";

export function isGoogleSheetsReauthError(error: unknown): boolean {
  if (!isAxiosError(error) || error.response?.status !== 401) return false;

  const message = String(
    error.response.data?.message || error.response.data?.error || ""
  );

  return message.includes("Re-authentication required");
}

export async function redirectToGoogleSheetsAuth(
  returnTo = window.location.pathname + window.location.search
): Promise<void> {
  const response = await api.get("/auth/google/sheets", {
    params: { returnTo },
  });

  window.location.href = response.data.authorizationUrl;
}
