export type PaymentPlan = {
  _id: string;
  name: string;
  description: string;
  planType: "subscription" | "credit_pack";
  amount: number;
  amountUsd: number;
  currency: string;
  features: string[];
  credits: number;
  creditExpiry: string;
  duration: string;
  maxUsers: number;
  overageRate: string;
  highlight: boolean;
  sortOrder: number;
  createdAt: string;
};
