import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, RefreshCw, Mail, ArrowLeft, Home } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Error = () => {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");

  // Determine if this is likely a payment-related error based on URL parameters
  const isPaymentError = Boolean(reference);

  const handleAction = () => {
    if (isPaymentError) {
      // Re-trigger the callback flow with the stored reference
      nav(`/auth/confirmation?reference=${reference}`);
    } else {
      // For generic errors, try to go back or refresh
      window.location.reload();
    }
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:contact@gradrai.com";
  };

  const handleGoHome = () => {
    nav("/", { replace: true });
  };

  return (
    <div className="w-full h-dvh flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <Card className="w-full max-w-md border-brand-danger-100 shadow-xl animate-fade-in">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-20 h-20 bg-brand-danger-50 dark:bg-brand-danger-900/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-brand-danger-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isPaymentError ? "Something went wrong with your payment" : "Something went wrong"}
          </CardTitle>
          <CardDescription className="text-base text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
            {isPaymentError 
              ? "We could not confirm your payment. This may be a temporary issue. Our systems might still be processing the transaction."
              : "We've encountered an unexpected error. Please try refreshing the page or return to the home screen."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col gap-3">
            <Button 
              id="error-action-button"
              onClick={handleAction} 
              className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isPaymentError ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Retry Verification
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Again
                </>
              )}
            </Button>
            <Button
              id="error-support-button"
              variant="outline"
              onClick={handleContactSupport}
              className="w-full h-12 text-base font-medium border-slate-200 dark:border-slate-800 transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact Support
            </Button>
            <Button
              id="error-home-button"
              variant="ghost"
              onClick={handleGoHome}
              className="w-full h-10 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Error;
