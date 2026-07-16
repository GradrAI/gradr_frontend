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
import { usePostHog } from "@posthog/react";
import { usePaymentRail } from "@/hooks/usePaymentRail";

const Pricing = () => {
  const nav = useNavigate();
  const posthog = usePostHog();
  const { user, saveUser, selectedPaymentPlan, setSelectedPaymentPlan } = useStore();
  const { selectedRail, setSelectedRail, isLoading: railLoading } = usePaymentRail();

  const { data: paymentPlanData, isLoading: plansLoading } = useQuery({
    queryKey: ["paymentPlan", selectedRail],
    queryFn: async () => await api.get(`/paymentPlans`, { params: { rail: selectedRail } }),
    retry: false,
    enabled: !!selectedRail,
    select: (data) => data.data,
  });

  const [activeTab, setActiveTab] = useState<"subscription" | "credit_pack">("subscription");

  const subscriptionPlans = useMemo(() => {
    return (paymentPlanData?.data as PaymentPlanType[] || [])
      .filter((p) => p.planType === "subscription" && p.rail === selectedRail);
  }, [paymentPlanData, selectedRail]);

  const creditPacks = useMemo(() => {
    return (paymentPlanData?.data as PaymentPlanType[] || [])
      .filter((p) => p.planType === "credit_pack" && p.rail === selectedRail);
  }, [paymentPlanData, selectedRail]);

  const activePlans = activeTab === "subscription" ? subscriptionPlans : creditPacks;

  const [isProcessing, setIsProcessing] = useState(false);

  const formatPlanPrice = (plan: PaymentPlanType) => {
    if (plan.name.toLowerCase() === "enterprise" || plan.planKey === "enterprise_custom") {
      return "Custom";
    }
    if (plan.rail === "paystack_ngn") {
      return `₦${formatNumber(plan.amount)}`;
    } else {
      return `$${plan.amountUsd}`;
    }
  };

  const getDisplayInterval = (plan: PaymentPlanType) => {
    if (plan.name.toLowerCase() === "enterprise" || plan.planKey === "enterprise_custom") {
      return "";
    }
    return plan.displayInterval || plan.billingLabel || "";
  };

  const handleSubmit = async () => {
    if (selectedPaymentPlan?.name?.toLowerCase() === "enterprise" || selectedPaymentPlan?.planKey === "enterprise_custom") {
      posthog.capture("payment_plan_selected", { 
        plan_name: selectedPaymentPlan.name, 
        plan_type: selectedPaymentPlan.planType, 
        plan_amount: selectedPaymentPlan.amount, 
        is_enterprise: true 
      });
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

    posthog.capture("payment_plan_selected", { 
      plan_name: selectedPaymentPlan.name, 
      plan_type: selectedPaymentPlan.planType, 
      plan_amount: selectedPaymentPlan.amount, 
      plan_credits: selectedPaymentPlan.credits 
    });

    setIsProcessing(true);

    // 1. Handle Free Plan
    if (selectedPaymentPlan.amount === 0 && selectedPaymentPlan.amountUsd === 0) {
      try {
        const res = await api.post("/payment/freemium", { planKey: selectedPaymentPlan.planKey });
        if (res.data?.organization && user) {
          saveUser({
            ...user,
            organization: res.data.organization
          });
        }
        toast.success("Free plan activated successfully!");
        posthog.capture("free_plan_activated", { plan_name: selectedPaymentPlan.name });
        nav("../confirmation?free=1");
      } catch (err: any) {
        console.error("Free plan activation failed:", err);
        toast.error("Failed to activate free plan. Please try again.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    posthog.capture("payment_initiated", { 
      plan_name: selectedPaymentPlan.name, 
      plan_type: selectedPaymentPlan.planType, 
      amount: selectedPaymentPlan.amount || selectedPaymentPlan.amountUsd
    });

    // 2. Handle Creem USD Plan
    if (selectedRail === "creem_usd") {
      try {
        const res = await api.post("/payment/creem/checkout", { planId: selectedPaymentPlan._id });
        if (res.data?.checkoutUrl) {
          window.location.href = res.data.checkoutUrl;
        } else {
          throw new Error("Checkout URL was not returned by the server");
        }
      } catch (err: any) {
        posthog.capture("payment_init_failed", { error: err.message, rail: "creem_usd" });
        toast.error("Failed to redirect to Creem checkout. Please try again.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // 3. Handle Paystack NGN Plan
    try {
      const res = await api.post("/payment", { planId: selectedPaymentPlan._id });
      if (res.data?.data) {
        const popup = new PaystackPop();
        const { access_code } = res.data.data;
        popup.resumeTransaction(access_code, {
          onSuccess: async (tx: PayStackResponse) => {
            nav(`../confirmation?reference=${tx.reference}`);
          },
          onError: (err: { message: string }) => {
            toast.error("Payment failed: " + err.message);
            setIsProcessing(false);
          },
          onCancel: () => {
            toast.error("Payment cancelled");
            setIsProcessing(false);
          },
        });
      } else {
        throw new Error("Invalid initialization response");
      }
    } catch (err: any) {
      posthog.capture("payment_init_failed", { error: err.message, rail: "paystack_ngn" });
      toast.error("Payment initialization failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const pageLoading = plansLoading || railLoading;

  if (pageLoading) {
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
          Choose prepaid NGN credits or international USD checkout. Local credits roll over through the relevant academic period.
        </p>
      </div>

      {/* Rail Toggle */}
      <div className="flex flex-col items-center mb-8">
        <div className="inline-flex items-center p-1 gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 mb-2">
          <button
            onClick={() => {
              setSelectedRail("paystack_ngn");
              setSelectedPaymentPlan(null);
            }}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              selectedRail === "paystack_ngn"
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pay in Naira (Paystack)
          </button>
          <button
            onClick={() => {
              setSelectedRail("creem_usd");
              setSelectedPaymentPlan(null);
            }}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              selectedRail === "creem_usd"
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pay in USD (International)
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          We suggest a default based on your browser country. You can switch at any time before checkout.
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
            Plans
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
              <div className="flex flex-col items-center justify-center mt-3">
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatPlanPrice(plan)}
                </span>
                {getDisplayInterval(plan) && (
                  <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                    {getDisplayInterval(plan)}
                  </span>
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
          disabled={!selectedPaymentPlan || isProcessing}
          size="lg"
          className="min-w-[200px] bg-primary hover:bg-primary/90"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (selectedPaymentPlan?.name?.toLowerCase() === "enterprise" || selectedPaymentPlan?.planKey === "enterprise_custom") ? (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Contact Us
            </>
          ) : (selectedPaymentPlan?.amount === 0 && selectedPaymentPlan?.amountUsd === 0) ? (
            "Get Started"
          ) : (
            "Proceed to Payment"
          )}
        </Button>

        {selectedPaymentPlan && (
          <div className="text-center text-sm text-gray-500 max-w-md">
            <p>
              You've selected the <strong>{selectedPaymentPlan.name}</strong> plan.
            </p>
            {selectedPaymentPlan?.name?.toLowerCase() !== "enterprise" &&
              selectedPaymentPlan?.planKey !== "enterprise_custom" &&
              (selectedPaymentPlan?.amount > 0 || selectedPaymentPlan?.amountUsd > 0) && (
                <p className="mt-1 font-medium text-slate-600 dark:text-slate-300">
                  {selectedRail === "paystack_ngn"
                    ? "You'll pay securely with Paystack. This is a prepaid credit grant, not an automatic monthly card charge."
                    : "You'll be redirected to Creem for secure international checkout."}
                </p>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
