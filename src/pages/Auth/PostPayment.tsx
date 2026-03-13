import api from "@/lib/axios";
import useStore from "@/state";
import { OrganizationData } from "@/types/OrganizationData";
import { useMutation, useQuery } from "@tanstack/react-query";
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
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

const PostPayment = () => {
  const nav = useNavigate();
  const { user, saveUser, selectedPaymentPlan, organizationData } = useStore();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");

  const isFreePlan = !reference && selectedPaymentPlan && selectedPaymentPlan.amount === 0;

  const { data, isSuccess, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["verifyPayment", reference],
    queryFn: async () => await api.get(`/payment/verify/${reference}`),
    enabled: Boolean(reference?.length),
    retry: 3,
    retryDelay: 2000,
  });

  const {
    isSuccess: orgIsSuccess,
    isPending: orgIsPending,
    isIdle: orgIsIdle,
    isError: orgIsError,
    error: orgError,
    data: orgData,
    mutate: organizationMutate,
  } = useMutation({
    mutationKey: ["organization"],
    mutationFn: async (data: OrganizationData) => {
      const orgId = typeof user?.organization === "object" ? user?.organization?._id : user?.organization;
      if (orgId) {
        return await api.put(`/organizations/${orgId}`, data);
      }
      return await api.post("/organizations", data);
    },
  });

  useEffect(() => {
    if (isLoading) {
      toast.loading("Verifying your payment...", {
        id: "payment-verification",
      });
    }

    if (((isSuccess && data) || isFreePlan) && orgIsIdle) {
      if (reference) {
        toast.success("Payment verified successfully!", {
          id: "payment-verification",
        });
      } else {
        toast.success("Free plan activated!", {
          id: "payment-verification",
        });
      }
      toast.loading("Setting up your organization...", { id: "org-creation" });

      organizationMutate({
        ...organizationData,
        paymentPlan: String(selectedPaymentPlan?._id),
        organizationType: user?.role === "lecturer" ? "individual" : "institution",
      });
    }

    if (isError) {
      toast.error("Payment verification failed", {
        id: "payment-verification",
      });
    }
  }, [
    data,
    isSuccess,
    isLoading,
    isError,
    error,
    organizationData,
    selectedPaymentPlan,
    organizationMutate,
    isFreePlan,
    reference,
    orgIsIdle
  ]);

  useEffect(() => {
    if (orgIsError) {
      toast.error("Failed to create organization", { id: "org-creation" });
    }

    if (orgIsPending) {
      toast.loading("Creating your organization...", { id: "org-creation" });
    }

    if (orgIsSuccess && orgData) {
      toast.success("Organization created successfully!", {
        id: "org-creation",
      });
      
      // Update store with new organization data
      if (user) {
        saveUser({
          ...user,
          organization: orgData.data?.data || user.organization
        });
      }

      setTimeout(() => {
        nav("/app/assessments");
      }, 2000);
    }
  }, [orgIsSuccess, orgIsError, orgIsPending, orgData, nav, user, saveUser]);

  const handleRetry = () => {
    refetch();
  };

  const handleGoToDashboard = () => {
    nav("/app/assessments");
  };

  const handleGoBack = () => {
    nav("/sign-up/payment-plan");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full min-h-[600px] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle>{isFreePlan ? "Setting Up Your Account" : "Verifying Payment"}</CardTitle>
            <CardDescription>
              {isFreePlan 
                ? "Please wait while we set up your free account..." 
                : "Please wait while we confirm your payment..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Checking payment status</p>
              <p>• Validating transaction</p>
              <p>• Preparing your account</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="w-full min-h-[600px] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">
              Payment Verification Failed
            </CardTitle>
            <CardDescription>
              We couldn't verify your payment. This might be a temporary issue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Your payment may still be processing</p>
              <p>• Network issues may have occurred</p>
              <p>• The transaction may need more time</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Verification
              </Button>
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="w-full"
              >
                Go Back to Payment Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Organization creation pending
  if ((isSuccess || isFreePlan) && orgIsPending) {
    return (
      <div className="w-full min-h-[600px] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle>{isFreePlan ? "Setting Up Your Account" : "Payment Successful!"}</CardTitle>
            <CardDescription>
              {isFreePlan ? "Creating your account..." : "Setting up your organization..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
                <span className="text-sm text-gray-600">
                  Creating your workspace
                </span>
              </div>
              <div className="text-xs text-gray-500">
                <p>
                  Plan: <strong>{selectedPaymentPlan?.name}</strong>
                </p>
                <p>This will take just a moment...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Organization creation error
  if ((isSuccess || isFreePlan) && orgIsError) {
    return (
      <div className="w-full min-h-[600px] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-yellow-600">Setup Issue</CardTitle>
            <CardDescription>
              {isFreePlan 
                ? "We encountered an issue setting up your account." 
                : "Payment was successful, but we encountered an issue setting up your organization."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 text-center">
              <p>
                Don't worry - our team will resolve this shortly.
              </p>
            </div>
            <Button
              onClick={() =>
                (window.location.href = "mailto:support@gradrai.com")
              }
              className="w-full"
            >
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if ((isSuccess || isFreePlan) && orgIsSuccess) {
    return (
      <div className="w-full min-h-[600px] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">
              Welcome to GradrAI!
            </CardTitle>
            <CardDescription>
              Your account has been successfully set up
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm space-y-1">
                <p className="font-medium text-green-800">Account Details:</p>
                <p className="text-green-700">
                  Plan: <strong>{selectedPaymentPlan?.name}</strong>
                </p>
                <p className="text-green-700">
                  Status: <strong>Active</strong>
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>
                You'll be redirected to your dashboard in a moment, or click
                below to continue.
              </p>
            </div>
            <Button onClick={handleGoToDashboard} className="w-full">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback - should not reach here
  return (
    <div className="w-full min-h-[600px] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Processing...</CardTitle>
          <CardDescription>Please wait</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default PostPayment;
