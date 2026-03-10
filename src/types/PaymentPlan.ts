export type PaymentPlan = {
  _id: number;
  amount: number;
  createdAt: string;
  currency: string;
  features: string[];
  duration: string;
  name: string;
  maxGradableExams?: number;
  maxGeneratableExams?: number;
};
