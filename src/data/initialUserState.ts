import { User } from "@/types/User";

const initialUserState: User = {
  _id: null,
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  password: "",
  provider: "",
  picture: "",
  createdAt: null,
  updatedAt: null,
  refresh_token: "",
  __v: 0,
};

export default initialUserState;
