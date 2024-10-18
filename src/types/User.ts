export type User = {
  _id: string | null;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string | null;
  provider: string;
  picture: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  __v: number | null;
};
