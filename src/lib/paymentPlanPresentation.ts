import type { PaymentPlan } from "@/types/PaymentPlan";

const planDetailKeys: Record<string, string> = {
  ngn_educator_monthly: "educator",
  usd_educator_monthly: "educator",
  ngn_educator_yearly: "educatorYearly",
  usd_educator_yearly: "educatorYearly",
  ngn_institution_monthly: "institution",
  usd_institution_monthly: "institution",
  ngn_institution_yearly: "institutionYearly",
  usd_institution_yearly: "institutionYearly",
};

export const getPlanDetailKey = (plan: PaymentPlan): string => {
  if (plan.planKey === "enterprise_custom" || plan.name.toLowerCase() === "enterprise") return "enterprise";
  if (plan.planType === "credit_pack") return "creditPack";
  if (plan.amount === 0 && plan.amountUsd === 0) return "trial";
  if (Object.prototype.hasOwnProperty.call(planDetailKeys, plan.planKey)) return planDetailKeys[plan.planKey];

  const normalizedName = plan.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (normalizedName.includes("institution") || normalizedName.includes("enterprise")) {
    return normalizedName.includes("year") ? "institutionYearly" : "institution";
  }
  if (normalizedName.includes("educator") || normalizedName.includes("teacher")) {
    return normalizedName.includes("year") ? "educatorYearly" : "educator";
  }
  return "default";
};

export const getBillingCopyKey = (plan: PaymentPlan): string => {
  if (plan.planKey === "enterprise_custom" || plan.name.toLowerCase() === "enterprise") return "pricing.institutionalTerms";
  if (plan.amount === 0 && plan.amountUsd === 0) return "pricing.trialGrant";
  if (plan.rail === "paystack_ngn") return "pricing.prepaidLabel";
  if (plan.planType === "credit_pack" || plan.creemProductType === "one_time") return "pricing.oneTimeLabel";
  if (plan.creemProductType === "recurring") {
    if (plan.duration === "monthly") return "pricing.monthlyLabel";
    if (plan.duration === "yearly") return "pricing.yearlyLabel";
    return "pricing.recurringLabel";
  }
  return "pricing.checkoutTerms";
};
