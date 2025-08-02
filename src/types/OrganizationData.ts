export type OrganizationData = {
  name: string;
  physical_address?: string;
  email?: string;
  phone_number?: string;
  workspace_type: "personal" | "team";
  payment_plan_id: string;
};
