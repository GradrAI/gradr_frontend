export interface IRegisterResponse {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    created_at: Date;
    organisation?: {
      id: string;
      name: string;
      schema: string;
    };
    access_token: string;
  };
}

export interface IRegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}
