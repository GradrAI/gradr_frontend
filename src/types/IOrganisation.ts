export enum WorkspaceType {
  PERSONAL = "personal",
  TEAM = "team",
}

export interface IJoinSettings {
  current_code: string;
  max_usages: number;
  enabled: boolean;
  usage_count: number;
  generated_at: Date;
  expires_at?: Date;
}

export interface IOrganisationResponse {
  organisation: IOrganisation;
}

export interface IOrganisation {
  id: string;
  name: string;
  description?: string;
  workspace_type: WorkspaceType;
  subdomain?: string;
  schema: string;
  join_settings?: IJoinSettings;
  created_at: Date;
  updated_at: Date;
  created_by: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  payment_plan: {
    id: string;
    name: string;
    price: number;
    features: string[];
  };
}
