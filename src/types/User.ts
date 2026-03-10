export type User = {
  _id: string | null;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string | null;
  provider: string;
  picture: string;
  organization?: any;
  createdAt: Date | null;
  updatedAt: Date | null;
  refresh_token: string;
  __v: number | null;
  role?: 'Student' | 'Organization' | 'Individual' | 'Lecturer' | 'Admin';
};
