export type ICallback = {
  access_token: string;
  user: {
    id: string;
    created_at: string;
    updated_at: string;
    org_member_id: null;
    email: string;
    first_name: string;
    last_name: string;
    provider: "google" | "local";
    picture: null;
    role: "user";
    email_verified: false;
    is_active: boolean;
    organisation: null;
  };
};
