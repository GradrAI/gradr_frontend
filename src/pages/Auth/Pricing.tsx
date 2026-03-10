import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import useStore from "@/state";
import PaystackPop from "@paystack/inline-js";
import type { PaymentPlan as PaymentPlanType } from "@/types/PaymentPlan";
import api from "@/lib/axios";
import { formatNumber } from "@/lib/formatNumber";
import { PayStackResponse } from "@/types/PayStackResponse";

const Pricing = () => {
  const nav = useNavigate();
  const { user, selectedPaymentPlan, setSelectedPaymentPlan } =
    useStore();

  const { data: paymentPlanData, isLoading: plansLoading } = useQuery({
    queryKey: ["paymentPlan"],
    queryFn: async () => await api.get(`/paymentPlans`),
    retry: false,
    select: (data) => data.data,
  });

  const { mutate: paymentMutate, isPending: paymentPending } = useMutation({
    mutationKey: ["payment"],
    mutationFn: async (data: { email: string; amount: number }) =>
      await api.post("/payment", data),
    // select:res=>res.data.data
  });

  const handleSubmit = () => {
    if (selectedPaymentPlan?.name?.toLocaleLowerCase() === "custom") {
      window.open(
        "mailto:support@gradrai.com?subject=Request for custom plan&body=Hello there, I would like to request for a custom plan on your platform",
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    if (!user?.email || !selectedPaymentPlan) {
      toast.error("Please select a payment plan");
      return;
    }

    // Handle free plans
    if (selectedPaymentPlan.amount === 0) {
      nav("../confirmation");
      return;
    }

    paymentMutate(
      {
        email: user.email,
        amount: selectedPaymentPlan.amount,
      },
      {
        onSuccess: (data: any) => {
          if (data?.data?.data) {
            const popup = new PaystackPop();
            const { access_code } = data.data.data;
            popup.resumeTransaction(access_code, {
              onSuccess: async (tx: PayStackResponse) => {
                nav(`../confirmation?reference=${tx.reference}`);
              },
              onError: (err: { message: String }) =>
                toast.error("Payment failed: " + err.message),
              onCancel: () => toast.error("Payment cancelled"),
            });
          }
        },
        onError: (error: any) => {
          toast.error("Payment initialization failed. Please try again.");
        },
      }
    );
  };

  const isPopularPlan = (plan: PaymentPlanType) => {
    return (
      plan.name?.toLowerCase().includes("pro") ||
      plan.name?.toLowerCase().includes("standard")
    );
  };

  if (plansLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading payment plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Choose Your Plan
        </h1>
        <p className="text-gray-600">
          Select the perfect plan for your grading needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {paymentPlanData?.data?.map((plan: PaymentPlanType) => (
          <Card
            key={plan._id}
            className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedPaymentPlan?._id === plan._id
                ? "ring-2 ring-blue-500 shadow-lg"
                : "hover:shadow-md"
            } ${isPopularPlan(plan) ? "border-blue-200" : ""}`}
            onClick={() => setSelectedPaymentPlan(plan)}
          >
            {isPopularPlan(plan) && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600">
                <Star className="w-3 h-3 mr-1" />
                Popular
              </Badge>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">
                {plan.name}
              </CardTitle>
              <div className="flex items-center justify-center gap-1 mt-2">
                <span className="text-sm text-gray-500">{plan.currency}</span>
                <span className="text-3xl font-bold text-gray-900">
                  {formatNumber(plan.amount)}
                </span>
                <span className="text-sm text-gray-500">/month</span>
              </div>
            </CardHeader>

            <CardContent>
              {/* replace description with feature list */}
              <ul className="mb-4 space-y-2">
                {plan.features.map((feat, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
                
                {plan.maxGradableExams !== undefined && (
                  <li className="flex items-start gap-2 text-sm text-muted-foreground font-medium text-blue-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span>Grade up to {plan.maxGradableExams === 0 ? "Unlimited" : formatNumber(String(plan.maxGradableExams))} exams</span>
                  </li>
                )}
                {plan.maxGeneratableExams !== undefined && (
                  <li className="flex items-start gap-2 text-sm text-muted-foreground font-medium text-blue-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span>Generate up to {plan.maxGeneratableExams === 0 ? "Unlimited" : formatNumber(String(plan.maxGeneratableExams))} exams</span>
                  </li>
                )}
              </ul>

              <div className="flex items-center justify-center">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPaymentPlan?._id === plan._id
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedPaymentPlan?._id === plan._id && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        {!selectedPaymentPlan && (
          <p className="text-sm text-gray-500">
            Please select a plan to continue
          </p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!selectedPaymentPlan || paymentPending}
          size="lg"
          className="min-w-[200px] bg-blue-600 hover:bg-blue-700"
        >
          {paymentPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : selectedPaymentPlan?.name?.toLowerCase() === "enterprise" ? (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Contact Us
            </>
          ) : selectedPaymentPlan?.amount === 0 ? (
            "Get Started"
          ) : (
            "Proceed to Payment"
          )}
        </Button>

        {selectedPaymentPlan && (
          <div className="text-center text-sm text-gray-500 max-w-md">
            <p>
              You've selected the <strong>{selectedPaymentPlan.name}</strong>{" "}
              plan.
            </p>
            {selectedPaymentPlan?.name?.toLowerCase() !== "enterprise" && (
              <p className="mt-1">
                You'll be redirected to Paystack for secure payment processing.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
