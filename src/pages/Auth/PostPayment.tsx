import api from "@/lib/axios";
import useStore from "@/state";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
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
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { usePostHog } from "@posthog/react";

const PostPayment = () => {
  const nav = useNavigate();
  const posthog = usePostHog();
  const { user, selectedPaymentPlan, saveUser } = useStore();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  const isFreeQuery = searchParams.get("free") === "1";

  const isStudent = user?.role === "student";

  const [retryCount, setRetryCount] = useState(0);

  // Query for verifying payment (used for paid plans)
  const { data, isSuccess, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["verifyPayment", reference],
    queryFn: async () => await api.get(`/payment/verify/${reference}`),
    enabled: !!reference,
    retry: 1,
  });

  const processedRef = useRef(false);

  // 1. Handle Free plans
  useEffect(() => {
    if (isFreeQuery && !processedRef.current) {
      processedRef.current = true;
      toast.success("Account set up successfully!", { id: "org-creation" });
      setTimeout(() => {
        if (isStudent) nav("/student/dashboard");
        else nav("/app/assessments");
      }, 2000);
    }
  }, [isFreeQuery, isStudent, nav]);

  // 2. Handle Paid plans
  useEffect(() => {
    if (isLoading || !selectedPaymentPlan || !user || processedRef.current || isFreeQuery) return;

    if (reference && isSuccess && data?.data) {
      const responseData = data.data;

      if (responseData.entitlementStatus === "processed") {
        processedRef.current = true;
        toast.success("Payment verified successfully!", { id: "payment-verification" });
        
        posthog.capture("payment_completed", { 
          plan_name: selectedPaymentPlan?.name,
          payment_reference: reference 
        });

        // Update local user state if the backend returned the organization
        if (responseData.organization) {
          saveUser({
            ...user,
            organization: responseData.organization
          });
        }

        setTimeout(() => {
          if (isStudent) nav("/student/dashboard");
          else nav("/app/assessments");
        }, 2000);
      } else if (responseData.entitlementStatus === "webhook_pending") {
        if (retryCount < 3) {
          const timer = setTimeout(() => {
            setRetryCount(prev => prev + 1);
            refetch();
          }, 3000);
          return () => clearTimeout(timer);
        } else {
          // Bounded retries exhausted but transaction verified by gateway
          processedRef.current = true;
          toast.success("Payment received!", { id: "payment-verification" });
        }
      }
    }
  }, [data, isSuccess, isLoading, isFreeQuery, isStudent, nav, posthog, reference, selectedPaymentPlan, user, saveUser, retryCount, refetch]);

  const handleRetry = () => {
    setRetryCount(0);
    refetch();
  };

  const handleGoBack = () => {
    nav("/auth/pricing");
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:contact@gradrai.com";
  };

  const handleProceedToDashboard = () => {
    if (isStudent) nav("/student/dashboard");
    else nav("/app/assessments");
  };

  // Loading state
  if ((isLoading && !isFreeQuery) || (reference && data?.data?.entitlementStatus === "webhook_pending" && retryCount < 3)) {
    return (
      <div className="w-full min-h-[600px] flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
          <CardContent className="text-center flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <h2 className="text-xl font-semibold text-gray-800">
              {retryCount > 0 ? "Applying purchase to account..." : "Verifying Payment..."}
            </h2>
            <p className="text-sm text-gray-500">
              {retryCount > 0 
                ? `Webhook confirmation is pending. Retrying application (Attempt ${retryCount}/3)...`
                : "Please wait while we finalize your setup."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Webhook Pending State (Retries exhausted but gateway success)
  if (reference && isSuccess && data?.data?.entitlementStatus === "webhook_pending" && retryCount >= 3) {
    return (
      <div className="w-full min-h-[600px] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-amber-100 shadow-lg text-center">
          <CardHeader className="pb-2">
            <div className="mx-auto mb-4 w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-8 h-8 text-amber-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Payment Received
            </CardTitle>
            <CardDescription className="text-base text-gray-600 mt-2">
              Payment received. Your credits will appear once Paystack confirms the webhook.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Button onClick={handleProceedToDashboard} className="w-full h-12 text-base">
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={handleRetry} className="w-full h-12 text-base">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Check Status Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError || (isSuccess && !data?.data)) {
    const errorMessage = isError 
      ? ((error as any)?.response?.data?.error || "Payment confirmation failed.")
      : "Your payment was not successful.";

    return (
      <div className="w-full min-h-[600px] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-100 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Setup Error
            </CardTitle>
            <CardDescription className="text-base text-gray-600 mt-2">
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="flex flex-col gap-3">
              <Button id="payment-retry-button" onClick={handleRetry} className="w-full h-12 text-base">
                <RefreshCw className="w-5 h-5 mr-2" />
                Retry Verification
              </Button>
              <Button id="payment-back-button" variant="outline" onClick={handleGoBack} className="w-full h-12 text-base">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Pricing
              </Button>
              <Button
                id="payment-support-button"
                variant="ghost"
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

  // Success state (Free or Paid success redirection)
  if (isFreeQuery || (isSuccess && data?.data?.entitlementStatus === "processed")) {
    return (
      <div className="w-full min-h-[600px] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-100 shadow-lg text-center">
          <CardContent className="pt-10 pb-10 space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Success!</h2>
            <p className="text-gray-600">Your account is ready. Redirecting you to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default PostPayment;
