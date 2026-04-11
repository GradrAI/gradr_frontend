import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Mail, Loader2, CreditCard, Package } from "lucide-react";
import toast from "react-hot-toast";
import useStore from "@/state";
import PaystackPop from "@paystack/inline-js";
import type { PaymentPlan as PaymentPlanType } from "@/types/PaymentPlan";
import api from "@/lib/axios";
import { formatNumber } from "@/lib/formatNumber";
import { PayStackResponse } from "@/types/PayStackResponse";
import { useState, useMemo } from "react";

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

  const [activeTab, setActiveTab] = useState<"subscription" | "credit_pack">("subscription");

  const subscriptionPlans = useMemo(
    () => (paymentPlanData?.data as PaymentPlanType[] || []).filter((p) => p.planType === "subscription"),
    [paymentPlanData]
  );
  const creditPacks = useMemo(
    () => (paymentPlanData?.data as PaymentPlanType[] || []).filter((p) => p.planType === "credit_pack"),
    [paymentPlanData]
  );

  const activePlans = activeTab === "subscription" ? subscriptionPlans : creditPacks;

  const { mutate: paymentMutate, isPending: paymentPending } = useMutation({
    mutationKey: ["payment"],
    mutationFn: async (data: { email: string; amount: number }) =>
      await api.post("/payment", data),
  });

  const handleSubmit = () => {
    if (selectedPaymentPlan?.name?.toLowerCase() === "enterprise") {
      window.open(
        "mailto:support@gradrai.com?subject=Request for Enterprise plan&body=Hello there, I would like to request for an Enterprise plan on your platform",
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

  if (plansLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Loading payment plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Choose Your Plan
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select the perfect plan for your grading needs
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center p-1 gap-2 rounded-xl bg-slate-100 dark:bg-slate-800">
          <button
            onClick={() => {
              setActiveTab("subscription");
              setSelectedPaymentPlan(null);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "subscription"
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Subscriptions
          </button>
          <button
            onClick={() => {
              setActiveTab("credit_pack");
              setSelectedPaymentPlan(null);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "credit_pack"
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="h-4 w-4" />
            Credit Packs
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${activePlans.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-6 mb-8`}>
        {activePlans.map((plan: PaymentPlanType) => (
          <Card
            key={plan._id}
            className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedPaymentPlan?._id === plan._id
                ? "ring-2 ring-primary shadow-lg"
                : "hover:shadow-md"
            } ${plan.highlight ? "border-primary/50" : ""}`}
            onClick={() => setSelectedPaymentPlan(plan)}
          >
            {plan.highlight && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary hover:bg-primary/90">
                <Star className="w-3 h-3 mr-1" />
                {activeTab === "credit_pack" ? "Best Value" : "Popular"}
              </Badge>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {plan.name}
              </CardTitle>
              {plan.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.description}
                </p>
              )}
              <div className="flex items-center justify-center gap-1 mt-3">
                {plan.name.toLowerCase() === "enterprise" ? (
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Custom
                  </span>
                ) : (
                  <>
                    <span className="text-sm text-gray-500">₦</span>
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {formatNumber(plan.amount)}
                    </span>
                    {activeTab === "subscription" && plan.amount > 0 && (
                      <span className="text-sm text-gray-500">/month</span>
                    )}
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {/* Credit info */}
              {plan.credits > 0 && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 text-center">
                  <span className="text-sm font-semibold text-primary">
                    {plan.credits} credits
                  </span>
                  {plan.creditExpiry && (
                    <span className="text-xs text-muted-foreground ml-1">
                      · {plan.creditExpiry}
                    </span>
                  )}
                </div>
              )}

              {/* Feature list */}
              <ul className="mb-4 space-y-2">
                {plan.features.map((feat, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
                {plan.maxUsers > 1 && (
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Up to {plan.maxUsers} user seats</span>
                  </li>
                )}
              </ul>

              <div className="flex items-center justify-center">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPaymentPlan?._id === plan._id
                      ? "border-primary bg-primary"
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
          className="min-w-[200px] bg-primary hover:bg-primary/90"
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
            {selectedPaymentPlan?.name?.toLowerCase() !== "enterprise" &&
              selectedPaymentPlan?.amount > 0 && (
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
