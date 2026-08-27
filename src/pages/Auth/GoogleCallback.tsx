import { useLocation } from "react-router-dom";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

/**
 * Dedicated public route for Google OAuth callback.
 * Google redirects here with ?code=..., the hook exchanges
 * the code for a token and navigates to the appropriate page.
 */
const GoogleCallback = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  const state = params.get("state");

  useGoogleAuth(code, state);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="text-muted-foreground animate-pulse">
        Authenticating securely...
      </p>
    </div>
  );
};

export default GoogleCallback;
