export interface IPaymentPlans {
  paymentPlans: IPaymentPlan[];
}

export interface IPaymentPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_cycle: "monthly" | "yearly" | "one-time";
  features: string[];
  limits: {
    max_members: number;
    max_courses: number;
    max_students: number;
    max_storage_gb: number;
    max_gradings_per_month: number;
  };
  is_active: boolean;
  is_popular?: boolean;
  created_at: Date;
  updated_at: Date;
}
