import api from "@/lib/axios";
import useStore from "@/state";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  XCircle,
  Loader2,
  RefreshCw,
  Mail,
  ArrowLeft
} from "lucide-react";
import { usePostHog } from '@posthog/react'

const PostPayment = () => {
  const nav = useNavigate();
  const posthog = usePostHog();
  const { user, selectedPaymentPlan } = useStore();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");

  const isFreePlan = !reference && selectedPaymentPlan && selectedPaymentPlan.amount === 0;

  const { data, isSuccess, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["verifyPayment", reference],
    queryFn: async () => await api.get(`/payment/verify/${reference}`),
    enabled: Boolean(reference?.length),
    retry: false, // Don't auto retry so we can show the server error state
  });

  const isStudent = user?.role === "student";

  useEffect(() => {
    // For free plans, we can just redirect them since they don't go through Paystack
    if (isFreePlan) {
      toast.success("Free plan activated!", { id: "payment-verification" });
      posthog.capture("free_plan_activated", { 
        plan_name: selectedPaymentPlan?.name, 
        plan_type: selectedPaymentPlan?.planType 
      });
      if (isStudent) nav("/student/dashboard");
      else nav("/app/assessments");
      return;
    }

    if (isSuccess && data?.data?.success) {
      toast.success("Payment verified successfully!", {
        id: "payment-verification",
      });
      
      posthog.capture("payment_completed", { 
        payment_reference: reference 
      });

      // Redirect immediately. Do not show an intermediate screen.
      if (isStudent) nav("/student/dashboard");
      else nav("/app/assessments");
    }
  }, [data, isSuccess, isFreePlan, isStudent, nav, posthog, reference, selectedPaymentPlan]);

  const handleRetry = () => {
    refetch();
  };

  const handleGoBack = () => {
    nav("/auth/pricing");
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:contact@gradrai.com";
  };

  if (isFreePlan) {
    return null; // Will redirect immediately in useEffect
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full min-h-[600px] flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
          <CardContent className="text-center flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <h2 className="text-xl font-semibold text-gray-800">Verifying Payment...</h2>
            <p className="text-sm text-gray-500">Please wait while we securely confirm your transaction.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state (Payment failure or Server error)
  if (isError || (isSuccess && !data?.data?.success)) {
    const isServerError = isError && (error as any)?.response?.status === 500;
    const errorMessage = isError 
      ? ((error as any)?.response?.data?.error || "We could not confirm your payment. This may be a temporary issue.")
      : (data?.data?.error || "Your payment was not successful.");

    return (
      <div className="w-full min-h-[600px] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-brand-danger-100 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 w-16 h-16 bg-brand-danger-50 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-brand-danger-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Something went wrong with your payment
            </CardTitle>
            <CardDescription className="text-base text-gray-600 mt-2">
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="flex flex-col gap-3">
              {isServerError ? (
                <Button id="payment-retry-button" onClick={handleRetry} className="w-full h-12 text-base">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Retry Verification
                </Button>
              ) : (
                <Button id="payment-back-button" onClick={handleGoBack} className="w-full h-12 text-base">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Return to Payment Page
                </Button>
              )}
              <Button
                id="payment-support-button"
                variant="outline"
                onClick={handleContactSupport}
                className="w-full h-12 text-base"
              >
                <Mail className="w-5 h-5 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback while waiting for useEffect redirect
  return null;
};

export default PostPayment;
