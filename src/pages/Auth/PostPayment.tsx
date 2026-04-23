import api from "@/lib/axios";
import useStore from "@/state";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { usePostHog } from '@posthog/react'
import { OrganizationData } from "@/types/OrganizationData";

const PostPayment = () => {
  const nav = useNavigate();
  const posthog = usePostHog();
  const { user, selectedPaymentPlan, organizationData, saveUser } = useStore();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");

  const isFreePlan = !reference && selectedPaymentPlan && selectedPaymentPlan.amount === 0;
  const isStudent = user?.role === "student";

  // Mutation for creating organization (used for free plans)
  const { 
    mutate: organizationMutate, 
    isPending: orgIsPending, 
    isSuccess: orgIsSuccess, 
    isError: orgIsError, 
    error: orgError,
    data: orgData,
    isIdle: orgIsIdle
  } = useMutation({
    mutationKey: ["createOrganization"],
    mutationFn: async (data: OrganizationData) => await api.post("/organizations", data),
  });

  // Query for verifying payment (used for paid plans)
  const { data, isSuccess, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["verifyPayment", reference],
    queryFn: async () => await api.get(`/payment/verify/${reference}`),
    enabled: !!reference,
    retry: 1,
  });

  useEffect(() => {
    // Guards to ensure all data is ready
    if (isLoading || !selectedPaymentPlan || !user) return;

    if (isFreePlan && orgIsIdle) {
      // Free plans: Create organization manually
      toast.loading("Setting up your free account...", { id: "org-creation" });

      const finalOrgData = {
        organizationType: (user?.role === "lecturer" || user?.role === "student") ? "individual" : "institution",
        ...organizationData,
        paymentPlan: String(selectedPaymentPlan?._id),
      };

      if (!finalOrgData.name) finalOrgData.name = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username;
      if (!finalOrgData.email) finalOrgData.email = user.email;
      if (!finalOrgData.phoneNumber) finalOrgData.phoneNumber = "N/A";
      if (!finalOrgData.physicalAddress) finalOrgData.physicalAddress = "N/A";
      
      organizationMutate(finalOrgData as OrganizationData);
    } 
    
    if (reference && isSuccess && data?.data) {
      // Paid plans: The backend verifyTransaction already created the organization
      toast.success("Payment verified successfully!", { id: "payment-verification" });
      
      posthog.capture("payment_completed", { 
        plan_name: selectedPaymentPlan?.name,
        payment_reference: reference 
      });

      // Update local user state if the backend returned the organization
      if (data.data.organization) {
        saveUser({
          ...user,
          organization: data.data.organization
        });
      }

      setTimeout(() => {
        if (isStudent) nav("/student/dashboard");
        else nav("/app/assessments");
      }, 2000);
    }
  }, [data, isSuccess, isLoading, isFreePlan, isStudent, nav, posthog, reference, selectedPaymentPlan, user, organizationData, organizationMutate, orgIsIdle, saveUser]);

  // Handle org creation success (for free plans)
  useEffect(() => {
    if (orgIsSuccess && orgData) {
      toast.success("Account set up successfully!", { id: "org-creation" });
      
      posthog.capture("free_plan_activated", { 
        plan_name: selectedPaymentPlan?.name 
      });

      saveUser({
        ...user,
        organization: orgData.data?.data || user?.organization
      } as any);

      setTimeout(() => {
        if (isStudent) nav("/student/dashboard");
        else nav("/app/assessments");
      }, 2000);
    }

    if (orgIsError) {
      toast.error("Failed to set up account", { id: "org-creation" });
    }
  }, [orgIsSuccess, orgIsError, orgData, nav, user, isStudent, saveUser, selectedPaymentPlan, posthog]);

  const handleRetry = () => {
    refetch();
  };

  const handleGoBack = () => {
    nav("/auth/pricing");
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:contact@gradrai.com";
  };

  // Loading state (Verifying paid plan or creating free org)
  if (isLoading || orgIsPending) {
    return (
      <div className="w-full min-h-[600px] flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
          <CardContent className="text-center flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <h2 className="text-xl font-semibold text-gray-800">
              {orgIsPending ? "Setting up your account..." : "Verifying Payment..."}
            </h2>
            <p className="text-sm text-gray-500">Please wait while we finalize your setup.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError || orgIsError || (isSuccess && !data?.data)) {
    const isServerError = (isError && (error as any)?.response?.status === 500) || orgIsError;
    const errorMessage = isError 
      ? ((error as any)?.response?.data?.error || "Payment confirmation failed.")
      : orgIsError 
        ? "Failed to create your organization."
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

  // Success state (Success message while waiting for redirect)
  if (orgIsSuccess || (isSuccess && data?.data)) {
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
